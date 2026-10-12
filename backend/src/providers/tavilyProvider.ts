import https from 'https';
import { config } from '../config/env';
import { logger } from '../security/logger';

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export class TavilyProvider {
  private apiKey: string | null;

  constructor(apiKey: string | null = config.tavilyApiKey) {
    this.apiKey = apiKey;
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  async search(query: string, maxResults = 4): Promise<TavilySearchResult[]> {
    if (!this.isAvailable()) return [];

    return new Promise((resolve) => {
      const data = JSON.stringify({
        api_key: this.apiKey,
        query,
        search_depth: 'advanced',
        include_answer: false,
        max_results: maxResults
      });

      const req = https.request(
        'https://api.tavily.com/search',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
          },
          timeout: 8000
        },
        (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => {
            try {
              if (res.statusCode === 200) {
                const parsed = JSON.parse(body);
                const results = (parsed.results || []).map((r: any) => ({
                  title: r.title || r.url,
                  url: r.url,
                  content: r.content || '',
                  score: r.score || 0.8
                }));
                resolve(results);
              } else {
                logger.warn(`Tavily search returned status ${res.statusCode}`);
                resolve([]);
              }
            } catch {
              resolve([]);
            }
          });
        }
      );

      req.on('error', (e) => {
        logger.warn('Tavily request error: ' + e.message);
        resolve([]);
      });

      req.on('timeout', () => {
        req.destroy();
        resolve([]);
      });

      req.write(data);
      req.end();
    });
  }
}
