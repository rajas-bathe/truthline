import crypto from 'crypto';
import { Stage1_InputProcessor, Stage1Input } from './Stage1_InputProcessor';
import { Stage2_ClaimExtractor } from './Stage2_ClaimExtractor';
import { Stage3_EvidenceRetriever } from './Stage3_EvidenceRetriever';
import { Stage4_SourceAnalyzer } from './Stage4_SourceAnalyzer';
import { Stage5_ClaimComparator } from './Stage5_ClaimComparator';
import { Stage6_ChallengerAgent } from './Stage6_ChallengerAgent';
import { Stage7_EvidenceAuditor } from './Stage7_EvidenceAuditor';
import { Stage8_VerdictSynthesizer, AllowedVerdict } from './Stage8_VerdictSynthesizer';
import { ProviderManager } from '../providers/providerManager';
import { VerificationRepository, VerificationRecord } from '../database/repository';
import { config } from '../config/env';
import { logger } from '../security/logger';

export interface PipelineExecutionResult {
  id: string;
  verdict: AllowedVerdict;
  overallVerdict: AllowedVerdict;
  explanation: string;
  whatsappRebuttal: string;
  limitations: string;
  evidenceStrengthScore: number;
  challengerNotes: string;
  auditorNotes: string;
  wasAuditorDowngraded: boolean;
  inputType: string;
  rawInputSnippet: string;
  characterCount: number;
  executionTimeMs: number;
  createdAt: number;
  atomicClaims: Array<{
    id: string;
    claimOrder: number;
    claimText: string;
    verdict: string;
    confidence: number;
    reasoning?: string;
  }>;
  sources: Array<{
    id: string;
    title: string;
    url: string;
    publisher?: string;
    publishedDate?: string;
    authorityScore?: number;
    sourceType?: string;
    excerpt?: string;
    isSupporting?: boolean;
  }>;
  stageTimings: Record<string, number>;
  isDemoMode: boolean;
}

export class VerificationPipeline {
  private stage1: Stage1_InputProcessor;
  private stage2: Stage2_ClaimExtractor;
  private stage3: Stage3_EvidenceRetriever;
  private stage4: Stage4_SourceAnalyzer;
  private stage5: Stage5_ClaimComparator;
  private stage6: Stage6_ChallengerAgent;
  private stage7: Stage7_EvidenceAuditor;
  private stage8: Stage8_VerdictSynthesizer;
  private providers: ProviderManager;
  private repository: VerificationRepository;

  constructor(repository?: VerificationRepository, providers?: ProviderManager) {
    this.stage1 = new Stage1_InputProcessor();
    this.stage2 = new Stage2_ClaimExtractor();
    this.stage3 = new Stage3_EvidenceRetriever();
    this.stage4 = new Stage4_SourceAnalyzer();
    this.stage5 = new Stage5_ClaimComparator();
    this.stage6 = new Stage6_ChallengerAgent();
    this.stage7 = new Stage7_EvidenceAuditor();
    this.stage8 = new Stage8_VerdictSynthesizer();
    this.providers = providers || new ProviderManager();
    this.repository = repository || new VerificationRepository();
  }

