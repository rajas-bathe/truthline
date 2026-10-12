import crypto from 'crypto';
import { AtomicClaim } from './Stage2_ClaimExtractor';
import { GroundingSource } from '../providers/geminiProvider';

export interface RetrievedSource {
  id: string;
  claimId?: string;
  title: string;
  url: string;
  publisher?: string;
  publishedDate?: string;
  retrievedAt: number;
  excerpt?: string;
  isSupporting?: boolean;
}

export interface Stage3Output {
  sources: RetrievedSource[];
  searchQueries: string[];
}

export class Stage3_EvidenceRetriever {
  processEvidence(
    claims: AtomicClaim[],
    rawSources: GroundingSource[],
    queriesUsed: string[] = []
  ): Stage3Output {
    const sources: RetrievedSource[] = [];
    const now = Date.now();

    for (const rs of rawSources) {
      if (!rs.url) continue;

      let hostname = rs.publisher;
      try {
        hostname = hostname || new URL(rs.url).hostname.replace('www.', '');
      } catch {
        hostname = 'Web';
      }

      sources.push({
        id: crypto.randomUUID(),
        claimId: claims[0]?.id,
        title: rs.title || rs.url,
        url: rs.url,
        publisher: hostname,
        retrievedAt: now,
        excerpt: rs.excerpt || '',
        isSupporting: true
      });
    }

    return {
      sources,
      searchQueries: queriesUsed.length > 0 ? queriesUsed : claims.map(c => c.claimText.slice(0, 80))
    };
  }
}
