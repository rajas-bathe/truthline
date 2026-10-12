import { createApp } from './app';
import { config } from './config/env';
import { getDatabase, closeDatabase } from './database/db';
import { runMigrations } from './database/migrations';
import { VerificationRepository } from './database/repository';
import { logger } from './security/logger';

async function bootstrap() {
  logger.info('====================================================');
  logger.info('  TRUTHLINE AI — Claim Verification Server Startup  ');
  logger.info('  Tagline: "DON\'T JUST FORWARD. VERIFY."            ');
  logger.info('====================================================');

  // 1. Initialize SQLite Database & Schema Migrations
  try {
    const db = getDatabase();
    runMigrations(db);
    logger.info('Database initialized and migrations up to date.');

    // Prune expired records based on retention policy
    const repo = new VerificationRepository(db);
    repo.pruneRetention(config.historyRetentionDays);
  } catch (dbErr: any) {
    logger.error('Database initialization failed: ' + dbErr.message);
    process.exit(1);
  }

  // 2. Start Express Application
  const app = createApp();

  const server = app.listen(config.port, () => {
    logger.info(`TruthLine AI Server listening on http://localhost:${config.port}`);
    logger.info(`Environment: ${config.nodeEnv}`);
    logger.info(`Active Model: ${config.geminiModel}`);
    logger.info(`Gemini API Key: ${config.geminiApiKey ? 'Configured (Live Search Grounding Enabled)' : 'NOT CONFIGURED (Running in Offline Demo Mode)'}`);
    logger.info(`Tavily API Key: ${config.tavilyApiKey ? 'Configured' : 'Not configured (Optional)'}`);
    logger.info(`Google Fact Check Key: ${config.googleFactCheckApiKey ? 'Configured' : 'Not configured (Optional)'}`);
  });

  // 3. Graceful Shutdown Handlers (Windows & Unix portable)
  const shutdown = () => {
    logger.info('Initiating graceful shutdown...');
    server.close(() => {
      logger.info('HTTP server closed.');
      closeDatabase();
      process.exit(0);
    });

    // Force exit if hanging
    setTimeout(() => {
      logger.warn('Forcing process termination.');
      process.exit(1);
    }, 5000);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((err) => {
  logger.error('Fatal startup error: ' + err.message);
  process.exit(1);
});
