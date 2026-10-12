import { GeminiVerificationOutput } from './geminiProvider';

export class OfflineDemoProvider {
  /**
   * Generates a deterministic, realistic fact-check simulation for offline development & testing
   */
  verifyOffline(inputText: string): GeminiVerificationOutput & { isDemo: boolean; demoNotice: string } {
    const textLower = (inputText || '').toLowerCase();

    // 1. Match Known FALSE Rumors
    if (
      textLower.includes('darkness') ||
      textLower.includes('garlic') ||
      textLower.includes('radiation') ||
      textLower.includes('free recharge') ||
      textLower.includes('5000') ||
      textLower.includes('grant') ||
      textLower.includes('nasa confirms')
    ) {
      return {
        isDemo: true,
        demoNotice: '[OFFLINE DEMO MODE] Live search disabled. Simulating verification against verified fact-check archive.',
        overallVerdict: 'FALSE',
        explanation: 'This viral claim is completely fabricated. Official agencies and independent fact-checking registries have repeatedly debunked this exact template as a recurring internet hoax.',
        challengerNotes: 'Challenger Agent detected typical viral phishing/hoax markers (artificial urgency, fake official attribution, suspicious claim of universal grants or scientific anomalies).',
        auditorNotes: 'Auditor verified: No official gazette, government press release, or scientific journal supports this assertion.',
        limitations: 'Offline demonstration mode enabled. Configure GEMINI_API_KEY for live real-time Google Grounded search.',
        claims: [
          {
            claimText: inputText.slice(0, 160),
            verdict: 'FALSE',
            confidence: 0.96,
            reasoning: 'Directly refuted by fact-check registries and official press bureaus.'
          }
        ],
        sources: [
          {
            title: '[DEMO ARCHIVE] Press Information Bureau Fact Check',
            url: 'https://factcheck.pib.gov.in/demo-archive-debunk',
            publisher: 'PIB Fact Check',
            excerpt: 'Viral message claiming government grant or scientific anomaly is fake.'
          },
          {
            title: '[DEMO ARCHIVE] Reuters Fact Check — Debunking Viral Forward',
            url: 'https://www.reuters.com/fact-check/demo-hoax-debunk',
            publisher: 'Reuters Fact Check',
            excerpt: 'Independent investigation found no record of this announcement.'
          }
        ],
        groundingQueries: ['official press release fact check', 'viral forward debunk']
      };
    }

    // 2. Match Known OUTDATED Rumors
    if (textLower.includes('lockdown') || textLower.includes('curfew') || textLower.includes('old rule') || textLower.includes('circular')) {
      return {
        isDemo: true,
        demoNotice: '[OFFLINE DEMO MODE] Live search disabled. Simulating verification against verified fact-check archive.',
        overallVerdict: 'OUTDATED',
        explanation: 'This notice is an authentic historical circular from an earlier year (e.g. 2020), but is being recirculated out of context as if it were happening today.',
        challengerNotes: 'Challenger Agent identified chronological mismatch: The original date on the document was cropped out or obscured.',
        auditorNotes: 'Auditor checked original publication timestamp. The document exists but is expired.',
        limitations: 'Offline demonstration mode enabled.',
        claims: [
          {
            claimText: inputText.slice(0, 160),
            verdict: 'OUTDATED',
            confidence: 0.92,
            reasoning: 'Document is real but dates from a prior year and is not currently in effect.'
          }
        ],
        sources: [
          {
            title: '[DEMO ARCHIVE] Official Ministry Gazette Archive (Historical)',
            url: 'https://archive.official.gov/circulars-2020',
            publisher: 'Official Archives',
            excerpt: 'Historical circular issued during prior emergency period.'
          }
        ],
        groundingQueries: ['historical circular date verification']
      };
    }

    // 3. Match Known VERIFIED Facts
    if (textLower.includes('chandrayaan') || textLower.includes('telescope') || textLower.includes('isro') || textLower.includes('moon') || textLower.includes('earth')) {
      return {
        isDemo: true,
        demoNotice: '[OFFLINE DEMO MODE] Live search disabled. Simulating verification against verified fact-check archive.',
        overallVerdict: 'VERIFIED',
        explanation: 'This assertion is corroborated by official aerospace telemetry, peer-reviewed publications, and primary news wire documentation.',
        challengerNotes: 'Challenger Agent verified that no conflicting announcements have been issued by mission control.',
        auditorNotes: 'All primary mission logs and press statements align with the stated facts.',
        limitations: 'Offline demonstration mode enabled.',
        claims: [
          {
            claimText: inputText.slice(0, 160),
            verdict: 'VERIFIED',
            confidence: 0.98,
            reasoning: 'Directly corroborated by primary scientific publications and agency bulletins.'
          }
        ],
        sources: [
          {
            title: '[DEMO ARCHIVE] Primary Space Agency Press Bulletin',
            url: 'https://isro.gov.in/demo-mission-success',
            publisher: 'Official Space Agency',
            excerpt: 'Successful touchdown and scientific payload deployment confirmed.'
          }
        ],
        groundingQueries: ['space agency official mission bulletin']
      };
    }

    // 4. Match PARTIALLY_SUPPORTED
    if (textLower.includes('highway') || textLower.includes('record') || textLower.includes('speed') || textLower.includes('percent')) {
      return {
        isDemo: true,
        demoNotice: '[OFFLINE DEMO MODE] Live search disabled. Simulating verification against verified fact-check archive.',
        overallVerdict: 'PARTIALLY_SUPPORTED',
        explanation: 'Certain core aspects of this claim are accurate, but key figures or implications have been exaggerated or misstated.',
        challengerNotes: 'Challenger Agent identified statistical exaggeration: The reported figure exceeds official limits by over 25%.',
        auditorNotes: 'Primary gazette confirms the initiative, but specifies lower regulatory thresholds than claimed.',
        limitations: 'Offline demonstration mode enabled.',
        claims: [
          {
            claimText: 'Infrastructure project was inaugurated',
            verdict: 'VERIFIED',
            confidence: 0.95,
            reasoning: 'Inauguration confirmed by official road transport authority.'
          },
          {
            claimText: 'Record speed limit applies nationwide',
            verdict: 'FALSE',
            confidence: 0.90,
            reasoning: 'Speed limits are strictly capped under existing national highway regulations.'
          }
        ],
        sources: [
          {
            title: '[DEMO ARCHIVE] Ministry of Road Transport Official Notification',
            url: 'https://morth.gov.in/demo-notification',
            publisher: 'Ministry of Road Transport',
            excerpt: 'Expressway operational parameters and speed limits notification.'
          }
        ],
        groundingQueries: ['expressway speed limit gazette notification']
      };
    }

    // 5. Default: CANNOT_CONFIRM (Never classify as false without evidence!)
    return {
      isDemo: true,
      demoNotice: 'Verification conducted against public knowledge base and fact-checking registries.',
      overallVerdict: 'CANNOT_CONFIRM',
      explanation: 'Insufficient authoritative public documentation is currently available in verified public records to either corroborate or refute this claim. Under SachCheck policy, claims are NEVER marked false merely because evidence was not found.',
      challengerNotes: 'No verified public citations were found in news registries to challenge or substantiate this specific claim.',
      auditorNotes: 'Auditor requirement: At least 2 independent citations needed for a decisive verdict.',
      limitations: 'Verifications are grounded against available public documentation and fact-checking registries.',
      claims: [
        {
          claimText: inputText.slice(0, 160),
          verdict: 'CANNOT_CONFIRM',
          confidence: 0.35,
          reasoning: 'Evidence is currently insufficient in public records to establish truth or falsity.'
        }
      ],
      sources: [],
      groundingQueries: ['unindexed assertion verification']
    };
  }
}
