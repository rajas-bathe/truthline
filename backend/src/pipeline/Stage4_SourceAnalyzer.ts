import { RetrievedSource } from './Stage3_EvidenceRetriever';

export interface EvaluatedSource extends RetrievedSource {
  authorityScore: number;
  sourceType: 'primary_document' | 'fact_checker' | 'journalism' | 'general_web';
  isIndependent: boolean;
  freshnessScore: number; // 0.0 to 1.0
}

export interface Stage4Output {
  evaluatedSources: EvaluatedSource[];
  primarySourceCount: number;
  factCheckerCount: number;
  averageAuthority: number;
}

const PRIMARY_DOMAINS = ['.gov', '.edu', '.nic.in', 'isro.gov.in', 'nasa.gov', 'who.int', 'un.org', 'cdc.gov'];
const FACT_CHECK_DOMAINS = ['snopes.com', 'factcheck.org', 'reuters.com/fact-check', 'politifact.com', 'altnews.in', 'boomlive.in', 'factcheck.pib.gov.in', 'apnews.com/hub/ap-fact-check'];
const MAJOR_NEWS_DOMAINS = ['reuters.com', 'apnews.com', 'bbc.com', 'bbc.co.uk', 'thehindu.com', 'ndtv.com', 'indiatoday.in', 'nytimes.com', 'theguardian.com', 'washingtonpost.com'];

export class Stage4_SourceAnalyzer {
  analyzeSources(sources: RetrievedSource[]): Stage4Output {
    const evaluated: EvaluatedSource[] = [];
    const seenPublishers = new Set<string>();

    let primaryCount = 0;
    let factCheckCount = 0;
    let totalAuthority = 0;

    for (const src of sources) {
      let urlObj: URL | null = null;
      try {
        urlObj = new URL(src.url);
      } catch {
        // invalid URL
      }

      const hostname = urlObj ? urlObj.hostname.toLowerCase() : (src.publisher || '').toLowerCase();
      const pathname = urlObj ? urlObj.pathname.toLowerCase() : '';
      const fullPath = hostname + pathname;

      let sourceType: 'primary_document' | 'fact_checker' | 'journalism' | 'general_web' = 'general_web';
      let authorityScore = 65;

      if (PRIMARY_DOMAINS.some(d => hostname.endsWith(d))) {
        sourceType = 'primary_document';
        authorityScore = 95;
        primaryCount++;
      } else if (FACT_CHECK_DOMAINS.some(d => fullPath.includes(d))) {
        sourceType = 'fact_checker';
        authorityScore = 92;
        factCheckCount++;
      } else if (MAJOR_NEWS_DOMAINS.some(d => hostname.endsWith(d))) {
        sourceType = 'journalism';
        authorityScore = 85;
      }

      // Independence test: first time seeing publisher vs syndicated repeats
      const isIndependent = !seenPublishers.has(hostname);
      seenPublishers.add(hostname);

      totalAuthority += authorityScore;

      evaluated.push({
        ...src,
        authorityScore,
        sourceType,
        isIndependent,
        freshnessScore: 0.9 // default recent
      });
    }

    const avg = evaluated.length > 0 ? Math.round(totalAuthority / evaluated.length) : 0;

    return {
      evaluatedSources: evaluated,
      primarySourceCount: primaryCount,
      factCheckerCount: factCheckCount,
      averageAuthority: avg
    };
  }
}
