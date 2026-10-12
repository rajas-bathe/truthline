import { AtomicClaim } from './Stage2_ClaimExtractor';
import { EvaluatedSource } from './Stage4_SourceAnalyzer';
import { Stage6Output } from './Stage6_ChallengerAgent';
import { logger } from '../security/logger';

export interface Stage7Output {
  auditorNotes: string;
  wasDowngraded: boolean;
  auditedClaims: AtomicClaim[];
  validCitationsCount: number;
  rejectedCitationsCount: number;
}

export class Stage7_EvidenceAuditor {
  auditEvidence(
    claims: AtomicClaim[],
    sources: EvaluatedSource[],
    challenger: Stage6Output,
    customAuditorNotes?: string
  ): Stage7Output {
    let wasDowngraded = false;
    let rejectedCount = 0;
    let validCount = 0;

    // 1. Audit citations
    for (const src of sources) {
      if (!src.url || !/^https?:\/\//i.test(src.url)) {
        rejectedCount++;
      } else {
        validCount++;
      }
    }

    // 2. Audit each atomic claim against citation rules
    const auditedClaims = claims.map(c => {
      let currentVerdict = c.verdict;

      // Rule: Never mark claim VERIFIED if there are 0 valid sources!
      if (currentVerdict === 'VERIFIED' && validCount === 0) {
        logger.warn(`Auditor Downgrade: Claim "${c.claimText.slice(0, 50)}..." marked VERIFIED with 0 valid sources. Downgrading to CANNOT_CONFIRM.`);
        currentVerdict = 'CANNOT_CONFIRM';
        wasDowngraded = true;
      }

      // Rule: If Challenger recommended downgrade to PARTIALLY_SUPPORTED
      if (currentVerdict === 'VERIFIED' && challenger.recommendedAdjustment === 'DOWNGRADE_TO_PARTIALLY_SUPPORTED') {
        currentVerdict = 'PARTIALLY_SUPPORTED';
        wasDowngraded = true;
      }

      return {
        ...c,
        verdict: currentVerdict
      };
    });

    let notes = customAuditorNotes || 'Citations audited for provenance and URL validity.';
    if (wasDowngraded) {
      notes += ' [Auditor Downgrade Applied: Ungrounded or challenged claims were adjusted.]';
    }
    if (rejectedCount > 0) {
      notes += ` Rejected ${rejectedCount} invalid/hallucinated citation URLs.`;
    }

    return {
      auditorNotes: notes,
      wasDowngraded,
      auditedClaims,
      validCitationsCount: validCount,
      rejectedCitationsCount: rejectedCount
    };
  }
}
