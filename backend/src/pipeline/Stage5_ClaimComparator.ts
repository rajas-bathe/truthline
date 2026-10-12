import { AtomicClaim } from './Stage2_ClaimExtractor';
import { EvaluatedSource } from './Stage4_SourceAnalyzer';

export interface ClaimComparisonResult {
  claimId: string;
  claimText: string;
  supportingSourceIds: string[];
  refutingSourceIds: string[];
  evidenceStrength: 'STRONG' | 'MODERATE' | 'WEAK' | 'INSUFFICIENT';
  provisionalVerdict: 'VERIFIED' | 'FALSE' | 'OUTDATED' | 'PARTIALLY_SUPPORTED' | 'CANNOT_CONFIRM';
}

export interface Stage5Output {
  comparisons: ClaimComparisonResult[];
  overallStrength: number; // 0 to 100
}

export class Stage5_ClaimComparator {
  compareClaims(claims: AtomicClaim[], sources: EvaluatedSource[]): Stage5Output {
    const comparisons: ClaimComparisonResult[] = [];
    const sourceIds = sources.map(s => s.id);

    for (const claim of claims) {
      let strength: 'STRONG' | 'MODERATE' | 'WEAK' | 'INSUFFICIENT' = 'INSUFFICIENT';

      if (sources.length >= 2 && sources.some(s => s.authorityScore >= 85)) {
        strength = 'STRONG';
      } else if (sources.length >= 1 && sources[0].authorityScore >= 80) {
        strength = 'MODERATE';
      } else if (sources.length > 0) {
        strength = 'WEAK';
      }

      // If no sources exist, provisional verdict must be CANNOT_CONFIRM
      let provisional = claim.verdict;
      if (sources.length === 0 && provisional === 'VERIFIED') {
        provisional = 'CANNOT_CONFIRM';
      }

      comparisons.push({
        claimId: claim.id,
        claimText: claim.claimText,
        supportingSourceIds: claim.verdict === 'VERIFIED' ? sourceIds : [],
        refutingSourceIds: claim.verdict === 'FALSE' ? sourceIds : [],
        evidenceStrength: strength,
        provisionalVerdict: provisional
      });
    }

    const overallStrength = sources.length === 0
      ? 15
      : Math.min(100, Math.round(sources.reduce((acc, s) => acc + s.authorityScore, 0) / Math.max(1, sources.length)));

    return {
      comparisons,
      overallStrength
    };
  }
}
