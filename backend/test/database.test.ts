import { describe, it, expect, beforeEach } from 'vitest';
import { getDatabase } from '../src/database/db';
import { runMigrations } from '../src/database/migrations';
import { VerificationRepository, VerificationRecord } from '../src/database/repository';

describe('Database: SQLite Migrations and Repository', () => {
  let repo: VerificationRepository;

  beforeEach(() => {
    const testDb = getDatabase(':memory:');
    runMigrations(testDb);
    repo = new VerificationRepository(testDb);
  });

  it('should run migrations without errors on a fresh database', () => {
    const list = repo.listVerifications();
    expect(list.total).toBe(0);
    expect(list.items.length).toBe(0);
  });

  it('should save and retrieve a full verification record', () => {
    const now = Date.now();
    const record: VerificationRecord = {
      id: 'test-uuid-1234',
      sessionId: 'session-xyz',
      inputType: 'text',
      rawInputSnippet: 'NASA confirms 15 days of total darkness',
      overallVerdict: 'FALSE',
      explanation: 'NASA has confirmed no such solar blackout.',
      challengerNotes: 'No official astronomy journals corroborating.',
      auditorNotes: 'Audited against authentic NASA press releases.',
      limitations: 'Checked public records through 2026.',
      executionTimeMs: 142,
      contentHash: 'hash-abc-123',
      createdAt: now,
      atomicClaims: [
        {
          id: 'claim-1',
          claimOrder: 1,
          claimText: 'NASA confirmed total darkness',
          verdict: 'FALSE',
          confidence: 0.95,
          reasoning: 'Debunked internet rumor.'
        }
      ],
      sources: [
        {
          id: 'src-1',
          title: 'NASA Solar Science',
          url: 'https://nasa.gov/solar-facts',
          publisher: 'nasa.gov',
          authorityScore: 98,
          sourceType: 'GOVERNMENT',
          retrievedAt: now,
          isSupporting: false
        }
      ],
      stages: [
        {
          id: 'stage-1',
          stageNumber: 1,
          stageName: 'Input Processing',
          ranStatus: 'SUCCESS',
          executionMs: 10
        }
      ]
    };

    repo.saveVerification(record);

    const fetched = repo.getVerificationById('test-uuid-1234');
    expect(fetched).not.toBeNull();
    expect(fetched?.id).toBe('test-uuid-1234');
    expect(fetched?.overallVerdict).toBe('FALSE');
    expect(fetched?.atomicClaims?.length).toBe(1);
    expect(fetched?.sources?.length).toBe(1);
    expect(fetched?.stages?.length).toBe(1);
  });

  it('should retrieve cached verification by content hash within TTL', () => {
    const record: VerificationRecord = {
      id: 'cached-uuid-999',
      inputType: 'text',
      rawInputSnippet: 'Sample verifiable statement',
      overallVerdict: 'VERIFIED',
      explanation: 'Confirmed by multiple sources.',
      executionTimeMs: 50,
      contentHash: 'hash-unique-777',
      createdAt: Date.now()
    };

    repo.saveVerification(record);

    const cached = repo.findCachedVerification('hash-unique-777', 24);
    expect(cached).not.toBeNull();
    expect(cached?.id).toBe('cached-uuid-999');

    // Non-existent hash
    const missing = repo.findCachedVerification('non-existent-hash', 24);
    expect(missing).toBeNull();
  });

  it('should support search and pagination in listVerifications', () => {
    for (let i = 1; i <= 5; i++) {
      repo.saveVerification({
        id: `id-${i}`,
        inputType: 'text',
        rawInputSnippet: `Topic number ${i} announcement`,
        overallVerdict: i % 2 === 0 ? 'VERIFIED' : 'FALSE',
        explanation: `Explanation for ${i}`,
        executionTimeMs: 10,
        createdAt: Date.now() - (10 - i) * 1000
      });
    }

    const all = repo.listVerifications({ limit: 10 });
    expect(all.total).toBe(5);
    expect(all.items.length).toBe(5);

    const filtered = repo.listVerifications({ verdict: 'VERIFIED' });
    expect(filtered.total).toBe(2);

    const searched = repo.listVerifications({ search: 'Topic number 3' });
    expect(searched.total).toBe(1);
    expect(searched.items[0].id).toBe('id-3');
  });

  it('should delete a verification by ID', () => {
    repo.saveVerification({
      id: 'to-delete',
      inputType: 'text',
      rawInputSnippet: 'Temporary note',
      overallVerdict: 'CANNOT_CONFIRM',
      explanation: 'Not enough data',
      executionTimeMs: 15,
      createdAt: Date.now()
    });

    expect(repo.getVerificationById('to-delete')).not.toBeNull();
    repo.deleteVerification('to-delete');
    expect(repo.getVerificationById('to-delete')).toBeNull();
  });

  it('should clear all verifications', () => {
    repo.saveVerification({
      id: 'item-1',
      inputType: 'text',
      rawInputSnippet: 'Text 1',
      overallVerdict: 'VERIFIED',
      explanation: 'Done',
      executionTimeMs: 5,
      createdAt: Date.now()
    });

    repo.clearAllVerifications();
    expect(repo.listVerifications().total).toBe(0);
  });
});
