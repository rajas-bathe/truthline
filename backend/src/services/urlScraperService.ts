import * as cheerio from 'cheerio';
import { safeFetchUrl } from '../security/ssrf';
import { logger } from '../security/logger';

export interface ScrapedPageResult {
  url: string;
  title: string;
  text: string;
  publisher: string;
  publishedDate?: string;
  description?: string;
}

export async function scrapeUrlContent(targetUrl: string): Promise<ScrapedPageResult> {
  logger.info(`Fetching URL safely with SSRF protection: ${targetUrl}`);
  const fetchResult = await safeFetchUrl(targetUrl);

  const $ = cheerio.load(fetchResult.content);

  // Remove non-content elements
  $('script, style, nav, footer, header, aside, iframe, noscript, svg, form').remove();

  // Extract Metadata
  const title =
    $('meta[property="og:title"]').attr('content') ||
    $('meta[name="twitter:title"]').attr('content') ||
    $('title').text().trim() ||
    targetUrl;

  const publisher =
    $('meta[property="og:site_name"]').attr('content') ||
    $('meta[name="publisher"]').attr('content') ||
    new URL(fetchResult.finalUrl).hostname.replace('www.', '');

  const publishedDate =
    $('meta[property="article:published_time"]').attr('content') ||
    $('meta[name="pubdate"]').attr('content') ||
    $('meta[name="date"]').attr('content') ||
    $('time').first().attr('datetime');

  const description =
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="description"]').attr('content');

  // Extract main body content
  let bodyText = '';
  const articleEl = $('article, main, .article-content, .entry-content, .post-content').first();
  if (articleEl.length > 0) {
    bodyText = articleEl.text();
  } else {
    bodyText = $('body').text();
  }

  // Normalize whitespace
  const cleanedText = bodyText
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();

  logger.info(`Scraped page "${title}" (${cleanedText.length} characters)`);

  return {
    url: fetchResult.finalUrl,
    title,
    text: cleanedText.slice(0, 10000), // Cap at 10,000 characters for processing
    publisher,
    publishedDate,
    description
  };
}
