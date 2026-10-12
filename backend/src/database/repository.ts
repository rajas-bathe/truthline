import { DatabaseSync } from 'node:sqlite';
import { getDatabase } from './db';
import { logger } from '../security/logger';

export interface VerificationRecord {
  id: string;
  sessionId?: string;
  inputType: string;
  rawInputSnippet: string;
  overallVerdict: string;
  explanation: string;
  challengerNotes?: string;
  auditorNotes?: string;
  limitations?: string;
  executionTimeMs: number;
  contentHash?: string;
  createdAt: number;
  atomicClaims?: Array<{
    id: string;
    claimOrder: number;
    claimText: string;
    verdict: string;
    confidence: number;
    reasoning?: string;
  }>;
  sources?: Array<{
    id: string;
    claimId?: string;
    title: string;
    url: string;
    publisher?: string;
    publishedDate?: string;
    retrievedAt: number;
    excerpt?: string;
    authorityScore?: number;
    sourceType?: string;
    isSupporting?: boolean;
  }>;
  stages?: Array<{
    id: string;
    stageNumber: number;
    stageName: string;
    ranStatus: string;
    executionMs: number;
    detailsJson?: string;
  }>;
}

export class VerificationRepository {
  private db: DatabaseSync;

  constructor(db?: DatabaseSync) {
    this.db = db || getDatabase();
  }

  saveVerification(data: VerificationRecord): void {
    const insertVerification = this.db.prepare(`
      INSERT INTO verifications (
        id, session_id, input_type, raw_input_snippet,
        overall_verdict, explanation, challenger_notes,
        auditor_notes, limitations, execution_time_ms,
        content_hash, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `);

    insertVerification.run(
      data.id,
      data.sessionId || null,
      data.inputType,
      data.rawInputSnippet,
      data.overallVerdict,
      data.explanation,
      data.challengerNotes || null,
      data.auditorNotes || null,
      data.limitations || null,
      data.executionTimeMs,
      data.contentHash || null,
      data.createdAt
    );

    // Insert atomic claims
    if (data.atomicClaims && data.atomicClaims.length > 0) {
      const insertClaim = this.db.prepare(`
        INSERT INTO atomic_claims (id, verification_id, claim_order, claim_text, verdict, confidence, reasoning)
        VALUES (?, ?, ?, ?, ?, ?, ?);
      `);

      for (const c of data.atomicClaims) {
        insertClaim.run(
          c.id,
          data.id,
          c.claimOrder,
          c.claimText,
          c.verdict,
          c.confidence,
          c.reasoning || null
        );
      }
    }

    // Insert sources
    if (data.sources && data.sources.length > 0) {
      const insertSource = this.db.prepare(`
        INSERT INTO evidence_sources (
          id, verification_id, claim_id, title, url, publisher,
          published_date, retrieved_at, excerpt, authority_score, source_type, is_supporting
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `);

      for (const s of data.sources) {
        insertSource.run(
          s.id,
          data.id,
          s.claimId || null,
          s.title,
          s.url,
          s.publisher || null,
          s.publishedDate || null,
          s.retrievedAt,
          s.excerpt || null,
          s.authorityScore || 80,
          s.sourceType || 'web',
          s.isSupporting === false ? 0 : 1
        );
      }
    }

    // Insert stage records
    if (data.stages && data.stages.length > 0) {
      const insertStage = this.db.prepare(`
        INSERT INTO stage_executions (id, verification_id, stage_number, stage_name, ran_status, execution_ms, details_json)
        VALUES (?, ?, ?, ?, ?, ?, ?);
      `);

      for (const st of data.stages) {
        insertStage.run(
          st.id,
          data.id,
          st.stageNumber,
          st.stageName,
          st.ranStatus,
          st.executionMs,
          st.detailsJson || null
        );
      }
    }
  }

