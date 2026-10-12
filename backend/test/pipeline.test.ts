import { describe, it, expect } from 'vitest';
import { Stage1_InputProcessor } from '../src/pipeline/Stage1_InputProcessor';
import { Stage2_ClaimExtractor } from '../src/pipeline/Stage2_ClaimExtractor';
import { Stage3_EvidenceRetriever } from '../src/pipeline/Stage3_EvidenceRetriever';
import { Stage4_SourceAnalyzer } from '../src/pipeline/Stage4_SourceAnalyzer';
import { Stage5_ClaimComparator } from '../src/pipeline/Stage5_ClaimComparator';
import { Stage6_ChallengerAgent } from '../src/pipeline/Stage6_ChallengerAgent';
import { Stage7_EvidenceAuditor } from '../src/pipeline/Stage7_EvidenceAuditor';
import { Stage8_VerdictSynthesizer } from '../src/pipeline/Stage8_VerdictSynthesizer';
import { VerificationPipeline } from '../src/pipeline/VerificationPipeline';
import { VerificationRepository } from '../src/database/repository';
import { getDatabase } from '../src/database/db';
import { runMigrations } from '../src/database/migrations';

describe('Pipeline: Stage 1 (Input Processing & Consent)', () => {
  const stage1 = new Stage1_InputProcessor();

  it('should throw an error if consent is false', async () => {
    await expect(
      stage1.process({ inputType: 'text', content: 'Some statement', consent: false })
    ).rejects.toThrow(/consent/i);
  });

  it('should process text input and calculate content hash', async () => {
    const result = await stage1.process({
      inputType: 'text',
      content: 'NASA confirmed 15 days of total darkness.',
      consent: true
    });

    expect(result.extractedFullText).toBe('NASA confirmed 15 days of total darkness.');
    expect(result.contentHash).toBeDefined();
    expect(result.contentHash.length).toBe(64); // SHA-256
    expect(result.characterCount).toBeGreaterThan(0);
  });
});

describe('Pipeline: Stage 2 (Claim Extraction)', () => {
  const stage2 = new Stage2_ClaimExtractor();

  it('should extract structured atomic claims', () => {
    const stage1Out = {
      sanitizedSnippet: 'Test claim snippet',
      extractedFullText: 'Global temperature reached record high in 2024.',
      inputType: 'text',
      characterCount: 47,
      contentHash: 'hash-abc',
      sanitization: {
        sanitizedText: 'Global temperature reached record high in 2024.',
        containsInjectionPattern: false,
        flaggedKeywords: [],
        originalLength: 47
      },
      metadata: {}
    };

    const result = stage2.extractClaims(stage1Out, [
      {
        claimText: 'Global temperature reached record high in 2024.',
        verdict: 'VERIFIED',
        confidence: 0.9,
        reasoning: 'Confirmed by NOAA and Copernicus datasets.'
      }
    ]);

    expect(result.claims.length).toBe(1);
    expect(result.claims[0].claimText).toContain('Global temperature');
    expect(result.claims[0].verdict).toBe('VERIFIED');
  });
});

describe('Pipeline: Stage 4 (Source Authority Analyzer)', () => {
  const stage4 = new Stage4_SourceAnalyzer();

  it('should score official academic and government domains highly', () => {
    const sources = [
      {
        id: 's1',
        title: 'NASA Solar Observational Log',
        url: 'https://www.nasa.gov/news/solar-cycle',
        publisher: 'nasa.gov'
      },
      {
        id: 's2',
        title: 'WHO Health Advisories',
        url: 'https://www.who.int/emergencies/disease-outbreak-news',
        publisher: 'who.int'
      },
      {
        id: 's3',
        title: 'Unverified Blog Spot',
        url: 'https://myblogsite123.wordpress.com/post',
        publisher: 'wordpress.com'
      }
    ];

    const result = stage4.analyzeSources(sources);

    expect(result.evaluatedSources.length).toBe(3);
    const nasaSource = result.evaluatedSources.find(s => s.url.includes('nasa.gov'));
    const whoSource = result.evaluatedSources.find(s => s.url.includes('who.int'));
    const blogSource = result.evaluatedSources.find(s => s.url.includes('wordpress.com'));

    expect(nasaSource?.authorityScore).toBeGreaterThanOrEqual(90);
    expect(whoSource?.authorityScore).toBeGreaterThanOrEqual(90);
    expect(blogSource?.authorityScore).toBeLessThan(70);
  });
});

