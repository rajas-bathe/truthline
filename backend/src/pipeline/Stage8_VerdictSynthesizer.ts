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
    customLimitations?: string,
    language: string = 'en'
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
    const explanation = customExplanation || this.generateDefaultExplanation(verdict, claims, sources, language);

    // 3. Format WhatsApp forwardable rebuttal
    const topSourcesText = sources.slice(0, 2).map(s => s.url).join('\n') || (language === 'hi' ? 'सार्वजनिक व आधिकारिक अभिलेख' : language === 'mr' ? 'अधिकृत नोंदी' : 'Independent public records');

    const localizedVerdicts: Record<string, Record<AllowedVerdict, string>> = {
      hi: {
        VERIFIED: 'सत्यापित (सत्य)',
        FALSE: 'असत्य (फर्जी / भ्रामक)',
        OUTDATED: 'पुराना (अप्रासंगिक)',
        PARTIALLY_SUPPORTED: 'आंशिक रूप से सही',
        CANNOT_CONFIRM: 'पुष्टि नहीं हो सकी'
      },
      mr: {
        VERIFIED: 'सत्य (पडताळलेले)',
        FALSE: 'खोटे (अफवा)',
        OUTDATED: 'जुनी माहिती',
        PARTIALLY_SUPPORTED: 'अंशतः खरे',
        CANNOT_CONFIRM: 'पुष्टी होऊ शकली नाही'
      },
      en: {
        VERIFIED: 'VERIFIED',
        FALSE: 'FALSE',
        OUTDATED: 'OUTDATED',
        PARTIALLY_SUPPORTED: 'PARTIALLY_SUPPORTED',
        CANNOT_CONFIRM: 'CANNOT_CONFIRM'
      }
    };

    const verdictLabel = (localizedVerdicts[language] || localizedVerdicts.en)[verdict];

    let whatsappRebuttal = `*TRUTHLINE AI VERIFICATION*\n\nVerdict: *${verdict}*\n\nSummary: ${explanation}\n\nEvidence Citations:\n${topSourcesText}\n\n_Don't just forward. Verify._`;
    if (language === 'hi') {
      whatsappRebuttal = `*ट्रूथलाइन एआई सत्यापन (TRUTHLINE AI)*\n\nनिष्कर्ष: *${verdictLabel}*\n\nसारांश: ${explanation}\n\nसाक्ष्य स्रोत:\n${topSourcesText}\n\n_केवल आगे न भेजें। पहले जाँचें।_`;
    } else if (language === 'mr') {
      whatsappRebuttal = `*ट्रूथलाइन एआई पडताळणी (TRUTHLINE AI)*\n\nनिष्कर्ष: *${verdictLabel}*\n\nसारांश: ${explanation}\n\nपुरावे:\n${topSourcesText}\n\n_फक्त पुढे पाठवू नका, खात्री करा._`;
    }

    // 4. Calculate evidence strength score (0 to 100)
    let score = 20;
    if (verdict === 'VERIFIED') score = Math.min(98, 80 + sources.length * 5);
    else if (verdict === 'FALSE') score = Math.min(95, 75 + sources.length * 6);
    else if (verdict === 'OUTDATED') score = 88;
    else if (verdict === 'PARTIALLY_SUPPORTED') score = 70;
    else if (verdict === 'CANNOT_CONFIRM') score = 25;

    const limitations = customLimitations || (
      language === 'hi'
        ? 'मूल्यांकन वर्तमान में उपलब्ध खुले वेब साक्ष्यों और तथ्य-जाँच रजिस्ट्रीयों पर आधारित हैं। ट्रूथलाइन नीति के तहत केवल साक्ष्य न मिलने पर किसी दावे को फर्जी नहीं माना जाता।'
        : language === 'mr'
        ? 'मूल्यांकन सध्या उपलब्ध असलेल्या खुल्या वेब पुराव्यांवर आधारित आहे. ट्रूथलाइन नियमावलीनुसार, फक्त पुरावा न मिळाल्यामुळे कोणताही दावा खोटा ठरवला जात नाही.'
        : 'Evaluations are grounded in currently available open web citations and fact-check registries. Under TruthLine policy, claims are never marked false without verifiable proof.'
    );

    return {
      overallVerdict: verdict,
      explanation,
      whatsappRebuttal,
      limitations,
      evidenceStrengthScore: score
    };
  }

  private generateDefaultExplanation(verdict: AllowedVerdict, claims: AtomicClaim[], sources: EvaluatedSource[], language: string = 'en'): string {
    if (language === 'hi') {
      switch (verdict) {
        case 'VERIFIED':
          return `सभी ${claims.length} दावों की आधिकारिक व स्वतंत्र रिपोर्टिंग और प्राथमिक साक्ष्यों द्वारा पुष्टि की गई है।`;
        case 'FALSE':
          return `इस दावे का आधिकारिक अभिलेखों और प्रतिष्ठित तथ्य-जाँच संस्थाओं ने पूर्ण खंडन किया है।`;
        case 'OUTDATED':
          return `यह आदेश पहले का एक पुराना ऐतिहासिक परिपत्र है, जिसे आज की ताज़ा घटना के रूप में भ्रामक ढंग से पुनः साझा किया जा रहा है।`;
        case 'PARTIALLY_SUPPORTED':
          return `दावे के कुछ अंश सही हैं, लेकिन मुख्य विवरण या आँकड़े भ्रामक या अतिशयोक्तिपूर्ण हैं।`;
        case 'CANNOT_CONFIRM':
        default:
          return `सार्वजनिक व आधिकारिक अभिलेखों में इस दावे की पुष्टि या खंडन के लिए पर्याप्त साक्ष्य उपलब्ध नहीं हैं। ट्रूथलाइन नीति के तहत, केवल साक्ष्य न मिलने पर किसी दावे को फर्जी नहीं माना जाता।`;
      }
    }

    if (language === 'mr') {
      switch (verdict) {
        case 'VERIFIED':
          return `सर्व ${claims.length} दाव्यांची अधिकृत आणि स्वतंत्र वृत्तांद्वारे पूर्ण पुष्टी झाली आहे.`;
        case 'FALSE':
          return `या दाव्याचा अधिकृत नोंदी आणि तथ्य-पडताळणी यंत्रणांनी स्पष्ट इन्कार केला आहे.`;
        case 'OUTDATED':
          return `हे पत्रक जुने परिपत्रक आहे, जे आजचे असल्याचे भासवून दिशाभूल करण्यासाठी पुन्हा पसरवले जात आहे.`;
        case 'PARTIALLY_SUPPORTED':
          return `दाव्यातील काही भाग खरा आहे, पण मुख्य भाग अतिशयोक्त किंवा दिशाभूल करणारा आहे.`;
        case 'CANNOT_CONFIRM':
        default:
          return `सार्वजनिक व अधिकृत नोंदींमध्ये या दाव्याची खात्री पटण्यासाठी पुरेसा पुरावा उपलब्ध नाही. ट्रूथलाइन नियमावलीनुसार, फक्त पुरावा न मिळाल्यामुळे कोणताही दावा खोटा ठरवला जात नाही.`;
      }
    }

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
        return `Insufficient authoritative public documentation was found to definitively corroborate or refute this assertion. Under TruthLine policy, claims are never classified false solely due to absence of evidence.`;
    }
  }
}
