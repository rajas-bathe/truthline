import { DatabaseSync } from 'node:sqlite';
import { logger } from '../security/logger';

interface Migration {
  version: number;
  name: string;
  up: (db: DatabaseSync) => void;
}

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    up: (db) => {
      // 1. Verifications main table
      db.exec(`
        CREATE TABLE IF NOT EXISTS verifications (
          id TEXT PRIMARY KEY,
          session_id TEXT,
          input_type TEXT NOT NULL,
          raw_input_snippet TEXT NOT NULL,
          overall_verdict TEXT NOT NULL,
          explanation TEXT NOT NULL,
          challenger_notes TEXT,
          auditor_notes TEXT,
          limitations TEXT,
          execution_time_ms INTEGER NOT NULL,
          content_hash TEXT,
          created_at INTEGER NOT NULL
        );
      `);

      // 2. Atomic claims table
      db.exec(`
        CREATE TABLE IF NOT EXISTS atomic_claims (
          id TEXT PRIMARY KEY,
          verification_id TEXT NOT NULL,
          claim_order INTEGER NOT NULL,
          claim_text TEXT NOT NULL,
          verdict TEXT NOT NULL,
          confidence REAL NOT NULL,
          reasoning TEXT,
          FOREIGN KEY (verification_id) REFERENCES verifications(id) ON DELETE CASCADE
        );
      `);

      // 3. Evidence sources table
      db.exec(`
        CREATE TABLE IF NOT EXISTS evidence_sources (
          id TEXT PRIMARY KEY,
          verification_id TEXT NOT NULL,
          claim_id TEXT,
          title TEXT NOT NULL,
          url TEXT NOT NULL,
          publisher TEXT,
          published_date TEXT,
          retrieved_at INTEGER NOT NULL,
          excerpt TEXT,
          authority_score INTEGER DEFAULT 80,
          source_type TEXT DEFAULT 'web',
          is_supporting INTEGER DEFAULT 1,
          FOREIGN KEY (verification_id) REFERENCES verifications(id) ON DELETE CASCADE
        );
      `);

      // 4. Stage executions audit table
      db.exec(`
        CREATE TABLE IF NOT EXISTS stage_executions (
          id TEXT PRIMARY KEY,
          verification_id TEXT NOT NULL,
          stage_number INTEGER NOT NULL,
          stage_name TEXT NOT NULL,
          ran_status TEXT NOT NULL,
          execution_ms INTEGER NOT NULL,
          details_json TEXT,
          FOREIGN KEY (verification_id) REFERENCES verifications(id) ON DELETE CASCADE
        );
      `);

      // Indexes for rapid lookups and retention pruning
      db.exec(`CREATE INDEX IF NOT EXISTS idx_verifications_created_at ON verifications(created_at);`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_verifications_content_hash ON verifications(content_hash);`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_verifications_verdict ON verifications(overall_verdict);`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_atomic_claims_verification ON atomic_claims(verification_id);`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_evidence_sources_verification ON evidence_sources(verification_id);`);
    }
  }
];

export function runMigrations(db: DatabaseSync): void {
  // Ensure migration tracking table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at INTEGER NOT NULL
    );
  `);

  const selectApplied = db.prepare('SELECT version FROM schema_migrations;');
  const appliedRows = selectApplied.all() as { version: number }[];
  const appliedVersions = new Set(appliedRows.map(r => r.version));

  for (const m of MIGRATIONS) {
    if (!appliedVersions.has(m.version)) {
      logger.info(`Applying SQLite migration v${m.version}: ${m.name}...`);
      m.up(db);

      const recordMigration = db.prepare('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?);');
      recordMigration.run(m.version, m.name, Date.now());
      logger.info(`Migration v${m.version} applied successfully.`);
    }
  }
}
