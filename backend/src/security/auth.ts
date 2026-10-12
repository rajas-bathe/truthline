import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

export interface SessionPayload {
  sessionId: string;
  client: string;
  createdAt: number;
  expiresAt: number;
}

export interface AuthenticatedRequest extends Request {
  session?: SessionPayload;
}

const TOKEN_LIFETIME_MS = 60 * 60 * 1000; // 1 hour

/**
 * Creates a signed short-lived session token
 */
export function generateSessionToken(client: string = 'extension'): { token: string; expiresAt: number; sessionId: string } {
  const sessionId = crypto.randomUUID();
  const createdAt = Date.now();
  const expiresAt = createdAt + TOKEN_LIFETIME_MS;

  const payload: SessionPayload = { sessionId, client, createdAt, expiresAt };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');

  const signature = crypto
    .createHmac('sha256', config.sessionSecret)
    .update(payloadStr)
    .digest('base64url');

  const token = `${payloadStr}.${signature}`;
  return { token, expiresAt, sessionId };
}

/**
 * Verifies and parses a signed session token
 */
export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadStr, signature] = parts;

  // Verify HMAC signature
  const expectedSig = crypto
    .createHmac('sha256', config.sessionSecret)
    .update(payloadStr)
    .digest('base64url');

  if (signature.length !== expectedSig.length) return null;
  const match = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
  if (!match) return null;

  try {
    const json = Buffer.from(payloadStr, 'base64url').toString('utf-8');
    const payload: SessionPayload = JSON.parse(json);

    // Check expiration
    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Express Middleware to require or validate session
 */
export function requireSessionAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['x-truthline-session'] || req.headers['authorization'];
  let rawToken: string | null = null;

  if (typeof authHeader === 'string') {
    if (authHeader.startsWith('Bearer ')) {
      rawToken = authHeader.substring(7).trim();
    } else {
      rawToken = authHeader.trim();
    }
  }

  if (!rawToken) {
    res.status(401).json({
      error: 'Authentication Required',
      message: 'Missing X-Truthline-Session token. Request a session at POST /api/auth/session first.'
    });
    return;
  }

  const session = verifySessionToken(rawToken);
  if (!session) {
    res.status(401).json({
      error: 'Invalid or Expired Session',
      message: 'The provided session token is invalid or has expired. Please obtain a fresh session.'
    });
    return;
  }

  req.session = session;
  next();
}

/**
 * Optional session auth: parses session if present, but continues if not
 */
export function optionalSessionAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers['x-truthline-session'] || req.headers['authorization'];
  if (typeof authHeader === 'string') {
    const raw = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : authHeader.trim();
    const session = verifySessionToken(raw);
    if (session) req.session = session;
  }
  next();
}
