import https from 'https';
import { config } from '../config/env';
import { logger } from '../security/logger';

export interface FactCheckArticle {
  claim: string;
  claimant?: string;
  publisher: string;
  url: string;
  rating: string;
  reviewDate?: string;
}

export class FactCheckProvider {
  private apiKey: string | null;

  constructor(apiKey: string | null = config.googleFactCheckApiKey) {
    this.apiKey = apiKey;
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  async searchFactChecks(query: string): Promise<FactCheckArticle[]> {
    if (!this.isAvailable()) return [];

    return new Promise((resolve) => {
      const encodedQuery = encodeURIComponent(query);
      const url = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodedQuery}&key=${this.apiKey}`;

      https.get(url, { timeout: 8000 }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            if (res.statusCode === 200) {
              const data = JSON.parse(body);
              const claims = data.claims || [];
              const articles: FactCheckArticle[] = [];

              for (const c of claims) {
                const reviews = c.claimReview || [];
                for (const r of reviews) {
                  articles.push({
                    claim: c.text,
                    claimant: c.claimant,
                    publisher: r.publisher?.name || 'Fact-Checker',
                    url: r.url,
                    rating: r.textualRating || 'Unrated',
                    reviewDate: r.reviewDate
                  });
                }
              }

              resolve(articles);
            } else {
              logger.warn(`Google Fact Check API returned status ${res.statusCode}`);
              resolve([]);
            }
          } catch {
            resolve([]);
          }
        });
      }).on('error', (e) => {
        logger.warn('Google Fact Check API error: ' + e.message);
        resolve([]);
      });
    });
  }
}
