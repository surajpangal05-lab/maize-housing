import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import type { RawListing } from '@michigan-rental/shared';
import { RateLimiter, createLogger, type Logger } from '@michigan-rental/shared';

export interface HtmlFallbackOptions {
  logger?: Logger;
  rateLimitRps?: number;
  limit?: number;
}

/**
 * Fallback scraper that uses Playwright to render pages and Cheerio to parse HTML.
 * Used when no JSON API endpoint can be discovered.
 */
export class HtmlFallbackScraper {
  private logger: Logger;
  private rateLimiter: RateLimiter;
  private options: HtmlFallbackOptions;

  constructor(options: HtmlFallbackOptions = {}) {
    this.logger = options.logger || createLogger('html-fallback');
    this.rateLimiter = new RateLimiter(options.rateLimitRps || 1);
    this.options = options;
  }

  async scrape(targetUrl: string): Promise<RawListing[]> {
    this.logger.info({ targetUrl }, 'Starting HTML fallback scrape');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    });

    const listings: RawListing[] = [];

    try {
      const page = await context.newPage();
      await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(3000);

      // Get the full rendered HTML
      const html = await page.content();
      const listingUrls = this.extractListingUrls(html, targetUrl);

      this.logger.info({ count: listingUrls.length }, 'Found listing URLs');

      const limit = this.options.limit || 0;
      const urlsToProcess = limit > 0 ? listingUrls.slice(0, limit) : listingUrls;

      for (const listingUrl of urlsToProcess) {
        try {
          await this.rateLimiter.wait(new URL(listingUrl).hostname);
          const listing = await this.scrapeListingDetail(page, listingUrl);
          if (listing) {
            listings.push(listing);
            this.logger.info({ url: listingUrl, title: listing.title }, 'Scraped listing');
          }
        } catch (err) {
          this.logger.warn({ url: listingUrl, error: (err as Error).message }, 'Failed to scrape listing');
        }
      }
    } finally {
      await browser.close();
    }

    this.logger.info({ total: listings.length }, 'HTML fallback scrape complete');
    return listings;
  }

  private extractListingUrls(html: string, baseUrl: string): string[] {
    const $ = cheerio.load(html);
    const urls = new Set<string>();

    // Common listing link patterns
    const selectors = [
      'a[href*="/listing"]',
      'a[href*="/property"]',
      'a[href*="/rental"]',
      'a[href*="/unit"]',
      '.listing-card a',
      '.property-card a',
      '[data-listing] a',
      '.card a[href]',
    ];

    for (const selector of selectors) {
      $(selector).each((_, el) => {
        const href = $(el).attr('href');
        if (href) {
          try {
            const fullUrl = new URL(href, baseUrl).toString();
            if (fullUrl.includes(new URL(baseUrl).hostname)) {
              urls.add(fullUrl);
            }
          } catch {
            // invalid URL
          }
        }
      });
    }

    return Array.from(urls);
  }

  private async scrapeListingDetail(page: import('playwright').Page, url: string): Promise<RawListing | null> {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    const html = await page.content();
    const $ = cheerio.load(html);

    // Try to extract JSON-LD structured data first
    const jsonLd = this.extractJsonLd($);
    if (jsonLd) return { ...jsonLd, url, canonicalUrl: url };

    // Fall back to HTML parsing
    const listing: RawListing = { url, canonicalUrl: url };

    // Title
    listing.title =
      $('h1').first().text().trim() ||
      $('[class*="title"]').first().text().trim() ||
      $('title').text().trim();

    // Price
    const priceText =
      $('[class*="price"]').first().text().trim() ||
      $('[class*="rent"]').first().text().trim();
    if (priceText) listing.price = priceText;

    // Address
    listing.address =
      $('[class*="address"]').first().text().trim() ||
      $('address').first().text().trim();

    // Description
    listing.description =
      $('[class*="description"]').first().text().trim() ||
      $('[class*="details"]').first().text().trim();

    // Beds/Baths
    const bedsText = $('[class*="bed"]').first().text().trim();
    const bathsText = $('[class*="bath"]').first().text().trim();
    const bedsMatch = bedsText.match(/(\d+)/);
    const bathsMatch = bathsText.match(/(\d+\.?\d*)/);
    if (bedsMatch) listing.beds = bedsMatch[1];
    if (bathsMatch) listing.baths = bathsMatch[1];

    // Square feet
    const sqftText = $('[class*="sqft"], [class*="square"], [class*="area"]').first().text().trim();
    const sqftMatch = sqftText.match(/([\d,]+)/);
    if (sqftMatch) listing.sqft = sqftMatch[1].replace(/,/g, '');

    // Images
    const images: string[] = [];
    $('img[src]').each((_, el) => {
      const src = $(el).attr('src') || '';
      const dataSrc = $(el).attr('data-src') || '';
      const imgUrl = dataSrc || src;
      if (imgUrl && (imgUrl.includes('listing') || imgUrl.includes('property') || imgUrl.includes('photo') || imgUrl.includes('image'))) {
        try {
          images.push(new URL(imgUrl, url).toString());
        } catch { /* skip */ }
      }
    });

    // Also check gallery/carousel images
    $('[class*="gallery"] img, [class*="carousel"] img, [class*="slider"] img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || '';
      if (src) {
        try {
          images.push(new URL(src, url).toString());
        } catch { /* skip */ }
      }
    });

    listing.images = [...new Set(images)];

    // Contact
    const phoneMatch = $('body').text().match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
    if (phoneMatch) listing.phone = phoneMatch[1];

    const emailMatch = $('a[href^="mailto:"]').first().attr('href');
    if (emailMatch) listing.email = emailMatch.replace('mailto:', '');

    return listing;
  }

  private extractJsonLd($: cheerio.CheerioAPI): RawListing | null {
    try {
      const scripts = $('script[type="application/ld+json"]');
      for (let i = 0; i < scripts.length; i++) {
        const text = $(scripts[i]).html();
        if (!text) continue;
        const data = JSON.parse(text);
        if (
          data['@type'] === 'Apartment' ||
          data['@type'] === 'RealEstateListing' ||
          data['@type'] === 'Residence' ||
          data['@type'] === 'Product'
        ) {
          return {
            title: data.name,
            description: data.description,
            address: data.address?.streetAddress,
            city: data.address?.addressLocality,
            state: data.address?.addressRegion,
            zip: data.address?.postalCode,
            lat: data.geo?.latitude,
            lng: data.geo?.longitude,
            price: data.offers?.price || data.price,
            images: data.image ? (Array.isArray(data.image) ? data.image : [data.image]) : [],
          };
        }
      }
    } catch {
      // ignore
    }
    return null;
  }
}
