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
  if (req.originalUrl && req.originalUrl.startsWith('/api')) {
    req.url = req.originalUrl;
  } else if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  return app(req, res);
}
