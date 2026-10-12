import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { config } from '../config/env';
import { logger } from '../security/logger';

let dbInstance: DatabaseSync | null = null;

export function getDatabase(customPath?: string): DatabaseSync {
  if (dbInstance && !customPath) {
    return dbInstance;
  }

  let dbPath: string;
  if (process.env.VERCEL) {
    dbPath = '/tmp/truthline.db';
  } else {
    const rawPath = customPath || config.databasePath;
    dbPath =
      rawPath === ':memory:'
        ? rawPath
        : path.isAbsolute(rawPath)
          ? rawPath
          : path.resolve(__dirname, '../../', rawPath);
  }

  if (dbPath !== ':memory:') {
    try {
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } catch (e: any) {
      logger.warn('Failed to create DB directory, falling back to /tmp: ' + e.message);
      dbPath = '/tmp/truthline.db';
    }
  }

  logger.info(`Opening SQLite database at: ${dbPath}`);
  const db = new DatabaseSync(dbPath);

  // Enable WAL mode for better concurrency and busy timeout
  try {
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA foreign_keys = ON;');
  } catch (err: any) {
    logger.warn('Could not set PRAGMA journal_mode: ' + err.message);
  }

  if (!customPath) {
    dbInstance = db;
  }

  return db;
}

export function closeDatabase(): void {
  if (dbInstance) {
    try {
      dbInstance.close();
      logger.info('SQLite database closed.');
    } catch (e: any) {
      logger.warn('Error closing database: ' + e.message);
    }
    dbInstance = null;
  }
}
