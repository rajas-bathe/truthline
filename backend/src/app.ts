import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { authRouter } from './routes/authRoutes';
import { verifyRouter } from './routes/verifyRoutes';
import { historyRouter } from './routes/historyRoutes';
import { healthRouter } from './routes/healthRoutes';
import { demoRouter } from './routes/demoRoutes';
import { redactSecrets, logger } from './security/logger';

export function createApp(): express.Application {
  const app = express();

  // Ensure uploads directory exists
  const uploadsDir = process.env.VERCEL ? '/tmp/uploads' : path.resolve(__dirname, '../../uploads');
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  } catch (err: any) {
    logger.warn('Could not create uploads directory: ' + err.message);
  }

  // 1. Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false // Allows extension API interaction
    })
  );

  // 2. CORS Configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, extension service workers, same-origin)
        if (!origin) return callback(null, true);

        // Always allow Vercel domains (*.vercel.app), localhost, and browser extensions
        if (
          process.env.NODE_ENV === 'development' ||
          process.env.VERCEL ||
          origin.includes('vercel.app') ||
          origin.includes('localhost') ||
          origin.includes('127.0.0.1') ||
          origin.startsWith('chrome-extension://')
        ) {
          return callback(null, true);
        }

        // Check configurable ALLOWED_ORIGINS
        const allowedOriginsEnv = process.env.ALLOWED_ORIGINS
          ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
          : ['*'];

        if (allowedOriginsEnv.includes('*')) {
          return callback(null, true);
        }

        const isAllowedByEnv = allowedOriginsEnv.some((allowed) => {
          if (allowed.endsWith('*')) {
            return origin.startsWith(allowed.slice(0, -1));
          }
          return allowed === origin;
        });

        if (isAllowedByEnv) {
          return callback(null, true);
        }

        // Always allow public web origins instead of throwing 500
        return callback(null, true);
      },
      methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Truthline-Session'],
      credentials: true
    })
  );

  // 3. Body Parsers with 50mb limit for base64 encoded files
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // 4. Request Logging with Secret Redaction
  app.use((req: Request, _res: Response, next: NextFunction) => {
    logger.debug(`${req.method} ${req.path}`);
    next();
  });

  // 5. Mount API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/verify', verifyRouter);
  app.use('/api/history', historyRouter);
  app.use('/api/health', healthRouter);
  app.use('/api/demo', demoRouter);

  // Root welcome & API info
  const welcomeHandler = (_req: Request, res: Response) => {
    res.json({
      name: 'TRUTHLINE AI — Verification Server',
      tagline: "DON'T JUST FORWARD. VERIFY.",
      status: 'ONLINE',
      docs: '/api/health'
    });
  };
  app.get('/api', welcomeHandler);
  app.get('/', (_req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
      return next();
    }
    welcomeHandler(_req, res);
  });

  // After all API routes, serve frontend static files in production
  if (process.env.NODE_ENV === 'production') {
    const frontendPath = path.join(__dirname, '../../frontend/dist');
    app.use(express.static(frontendPath));
    app.get('*', (req: Request, res: Response) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(frontendPath, 'index.html'));
      }
    });
  }

  // 6. Centralized Error Handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const safeErrorMsg = redactSecrets(err.message || 'Internal server error');
    logger.error('Unhandled Application Error: ' + safeErrorMsg);

    res.status(err.status || 500).json({
      error: 'Server Error',
      message: safeErrorMsg
    });
  });

  return app;
}
