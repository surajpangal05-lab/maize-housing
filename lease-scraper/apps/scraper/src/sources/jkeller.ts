/**
 * J. Keller Properties scraper
 * Scrapes https://www.jkellerproperties.com/rentals
 */

import * as cheerio from 'cheerio';
import { type NormalizedListing } from '@michigan-rental/shared';
import { HtmlScraper, type ScraperOptions } from './index';

export class JKellerScraper extends HtmlScraper {
  name = 'jkeller';
  baseUrl = 'https://www.jkellerproperties.com';

  constructor(options: ScraperOptions = {}) {
    super(options);
  }

  async scrapeListings(): Promise<NormalizedListing[]> {
    const listings: NormalizedListing[] = [];

    try {
      // Get the search/rentals page
      const searchUrl = `${this.baseUrl}/search`;
      this.logger.info({ url: searchUrl }, 'Fetching J. Keller rentals');
      
      const html = await this.fetchPage(searchUrl);
      const $ = cheerio.load(html);

      // Find all property cards/listings
      const propertyLinks: string[] = [];
      $('a[href*="/property/"], a[href*="/listing/"], .property-card a, .listing a').each((_, el) => {
        const href = $(el).attr('href');
        if (href && !propertyLinks.includes(href)) {
          propertyLinks.push(href.startsWith('http') ? href : `${this.baseUrl}${href}`);
        }
      });

      // Also try to extract listings directly from the page
      $('.property, .listing, [class*="property-card"], [class*="listing-card"]').each((i, el) => {
        const $el = $(el);
        const listing = this.parseListingCard($, $el, i);
        if (listing) listings.push(listing);
      });

      this.logger.info({ cardsFound: listings.length, linksFound: propertyLinks.length }, 'Found J. Keller listings');

      // If we found property links, scrape each one
      for (const url of propertyLinks) {
        if (this.options.limit && listings.length >= this.options.limit) break;

        try {
          const listing = await this.scrapePropertyPage(url);
          if (listing) {
            // Check for duplicates
            const isDupe = listings.some(l => l.canonicalUrl === listing.canonicalUrl);
            if (!isDupe) listings.push(listing);
          }
        } catch (err) {
          this.logger.warn({ url, error: (err as Error).message }, 'Failed to scrape J. Keller property');
        }
      }
    } finally {
      await this.closeBrowser();
    }

    return listings;
  }

  private parseListingCard($: cheerio.CheerioAPI, $el: cheerio.Cheerio<cheerio.Element>, index: number): NormalizedListing | null {
    const text = $el.text();
    const href = $el.find('a').first().attr('href');
    
    // Extract address
    const addressEl = $el.find('.address, [class*="address"]').first();
    const addressText = addressEl.text().trim() || $el.find('h2, h3, .title').first().text().trim();
    
    if (!addressText) return null;

    const addressMatch = addressText.match(/(\d+[^,]+),?\s*([^,]+)?,?\s*([A-Z]{2})?\s*(\d{5})?/i);
    
    return {
      sourceListingId: `jkeller-${index}-${Date.now()}`,
      canonicalUrl: href ? (href.startsWith('http') ? href : `${this.baseUrl}${href}`) : `${this.baseUrl}/search`,
      title: addressText,
      street: addressMatch?.[1]?.trim() || addressText,
      city: addressMatch?.[2]?.trim() || 'Ann Arbor',
      state: addressMatch?.[3]?.trim() || 'MI',
      zip: addressMatch?.[4]?.trim() || null,
      beds: this.parseBeds(text),
      baths: this.parseBaths(text),
      priceMin: this.parsePrice(text),
      sqft: this.parseSqft(text),
      propertyType: 'house',
      imageUrls: [],
    };
  }

  private async scrapePropertyPage(url: string): Promise<NormalizedListing | null> {
    const html = await this.fetchPage(url);
    const $ = cheerio.load(html);

    const title = $('h1').first().text().trim();
    if (!title) return null;

    const addressMatch = title.match(/(\d+[^,]+),?\s*([^,]+)?,?\s*([A-Z]{2})?\s*(\d{5})?/i);
    const pageText = $('body').text();

    return {
      sourceListingId: `jkeller-${url.split('/').pop()}`,
      canonicalUrl: url,
      title,
      street: addressMatch?.[1]?.trim() || title,
      city: addressMatch?.[2]?.trim() || 'Ann Arbor',
      state: addressMatch?.[3]?.trim() || 'MI',
      zip: addressMatch?.[4]?.trim() || null,
      beds: this.parseBeds(pageText),
      baths: this.parseBaths(pageText),
      priceMin: this.parsePrice(pageText),
      sqft: this.parseSqft(pageText),
      propertyType: 'house',
      description: $('meta[name="description"]').attr('content') || null,
      imageUrls: this.extractImages($),
      contactJson: {
        phone: '734-369-8239',
        email: 'info@jkellerproperties.com',
      },
    };
  }

  private extractImages($: cheerio.CheerioAPI): string[] {
    const images: string[] = [];
    $('img[src*="property"], img[src*="listing"], .gallery img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && !images.includes(src)) {
        images.push(src.startsWith('http') ? src : `${this.baseUrl}${src}`);
      }
    });
    return images.slice(0, 20);
  }
}
