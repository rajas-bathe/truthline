import rateLimit from 'express-rate-limit';
import { AuthenticatedRequest } from './auth';
import { config } from '../config/env';

export const verificationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.rateLimitMaxRequests, // default 60 requests per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: AuthenticatedRequest) => {
    // Key by session ID if present, otherwise by client IP
    if (req.session?.sessionId) {
      return `session:${req.session.sessionId}`;
    }
    return req.ip || req.socket.remoteAddress || 'unknown-client';
  },
  handler: (_req, res) => {
    res.status(429).json({
      error: 'Rate Limit Exceeded',
      message: 'Too many verification requests submitted in a short period. Please wait a few minutes before trying again.'
    });
  }
});

export const authRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // 30 session generations per 5 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || 'auth-client',
  handler: (_req, res) => {
    res.status(429).json({
      error: 'Too Many Session Requests',
      message: 'Rate limit exceeded on authentication endpoint.'
    });
  }
});
