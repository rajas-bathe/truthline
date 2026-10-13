import { createApp } from '../backend/src/app';
import { getDatabase } from '../backend/src/database/db';
import { runMigrations } from '../backend/src/database/migrations';
import { logger } from '../backend/src/security/logger';

let initialized = false;

function ensureInitialized() {
  if (!initialized) {
    try {
      const db = getDatabase();
      runMigrations(db);
      initialized = true;
    } catch (err: any) {
      logger.warn('Serverless database migration warning: ' + err.message);
    }
  }
}

const app = createApp();

export default function handler(req: any, res: any) {
  ensureInitialized();

  // If req.url got rewritten or needs normalization:
  if (req.originalUrl && req.originalUrl.startsWith('/api') && !req.originalUrl.startsWith('/api/index')) {
    req.url = req.originalUrl;
  } else if (req.url === '/api/index' || req.url === '/api' || req.url === '/api/') {
    const matchedPath = req.headers && req.headers['x-matched-path'];
    if (typeof matchedPath === 'string' && matchedPath.startsWith('/api') && matchedPath !== '/api/index') {
      req.url = matchedPath;
    }
  } else if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }

  return app(req, res);
}