describe('Pipeline: Stage 7 (Evidence Auditor Safety Downgrades)', () => {
  const stage7 = new Stage7_EvidenceAuditor();

  it('CRITICAL SAFETY: should downgrade VERIFIED claims to CANNOT_CONFIRM if 0 valid citations exist', () => {
    const ungroundedClaims = [
      {
        id: 'c1',
        claimOrder: 1,
        claimText: 'Company X invented teleportation yesterday.',
        verdict: 'VERIFIED' as const,
        confidence: 0.99
      }
    ];

    // Zero sources provided
    const audited = stage7.auditEvidence(
      ungroundedClaims,
      [],
      {
        challengerNotes: 'No issues found',
        hasContradictoryFindings: false,
        missingContextIdentified: false,
        recommendedAdjustment: 'NONE'
      }
    );

    expect(audited.wasDowngraded).toBe(true);
    expect(audited.auditedClaims[0].verdict).toBe('CANNOT_CONFIRM');
    expect(audited.auditorNotes).toContain('Auditor Downgrade Applied');
  });
});

describe('Pipeline: Stage 8 (Verdict Synthesis & WhatsApp Rebuttal)', () => {
  const stage8 = new Stage8_VerdictSynthesizer();

  it('should synthesize final verdict and format WhatsApp rebuttal', () => {
    const claims = [
      {
        id: 'c1',
        claimOrder: 1,
        claimText: 'ISRO launched Chandrayaan-3',
        verdict: 'VERIFIED' as const,
        confidence: 0.95
      }
    ];

    const sources = [
      {
        id: 's1',
        title: 'ISRO Telemetry',
        url: 'https://www.isro.gov.in/chandrayaan3',
        publisher: 'isro.gov.in',
        authorityScore: 95,
        sourceType: 'GOVERNMENT',
        retrievedAt: Date.now()
      }
    ];

    const challenger = {
      challengerNotes: 'All checks passed',
      hasContradictoryFindings: false,
      missingContextIdentified: false,
      recommendedAdjustment: 'NONE' as const
    };

    const auditor = {
      auditorNotes: 'Valid official sources confirmed',
      wasDowngraded: false,
      auditedClaims: claims,
      validCitationsCount: 1,
      rejectedCitationsCount: 0
    };

    const result = stage8.synthesize(claims, sources, challenger, auditor, 'VERIFIED', 'Successfully confirmed.');

    expect(result.overallVerdict).toBe('VERIFIED');
    expect(result.whatsappRebuttal).toContain('*TRUTHLINE AI VERIFICATION*');
    expect(result.whatsappRebuttal).toContain('Verdict: *VERIFIED*');
    expect(result.whatsappRebuttal).toContain('https://www.isro.gov.in/chandrayaan3');
    expect(result.whatsappRebuttal).toContain("Don't just forward. Verify.");
    expect(result.evidenceStrengthScore).toBeGreaterThanOrEqual(70);
  });
});

describe('Pipeline: End-to-End Execution (Offline Demo Mode)', () => {
  it('should execute full 8-stage pipeline cleanly on demo sample text', async () => {
    const testDb = getDatabase(':memory:');
    runMigrations(testDb);
    const repo = new VerificationRepository(testDb);
    const pipeline = new VerificationPipeline(repo);

    const result = await pipeline.run(
      {
        inputType: 'text',
        content: 'NASA confirmed 15 days of total darkness starting next Monday.',
        consent: true
      },
      'test-session-id'
    );

    expect(result.id).toBeDefined();
    expect(result.overallVerdict).toBe('FALSE');
    expect(result.atomicClaims.length).toBeGreaterThan(0);
    expect(result.sources.length).toBeGreaterThan(0);
    expect(result.whatsappRebuttal).toContain('FALSE');
    expect(result.isDemoMode).toBe(true);

    // Verify it was stored in the repository
    const stored = repo.getVerificationById(result.id);
    expect(stored).not.toBeNull();
    expect(stored?.id).toBe(result.id);
  });
});
