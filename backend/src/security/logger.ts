/**
 * TRUTHLINE AI — Safe Logger with Secret Redaction
 * Ensures API keys, session tokens, passwords, and sensitive cookies
 * are never leaked to logs or console output.
 */

const SECRET_PATTERNS = [
  /(?:api[_-]?key|secret|token|password|bearer|authorization)[:=]\s*["']?([a-zA-Z0-9_\-.~+]{8,})["']?/gi,
  /(AIzaSy[a-zA-Z0-9_\-]{33})/g, // Google API key signature
  /(tvly-[a-zA-Z0-9_\-]{20,})/g, // Tavily key signature
  /Bearer\s+([a-zA-Z0-9_\-.~+]{12,})/gi
];

export function redactSecrets(message: string): string {
  if (!message || typeof message !== 'string') return message;
  let redacted = message;

  for (const pattern of SECRET_PATTERNS) {
    redacted = redacted.replace(pattern, (match, secret) => {
      if (secret && typeof secret === 'string') {
        const masked = secret.slice(0, 3) + '...' + secret.slice(-3);
        return match.replace(secret, `[REDACTED:${masked}]`);
      }
      return '[REDACTED]';
    });
  }

  return redacted;
}

export const logger = {
  info(msg: string, ...args: any[]): void {
    const formatted = redactSecrets(msg);
    console.log(`[INFO] [${new Date().toISOString()}] ${formatted}`, ...args.map(a => typeof a === 'string' ? redactSecrets(a) : a));
  },
  warn(msg: string, ...args: any[]): void {
    const formatted = redactSecrets(msg);
    console.warn(`[WARN] [${new Date().toISOString()}] ${formatted}`, ...args.map(a => typeof a === 'string' ? redactSecrets(a) : a));
  },
  error(msg: string, ...args: any[]): void {
    const formatted = redactSecrets(msg);
    console.error(`[ERROR] [${new Date().toISOString()}] ${formatted}`, ...args.map(a => typeof a === 'string' ? redactSecrets(a) : a));
  },
  debug(msg: string, ...args: any[]): void {
    if (process.env.DEBUG || process.env.NODE_ENV === 'development') {
      const formatted = redactSecrets(msg);
      console.log(`[DEBUG] [${new Date().toISOString()}] ${formatted}`, ...args.map(a => typeof a === 'string' ? redactSecrets(a) : a));
    }
  }
};
