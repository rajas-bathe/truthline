import { Router, Request, Response } from 'express';
import { generateSessionToken, verifySessionToken, AuthenticatedRequest } from '../security/auth';
import { authRateLimiter } from '../security/rateLimiter';

export const authRouter = Router();

authRouter.post('/session', authRateLimiter, (req: Request, res: Response) => {
  const clientName = (req.body?.client as string) || 'chrome-extension';
  const session = generateSessionToken(clientName);

  res.status(200).json({
    success: true,
    token: session.token,
    sessionId: session.sessionId,
    expiresAt: session.expiresAt
  });
});

authRouter.get('/validate', (req: AuthenticatedRequest, res: Response) => {
  const authHeader = req.headers['x-truthline-session'] || req.headers['authorization'];
  let rawToken: string | null = null;

  if (typeof authHeader === 'string') {
    rawToken = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : authHeader.trim();
  }

  if (!rawToken) {
    return res.status(401).json({ valid: false, error: 'No token provided' });
  }

  const payload = verifySessionToken(rawToken);
  if (!payload) {
    return res.status(401).json({ valid: false, error: 'Token is invalid or expired' });
  }

  res.status(200).json({ valid: true, session: payload });
});
