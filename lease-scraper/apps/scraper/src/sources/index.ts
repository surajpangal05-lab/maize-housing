/**
 * Source-specific scrapers for different rental listing sites
 */

import { chromium, type Browser, type Page } from 'playwright';
import * as cheerio from 'cheerio';
import { createLogger, type Logger, type NormalizedListing, RateLimiter } from '@michigan-rental/shared';

export interface SourceScraper {
  name: string;
  baseUrl: string;
  scrapeListings(): Promise<NormalizedListing[]>;
}

export interface ScraperOptions {
  limit?: number;
  logger?: Logger;
  rateLimitRps?: number;
}

/**
 * Base class for HTML-based scrapers
 */
export abstract class HtmlScraper implements SourceScraper {
  abstract name: string;
  abstract baseUrl: string;
  
  protected logger: Logger;
  protected options: ScraperOptions;
  protected rateLimiter: RateLimiter;
  protected browser: Browser | null = null;

  constructor(options: ScraperOptions = {}) {
    this.options = options;
    this.logger = options.logger || createLogger(this.name || 'html-scraper');
    this.rateLimiter = new RateLimiter(options.rateLimitRps || 0.5);
  }

  abstract scrapeListings(): Promise<NormalizedListing[]>;

  protected async initBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }
    return this.browser;
  }

  protected async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  protected async fetchPage(url: string): Promise<string> {
    const host = new URL(url).hostname;
    await this.rateLimiter.wait(host);

    const browser = await this.initBrowser();
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    });
    const page = await context.newPage();

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      const html = await page.content();
      return html;
    } finally {
      await context.close();
    }
  }

  protected parsePrice(text: string | null | undefined): number | null {
    if (!text) return null;
    const match = text.replace(/,/g, '').match(/\$?(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

  protected parseBeds(text: string | null | undefined): number | null {
    if (!text) return null;
    const match = text.match(/(\d+)\s*(?:bed|br|bedroom)/i);
    if (match) return parseInt(match[1], 10);
    if (/studio/i.test(text)) return 0;
    return null;
  }

  protected parseBaths(text: string | null | undefined): number | null {
    if (!text) return null;
    const match = text.match(/(\d+(?:\.\d+)?)\s*(?:bath|ba|bathroom)/i);
    return match ? parseFloat(match[1]) : null;
  }

  protected parseSqft(text: string | null | undefined): number | null {
    if (!text) return null;
    const match = text.replace(/,/g, '').match(/(\d+)\s*(?:sq\.?\s*ft|sqft|square\s*feet)/i);
    return match ? parseInt(match[1], 10) : null;
  }
}
