import { AtomicClaim } from './Stage2_ClaimExtractor';
import { EvaluatedSource } from './Stage4_SourceAnalyzer';
import { Stage6Output } from './Stage6_ChallengerAgent';
import { Stage7Output } from './Stage7_EvidenceAuditor';

export type AllowedVerdict = 'VERIFIED' | 'FALSE' | 'OUTDATED' | 'PARTIALLY_SUPPORTED' | 'CANNOT_CONFIRM';

export interface Stage8Output {
  overallVerdict: AllowedVerdict;
  explanation: string;
  whatsappRebuttal: string;
  limitations: string;
  evidenceStrengthScore: number;
}

export class Stage8_VerdictSynthesizer {
  synthesize(
    claims: AtomicClaim[],
    sources: EvaluatedSource[],
    challenger: Stage6Output,
    auditor: Stage7Output,
    customOverallVerdict?: AllowedVerdict,
    customExplanation?: string,
    customLimitations?: string
  ): Stage8Output {
    // 1. Determine overall verdict
    let verdict: AllowedVerdict = customOverallVerdict || 'CANNOT_CONFIRM';

    if (auditor.wasDowngraded && verdict === 'VERIFIED') {
      verdict = 'CANNOT_CONFIRM';
    }

    // Algorithmic claim synthesis if custom verdict not provided or needs reconciliation
    const verdicts = auditor.auditedClaims.map(c => c.verdict);
    const hasFalse = verdicts.includes('FALSE');
    const hasVerified = verdicts.includes('VERIFIED');
    const hasOutdated = verdicts.includes('OUTDATED');
    const hasCannotConfirm = verdicts.includes('CANNOT_CONFIRM');

    if (hasFalse && hasVerified) {
      verdict = 'PARTIALLY_SUPPORTED';
    } else if (hasFalse && !hasVerified) {
      verdict = 'FALSE';
    } else if (hasOutdated && !hasFalse) {
      verdict = 'OUTDATED';
    } else if (hasVerified && !hasFalse && !hasOutdated && !hasCannotConfirm) {
      verdict = 'VERIFIED';
    } else if (sources.length === 0 && verdict === 'VERIFIED') {
      // Safety rule: Never allow VERIFIED without sources
      verdict = 'CANNOT_CONFIRM';
    }

    // 2. Synthesize explanation
    const explanation = customExplanation || this.generateDefaultExplanation(verdict, claims, sources);

    // 3. Format WhatsApp forwardable rebuttal
    const topSourcesText = sources.slice(0, 2).map(s => s.url).join('\n') || 'Independent public records';
    const whatsappRebuttal = `*TRUTHLINE AI VERIFICATION*\n\nVerdict: *${verdict}*\n\nSummary: ${explanation}\n\nEvidence Citations:\n${topSourcesText}\n\n_Don't just forward. Verify._`;

    // 4. Calculate evidence strength score (0 to 100)
    let score = 20;
    if (verdict === 'VERIFIED') score = Math.min(98, 80 + sources.length * 5);
    else if (verdict === 'FALSE') score = Math.min(95, 75 + sources.length * 6);
    else if (verdict === 'OUTDATED') score = 88;
    else if (verdict === 'PARTIALLY_SUPPORTED') score = 70;
    else if (verdict === 'CANNOT_CONFIRM') score = 25;

    const limitations = customLimitations ||
      'Evaluations are grounded in currently available open web citations and fact-check registries. Unreported private events or future policy updates may alter verification status.';

    return {
      overallVerdict: verdict,
      explanation,
      whatsappRebuttal,
      limitations,
      evidenceStrengthScore: score
    };
  }

  private generateDefaultExplanation(verdict: AllowedVerdict, claims: AtomicClaim[], sources: EvaluatedSource[]): string {
    switch (verdict) {
      case 'VERIFIED':
        return `All ${claims.length} propositions are corroborated by independent reporting and primary citations.`;
      case 'FALSE':
        return `The claim has been refuted by verified fact-checkers and official documentation.`;
      case 'OUTDATED':
        return `This circular or statement is authentic from an earlier date, but is misleadingly circulated out of context today.`;
      case 'PARTIALLY_SUPPORTED':
        return `Some elements of the claim are accurate, while key details or statistics are unproven or false.`;
      case 'CANNOT_CONFIRM':
      default:
        return `Insufficient authoritative public documentation was found to definitively corroborate or refute this assertion. (Claims are never classified false solely due to absence of evidence).`;
    }
  }
}