  async run(input: Stage1Input, sessionId?: string): Promise<PipelineExecutionResult> {
    const startTime = Date.now();
    const stageTimings: Record<string, number> = {};
    const stagesForDb: any[] = [];

    // Stage 1: Input Processing
    const s1Start = Date.now();
    const s1Out = await this.stage1.process(input);
    stageTimings['Stage1_InputProcessor'] = Date.now() - s1Start;
    stagesForDb.push({
      id: crypto.randomUUID(),
      stageNumber: 1,
      stageName: 'Input Processing',
      ranStatus: 'SUCCESS',
      executionMs: stageTimings['Stage1_InputProcessor'],
      detailsJson: JSON.stringify({ inputType: s1Out.inputType, chars: s1Out.characterCount })
    });

    // Check Cache (if text input and not file)
    if (['text', 'url', 'selected_text', 'whatsapp_selection'].includes(input.inputType)) {
      const cached = this.repository.findCachedVerification(s1Out.contentHash, config.cacheTtlHours);
      if (cached) {
        logger.info(`Returning cached verification result for hash: ${s1Out.contentHash.slice(0, 8)}...`);
        return {
          id: cached.id,
          verdict: cached.overallVerdict as AllowedVerdict,
          overallVerdict: cached.overallVerdict as AllowedVerdict,
          explanation: cached.explanation,
          whatsappRebuttal: `*TRUTHLINE AI VERIFICATION*\n\nVerdict: *${cached.overallVerdict}*\n\nSummary: ${cached.explanation}`,
          limitations: cached.limitations || '',
          evidenceStrengthScore: 85,
          challengerNotes: cached.challengerNotes || '',
          auditorNotes: cached.auditorNotes || '',
          wasAuditorDowngraded: false,
          inputType: cached.inputType,
          rawInputSnippet: cached.rawInputSnippet,
          characterCount: cached.rawInputSnippet.length,
          executionTimeMs: cached.executionTimeMs,
          createdAt: cached.createdAt,
          atomicClaims: cached.atomicClaims || [],
          sources: (cached.sources || []).map(s => ({
            id: s.id,
            title: s.title,
            url: s.url,
            publisher: s.publisher,
            publishedDate: s.publishedDate,
            authorityScore: s.authorityScore,
            sourceType: s.sourceType,
            excerpt: s.excerpt,
            isSupporting: s.isSupporting
          })),
          stageTimings: { cacheHit: 1 },
          isDemoMode: !this.providers.isLiveAiAvailable()
        };
      }
    }

    // Call Provider Manager for Grounded Inference / Offline Demo
    const { result: providerResult, report } = await this.providers.verify(
      s1Out.extractedFullText,
      s1Out.multimodalParts
    );

    // Stage 2: Claim Extraction
    const s2Start = Date.now();
    const s2Out = this.stage2.extractClaims(s1Out, providerResult.claims);
    stageTimings['Stage2_ClaimExtractor'] = Date.now() - s2Start;
    stagesForDb.push({
      id: crypto.randomUUID(),
      stageNumber: 2,
      stageName: 'Claim Decomposition',
      ranStatus: 'SUCCESS',
      executionMs: stageTimings['Stage2_ClaimExtractor'],
      detailsJson: JSON.stringify({ claimCount: s2Out.claims.length })
    });

    // Stage 3: Evidence Retrieval
    const s3Start = Date.now();
    const s3Out = this.stage3.processEvidence(
      s2Out.claims,
      providerResult.sources || [],
      providerResult.groundingQueries || []
    );
    stageTimings['Stage3_EvidenceRetriever'] = Date.now() - s3Start;
    stagesForDb.push({
      id: crypto.randomUUID(),
      stageNumber: 3,
      stageName: 'Evidence Retrieval',
      ranStatus: 'SUCCESS',
      executionMs: stageTimings['Stage3_EvidenceRetriever'],
      detailsJson: JSON.stringify({ sourceCount: s3Out.sources.length })
    });

    // Stage 4: Source Analysis
    const s4Start = Date.now();
    const s4Out = this.stage4.analyzeSources(s3Out.sources);
    stageTimings['Stage4_SourceAnalyzer'] = Date.now() - s4Start;
    stagesForDb.push({
      id: crypto.randomUUID(),
      stageNumber: 4,
      stageName: 'Source Authority Analysis',
      ranStatus: 'SUCCESS',
      executionMs: stageTimings['Stage4_SourceAnalyzer'],
      detailsJson: JSON.stringify({ avgAuthority: s4Out.averageAuthority, primaryCount: s4Out.primarySourceCount })
    });

    // Stage 5: Claim Comparator
    const s5Start = Date.now();
    const s5Out = this.stage5.compareClaims(s2Out.claims, s4Out.evaluatedSources);
    stageTimings['Stage5_ClaimComparator'] = Date.now() - s5Start;
    stagesForDb.push({
      id: crypto.randomUUID(),
      stageNumber: 5,
      stageName: 'Claim-Evidence Comparison',
      ranStatus: 'SUCCESS',
      executionMs: stageTimings['Stage5_ClaimComparator'],
      detailsJson: JSON.stringify({ comparisonsCount: s5Out.comparisons.length, strength: s5Out.overallStrength })
    });

    // Stage 6: Challenger Agent
    const s6Start = Date.now();
    const s6Out = this.stage6.auditAdversarially(s5Out, s4Out.evaluatedSources, providerResult.challengerNotes);
    stageTimings['Stage6_ChallengerAgent'] = Date.now() - s6Start;
    stagesForDb.push({
      id: crypto.randomUUID(),
      stageNumber: 6,
      stageName: 'Challenger Agent Audit',
      ranStatus: 'SUCCESS',
      executionMs: stageTimings['Stage6_ChallengerAgent'],
      detailsJson: JSON.stringify({ contradictory: s6Out.hasContradictoryFindings })
    });

    // Stage 7: Evidence Auditor
    const s7Start = Date.now();
    const s7Out = this.stage7.auditEvidence(
      s2Out.claims,
      s4Out.evaluatedSources,
      s6Out,
      providerResult.auditorNotes
    );
    stageTimings['Stage7_EvidenceAuditor'] = Date.now() - s7Start;
    stagesForDb.push({
      id: crypto.randomUUID(),
      stageNumber: 7,
      stageName: 'Evidence Auditor Check',
      ranStatus: 'SUCCESS',
      executionMs: stageTimings['Stage7_EvidenceAuditor'],
      detailsJson: JSON.stringify({ wasDowngraded: s7Out.wasDowngraded, validCitations: s7Out.validCitationsCount })
    });

    // Stage 8: Verdict Synthesizer
    const s8Start = Date.now();
    const s8Out = this.stage8.synthesize(
      s7Out.auditedClaims,
      s4Out.evaluatedSources,
      s6Out,
      s7Out,
      providerResult.overallVerdict,
      providerResult.explanation,
      providerResult.limitations
    );
    stageTimings['Stage8_VerdictSynthesizer'] = Date.now() - s8Start;
    stagesForDb.push({
      id: crypto.randomUUID(),
      stageNumber: 8,
      stageName: 'Verdict Synthesis',
      ranStatus: 'SUCCESS',
      executionMs: stageTimings['Stage8_VerdictSynthesizer'],
      detailsJson: JSON.stringify({ finalVerdict: s8Out.overallVerdict })
    });

    const totalDuration = Date.now() - startTime;
    const verificationId = crypto.randomUUID();
    const createdAt = Date.now();

    // Persist to SQLite
    const recordToPersist: VerificationRecord = {
      id: verificationId,
      sessionId,
      inputType: s1Out.inputType,
      rawInputSnippet: s1Out.sanitizedSnippet,
      overallVerdict: s8Out.overallVerdict,
      explanation: s8Out.explanation,
      challengerNotes: s6Out.challengerNotes,
      auditorNotes: s7Out.auditorNotes,
      limitations: s8Out.limitations,
      executionTimeMs: totalDuration,
      contentHash: s1Out.contentHash,
      createdAt,
      atomicClaims: s7Out.auditedClaims.map(c => ({
        id: c.id,
        claimOrder: c.claimOrder,
        claimText: c.claimText,
        verdict: c.verdict,
        confidence: c.confidence,
        reasoning: c.reasoning
      })),
      sources: s4Out.evaluatedSources.map(s => ({
        id: s.id,
        claimId: s.claimId,
        title: s.title,
        url: s.url,
        publisher: s.publisher,
        publishedDate: s.publishedDate,
        retrievedAt: s.retrievedAt,
        excerpt: s.excerpt,
        authorityScore: s.authorityScore,
        sourceType: s.sourceType,
        isSupporting: s.isSupporting
      })),
      stages: stagesForDb
    };

    try {
      this.repository.saveVerification(recordToPersist);
    } catch (dbErr: any) {
      logger.error('Failed to persist verification record to SQLite: ' + dbErr.message);
    }

    return {
      id: verificationId,
      verdict: s8Out.overallVerdict,
      overallVerdict: s8Out.overallVerdict,
      explanation: s8Out.explanation,
      whatsappRebuttal: s8Out.whatsappRebuttal,
      limitations: s8Out.limitations,
      evidenceStrengthScore: s8Out.evidenceStrengthScore,
      challengerNotes: s6Out.challengerNotes,
      auditorNotes: s7Out.auditorNotes,
      wasAuditorDowngraded: s7Out.wasDowngraded,
      inputType: s1Out.inputType,
      rawInputSnippet: s1Out.sanitizedSnippet,
      characterCount: s1Out.characterCount,
      executionTimeMs: totalDuration,
      createdAt,
      atomicClaims: recordToPersist.atomicClaims || [],
      sources: (recordToPersist.sources || []).map(s => ({
        id: s.id,
        title: s.title,
        url: s.url,
        publisher: s.publisher,
        publishedDate: s.publishedDate,
        authorityScore: s.authorityScore,
        sourceType: s.sourceType,
        excerpt: s.excerpt,
        isSupporting: s.isSupporting
      })),
      stageTimings,
      isDemoMode: report.isOfflineDemo
    };
  }
}
