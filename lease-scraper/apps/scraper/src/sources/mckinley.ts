/**
 * McKinley Properties scraper
 * Scrapes https://www.mckinley.com/communities/ann-arbor/
 */

import * as cheerio from 'cheerio';
import { type NormalizedListing } from '@michigan-rental/shared';
import { HtmlScraper, type ScraperOptions } from './index';

export class McKinleyScraper extends HtmlScraper {
  name = 'mckinley';
  baseUrl = 'https://www.mckinley.com';

  constructor(options: ScraperOptions = {}) {
    super(options);
  }

  async scrapeListings(): Promise<NormalizedListing[]> {
    const listings: NormalizedListing[] = [];

    try {
      // Get list of Ann Arbor properties
      const listPageUrl = `${this.baseUrl}/communities/ann-arbor/`;
      this.logger.info({ url: listPageUrl }, 'Fetching McKinley property list');
      
      const listHtml = await this.fetchPage(listPageUrl);
      const $ = cheerio.load(listHtml);

      // Find all property links
      const propertyLinks: string[] = [];
      $('a[href*="/apartments/michigan/ann-arbor/"]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && !propertyLinks.includes(href)) {
          propertyLinks.push(href.startsWith('http') ? href : `${this.baseUrl}${href}`);
        }
      });

      this.logger.info({ count: propertyLinks.length }, 'Found McKinley properties');

      // Scrape each property page
      for (const url of propertyLinks) {
        if (this.options.limit && listings.length >= this.options.limit) break;

        try {
          const propertyListings = await this.scrapePropertyPage(url);
          listings.push(...propertyListings);
          this.logger.info({ url, count: propertyListings.length }, 'Scraped McKinley property');
        } catch (err) {
          this.logger.warn({ url, error: (err as Error).message }, 'Failed to scrape McKinley property');
        }
      }
    } finally {
      await this.closeBrowser();
    }

    return listings;
  }

  private async scrapePropertyPage(url: string): Promise<NormalizedListing[]> {
    const html = await this.fetchPage(url);
    const $ = cheerio.load(html);
    const listings: NormalizedListing[] = [];

    // Extract property name and address
    const propertyName = $('h1').first().text().trim();
    const addressText = $('.address, [class*="address"]').first().text().trim();
    
    // Parse address
    const addressMatch = addressText.match(/(\d+[^,]+),?\s*([^,]+),?\s*([A-Z]{2})\s*(\d{5})?/i);
    const street = addressMatch?.[1]?.trim() || propertyName;
    const city = addressMatch?.[2]?.trim() || 'Ann Arbor';
    const state = addressMatch?.[3]?.trim() || 'MI';
    const zip = addressMatch?.[4]?.trim() || null;

    // Look for floor plans / unit types
    const floorPlanSelectors = [
      '.floor-plan',
      '.floorplan',
      '[class*="floor-plan"]',
      '[class*="unit-type"]',
      '.pricing-table tr',
      'table tbody tr',
    ];

    let foundFloorPlans = false;
    for (const selector of floorPlanSelectors) {
      $(selector).each((_, el) => {
        const $el = $(el);
        const text = $el.text();
        
        const beds = this.parseBeds(text);
        const baths = this.parseBaths(text);
        const price = this.parsePrice(text);
        const sqft = this.parseSqft(text);

        if (beds !== null || price !== null) {
          foundFloorPlans = true;
          listings.push({
            sourceListingId: `mckinley-${url.split('/').pop()}-${beds}br`,
            canonicalUrl: url,
            title: `${propertyName} - ${beds || 'Studio'} Bedroom`,
            street,
            city,
            state,
            zip,
            beds,
            baths,
            priceMin: price,
            priceMax: price,
            sqft,
            propertyType: 'apartment',
            description: $('meta[name="description"]').attr('content') || null,
            imageUrls: this.extractImages($),
            contactJson: this.extractContact($),
          });
        }
      });

      if (foundFloorPlans) break;
    }

    // If no floor plans found, create a single listing for the property
    if (!foundFloorPlans) {
      const pageText = $('body').text();
      listings.push({
        sourceListingId: `mckinley-${url.split('/').pop()}`,
        canonicalUrl: url,
        title: propertyName,
        street,
        city,
        state,
        zip,
        beds: this.parseBeds(pageText),
        baths: this.parseBaths(pageText),
        priceMin: this.parsePrice(pageText),
        propertyType: 'apartment',
        description: $('meta[name="description"]').attr('content') || null,
        imageUrls: this.extractImages($),
        contactJson: this.extractContact($),
      });
    }

    return listings;
  }

  private extractImages($: cheerio.CheerioAPI): string[] {
    const images: string[] = [];
    $('img[src*="apartment"], img[src*="property"], img[src*="gallery"], .gallery img, [class*="gallery"] img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && !images.includes(src)) {
        images.push(src.startsWith('http') ? src : `${this.baseUrl}${src}`);
      }
    });
    return images.slice(0, 20);
  }

  private extractContact($: cheerio.CheerioAPI): { phone?: string; email?: string } | null {
    const phone = $('a[href^="tel:"]').first().attr('href')?.replace('tel:', '');
    const email = $('a[href^="mailto:"]').first().attr('href')?.replace('mailto:', '');
    
    if (phone || email) {
      return { phone, email };
    }
    return null;
  }
}
