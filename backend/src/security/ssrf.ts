import dns from 'dns';
import net from 'net';
import http from 'http';
import https from 'https';
import { URL } from 'url';

export interface SafeFetchResult {
  content: string;
  status: number;
  finalUrl: string;
  contentType: string;
}

const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 10000;
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Checks if an IPv4 address is in private, loopback, or reserved ranges
 */
export function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
    return true; // invalid is treated as unsafe
  }

  const [a, b] = parts;

  // 0.0.0.0/8
  if (a === 0) return true;
  // 10.0.0.0/8
  if (a === 10) return true;
  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;
  // 169.254.0.0/16 (Link-local)
  if (a === 169 && b === 254) return true;
  // 172.16.0.0/12 (172.16.0.0 to 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.168.0.0/16
  if (a === 192 && b === 168) return true;
  // 100.64.0.0/10 (Carrier-grade NAT)
  if (a === 100 && b >= 64 && b <= 127) return true;
  // 198.18.0.0/15
  if (a === 198 && (b === 18 || b === 19)) return true;
  // Multicast / Reserved (224.0.0.0+)
  if (a >= 224) return true;

  return false;
}

/**
 * Checks if an IPv6 address is private, loopback, or reserved
 */
export function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  // Loopback & unspecified
  if (normalized === '::1' || normalized === '::') return true;

  // IPv4-mapped IPv6 (e.g., ::ffff:127.0.0.1)
  if (normalized.startsWith('::ffff:')) {
    const ipv4 = normalized.substring(7);
    if (net.isIPv4(ipv4)) {
      return isPrivateIPv4(ipv4);
    }
  }

  // Unique local addresses (fc00::/7) -> fc00 to fdff
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;

  // Link-local unicast (fe80::/10) -> fe80 to febf
  if (normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) {
    return true;
  }

  // Multicast (ff00::/8)
  if (normalized.startsWith('ff')) return true;

  return false;
}

/**
 * Validates a target URL against SSRF and private-network access
 */
export async function validateSafeUrl(urlStr: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    throw new Error(`Invalid URL format: "${urlStr}"`);
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Forbidden protocol: "${parsed.protocol}". Only HTTP and HTTPS are permitted.`);
  }

  const hostname = parsed.hostname.toLowerCase();

  // Disallow explicit localhost or metadata endpoints
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.arpa') ||
    hostname === 'metadata.google.internal' ||
    hostname === '169.254.169.254'
  ) {
    throw new Error(`Access to internal/private hostname "${hostname}" is blocked.`);
  }

  // If hostname is directly an IP literal
  if (net.isIP(hostname)) {
    if (net.isIPv4(hostname) && isPrivateIPv4(hostname)) {
      throw new Error(`Direct connection to private IP "${hostname}" is blocked.`);
    }
    if (net.isIPv6(hostname) && isPrivateIPv6(hostname)) {
      throw new Error(`Direct connection to private IPv6 "${hostname}" is blocked.`);
    }
    return parsed;
  }

  // Resolve hostname through DNS
  try {
    const addresses = await dns.promises.lookup(hostname, { all: true });
    if (!addresses || addresses.length === 0) {
      throw new Error(`Unable to resolve hostname "${hostname}".`);
    }

    for (const record of addresses) {
      if (record.family === 4 && isPrivateIPv4(record.address)) {
        throw new Error(`SSRF Blocked: Hostname "${hostname}" resolves to private IP "${record.address}".`);
      }
      if (record.family === 6 && isPrivateIPv6(record.address)) {
        throw new Error(`SSRF Blocked: Hostname "${hostname}" resolves to private IPv6 "${record.address}".`);
      }
    }
  } catch (err: any) {
    if (err.message.includes('SSRF Blocked')) throw err;
    throw new Error(`DNS resolution failed for "${hostname}": ${err.message}`);
  }

  return parsed;
}

/**
 * Safely fetches a URL with SSRF checks, redirect validation, timeout, and size limits
 */
export async function safeFetchUrl(initialUrl: string, redirectsRemaining = MAX_REDIRECTS): Promise<SafeFetchResult> {
  const validatedUrl = await validateSafeUrl(initialUrl);

  return new Promise((resolve, reject) => {
    const isHttps = validatedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const requestOptions = {
      method: 'GET',
      headers: {
        'User-Agent': 'TruthLine-AI-FactCheckBot/1.0 (+https://truthline.local; fact-check verification)',
        'Accept': 'text/html,application/xhtml+xml,application/json,text/plain;q=0.9',
        'Accept-Encoding': 'identity'
      },
      timeout: TIMEOUT_MS
    };

    const req = client.request(validatedUrl, requestOptions, async (res) => {
      // Handle redirects
      if (res.statusCode && [301, 302, 303, 307, 308].includes(res.statusCode)) {
        const location = res.headers.location;
        if (!location) {
          return reject(new Error('Redirect with no Location header received'));
        }

        if (redirectsRemaining <= 0) {
          return reject(new Error(`Max redirect limit (${MAX_REDIRECTS}) exceeded.`));
        }

        try {
          // Resolve relative redirects
          const redirectUrl = new URL(location, validatedUrl).toString();
          res.resume(); // consume response data to free up memory
          const nextRes = await safeFetchUrl(redirectUrl, redirectsRemaining - 1);
          return resolve(nextRes);
        } catch (redirectErr) {
          return reject(redirectErr);
        }
      }

      // Check status code
      if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 400) {
        return reject(new Error(`HTTP request failed with status code ${res.statusCode}`));
      }

      const contentType = res.headers['content-type'] || 'text/html';

      // Stream body with byte limit
      const chunks: Buffer[] = [];
      let totalBytes = 0;

      res.on('data', (chunk: Buffer) => {
        totalBytes += chunk.length;
        if (totalBytes > MAX_BYTES) {
          req.destroy(new Error(`Response exceeded maximum size limit of 5MB.`));
          return;
        }
        chunks.push(chunk);
      });

      res.on('end', () => {
        const bodyBuffer = Buffer.concat(chunks);
        const text = bodyBuffer.toString('utf-8');
        resolve({
          content: text,
          status: res.statusCode || 200,
          finalUrl: validatedUrl.toString(),
          contentType
        });
      });

      res.on('error', (err) => {
        reject(err);
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error(`Request timed out after ${TIMEOUT_MS / 1000} seconds.`));
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}