  getVerificationById(id: string): VerificationRecord | null {
    const stmt = this.db.prepare(`SELECT * FROM verifications WHERE id = ?;`);
    const row = stmt.get(id) as any;
    if (!row) return null;

    // Fetch atomic claims
    const claimsStmt = this.db.prepare(`SELECT * FROM atomic_claims WHERE verification_id = ? ORDER BY claim_order ASC;`);
    const claims = (claimsStmt.all(id) as any[]).map(c => ({
      id: c.id,
      claimOrder: c.claim_order,
      claimText: c.claim_text,
      verdict: c.verdict,
      confidence: c.confidence,
      reasoning: c.reasoning
    }));

    // Fetch sources
    const sourcesStmt = this.db.prepare(`SELECT * FROM evidence_sources WHERE verification_id = ?;`);
    const sources = (sourcesStmt.all(id) as any[]).map(s => ({
      id: s.id,
      claimId: s.claim_id,
      title: s.title,
      url: s.url,
      publisher: s.publisher,
      publishedDate: s.published_date,
      retrievedAt: s.retrieved_at,
      excerpt: s.excerpt,
      authorityScore: s.authority_score,
      sourceType: s.source_type,
      isSupporting: s.is_supporting === 1
    }));

    // Fetch stage executions
    const stagesStmt = this.db.prepare(`SELECT * FROM stage_executions WHERE verification_id = ? ORDER BY stage_number ASC;`);
    const stages = (stagesStmt.all(id) as any[]).map(st => ({
      id: st.id,
      stageNumber: st.stage_number,
      stageName: st.stage_name,
      ranStatus: st.ran_status,
      executionMs: st.execution_ms,
      detailsJson: st.details_json
    }));

    return {
      id: row.id,
      sessionId: row.session_id,
      inputType: row.input_type,
      rawInputSnippet: row.raw_input_snippet,
      overallVerdict: row.overall_verdict,
      explanation: row.explanation,
      challengerNotes: row.challenger_notes,
      auditorNotes: row.auditor_notes,
      limitations: row.limitations,
      executionTimeMs: row.execution_time_ms,
      contentHash: row.content_hash,
      createdAt: row.created_at,
      atomicClaims: claims,
      sources,
      stages
    };
  }

  findCachedVerification(contentHash: string, maxAgeHours: number): VerificationRecord | null {
    if (!contentHash) return null;
    const minTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);

    const stmt = this.db.prepare(`
      SELECT id FROM verifications
      WHERE content_hash = ? AND created_at >= ?
      ORDER BY created_at DESC LIMIT 1;
    `);

    const row = stmt.get(contentHash, minTime) as { id: string } | undefined;
    if (!row) return null;

    return this.getVerificationById(row.id);
  }

  listVerifications(options: { limit?: number; offset?: number; verdict?: string; search?: string } = {}): { items: any[]; total: number } {
    const limit = Math.min(options.limit || 50, 100);
    const offset = options.offset || 0;

    let query = `SELECT id, input_type, raw_input_snippet, overall_verdict, explanation, created_at, execution_time_ms FROM verifications WHERE 1=1`;
    const params: any[] = [];

    if (options.verdict && options.verdict !== 'ALL') {
      query += ` AND overall_verdict = ?`;
      params.push(options.verdict);
    }

    if (options.search && options.search.trim()) {
      query += ` AND (raw_input_snippet LIKE ? OR explanation LIKE ?)`;
      const term = `%${options.search.trim()}%`;
      params.push(term, term);
    }

    // Count total
    const countQuery = query.replace('SELECT id, input_type, raw_input_snippet, overall_verdict, explanation, created_at, execution_time_ms', 'SELECT COUNT(*) as total');
    const countStmt = this.db.prepare(countQuery);
    const countRow = countStmt.get(...params) as { total: number };
    const total = countRow ? countRow.total : 0;

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?;`;
    params.push(limit, offset);

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as any[];

    const items = rows.map(r => ({
      id: r.id,
      inputType: r.input_type,
      rawInputSnippet: r.raw_input_snippet,
      overallVerdict: r.overall_verdict,
      explanation: r.explanation,
      createdAt: r.created_at,
      executionTimeMs: r.execution_time_ms
    }));

    return { items, total };
  }

  deleteVerification(id: string): boolean {
    const stmt = this.db.prepare(`DELETE FROM verifications WHERE id = ?;`);
    stmt.run(id);
    return true;
  }

  clearAllVerifications(): void {
    this.db.exec(`
      DELETE FROM stage_executions;
      DELETE FROM evidence_sources;
      DELETE FROM atomic_claims;
      DELETE FROM verifications;
    `);
    logger.info('Cleared all verification records from database.');
  }

  pruneRetention(retentionDays: number): number {
    const cutoff = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
    const stmt = this.db.prepare(`DELETE FROM verifications WHERE created_at < ?;`);
    stmt.run(cutoff);
    logger.info(`Pruned records older than ${retentionDays} days.`);
    return 1;
  }
}
