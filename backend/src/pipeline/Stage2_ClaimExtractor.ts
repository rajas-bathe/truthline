import crypto from 'crypto';
import { Stage1Output } from './Stage1_InputProcessor';

export interface AtomicClaim {
  id: string;
  claimOrder: number;
  claimText: string;
  verdict: 'VERIFIED' | 'FALSE' | 'OUTDATED' | 'PARTIALLY_SUPPORTED' | 'CANNOT_CONFIRM';
  confidence: number;
  reasoning?: string;
}

export interface Stage2Output {
  claims: AtomicClaim[];
  rawText: string;
}

export class Stage2_ClaimExtractor {
  extractClaims(stage1: Stage1Output, preExtractedClaims?: any[]): Stage2Output {
    const rawText = stage1.extractedFullText;
    const claims: AtomicClaim[] = [];

    // If the provider returned pre-decomposed claims
    if (preExtractedClaims && preExtractedClaims.length > 0) {
      preExtractedClaims.forEach((c, idx) => {
        claims.push({
          id: crypto.randomUUID(),
          claimOrder: idx + 1,
          claimText: (c.claimText || c.text || '').trim(),
          verdict: c.verdict || 'CANNOT_CONFIRM',
          confidence: typeof c.confidence === 'number' ? c.confidence : 0.8,
          reasoning: c.reasoning || 'Extracted atomic claim.'
        });
      });
      return { claims, rawText };
    }

    // Algorithmic sentence decomposition fallback
    const sentences = rawText
      .split(/(?<=[.!?\n])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 15 && !s.startsWith('#'));

    if (sentences.length > 0) {
      // Pick top 1 to 5 most substantive claim candidates
      const candidates = sentences.slice(0, 5);
      candidates.forEach((sentence, idx) => {
        claims.push({
          id: crypto.randomUUID(),
          claimOrder: idx + 1,
          claimText: sentence,
          verdict: 'CANNOT_CONFIRM',
          confidence: 0.5,
          reasoning: 'Decomposed atomic proposition.'
        });
      });
    } else {
      claims.push({
        id: crypto.randomUUID(),
        claimOrder: 1,
        claimText: rawText.slice(0, 200),
        verdict: 'CANNOT_CONFIRM',
        confidence: 0.5,
        reasoning: 'Single atomic claim.'
      });
    }

    return { claims, rawText };
  }
}
