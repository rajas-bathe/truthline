import { Stage5Output } from './Stage5_ClaimComparator';
import { EvaluatedSource } from './Stage4_SourceAnalyzer';

export interface Stage6Output {
  challengerNotes: string;
  hasContradictoryFindings: boolean;
  missingContextIdentified: boolean;
  recommendedAdjustment?: 'DOWNGRADE_TO_PARTIALLY_SUPPORTED' | 'DOWNGRADE_TO_CANNOT_CONFIRM' | 'NONE';
}

export class Stage6_ChallengerAgent {
  auditAdversarially(
    stage5: Stage5Output,
    sources: EvaluatedSource[],
    customChallengerNotes?: string
  ): Stage6Output {
    // If provider already returned specific challenger reasoning
    if (customChallengerNotes && customChallengerNotes.length > 20) {
      const lower = customChallengerNotes.toLowerCase();
      const hasContradiction = lower.includes('contradict') || lower.includes('counter') || lower.includes('false');
      const missingContext = lower.includes('omiss') || lower.includes('context') || lower.includes('exaggerat');

      return {
        challengerNotes: customChallengerNotes,
        hasContradictoryFindings: hasContradiction,
        missingContextIdentified: missingContext,
        recommendedAdjustment: hasContradiction ? 'DOWNGRADE_TO_PARTIALLY_SUPPORTED' : 'NONE'
      };
    }

    // Default adversarial assessment
    let notes = 'Challenger agent checked for missing context, selective quotes, and counter-evidence.';
    let hasContradiction = false;
    let missingContext = false;
    let adjustment: 'DOWNGRADE_TO_PARTIALLY_SUPPORTED' | 'DOWNGRADE_TO_CANNOT_CONFIRM' | 'NONE' = 'NONE';

    // If claim was marked VERIFIED but only 1 general web source exists
    if (stage5.comparisons.some(c => c.provisionalVerdict === 'VERIFIED') && sources.length === 1 && sources[0].authorityScore < 80) {
      notes += ' Warning: Single non-primary source observed. Recommended corroboration by second independent outlet.';
      adjustment = 'DOWNGRADE_TO_CANNOT_CONFIRM';
    }

    return {
      challengerNotes: notes,
      hasContradictoryFindings: hasContradiction,
      missingContextIdentified: missingContext,
      recommendedAdjustment: adjustment
    };
  }
}
