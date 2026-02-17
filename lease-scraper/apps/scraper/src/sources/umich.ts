/**
 * UMich Off-Campus Housing scraper
 * Scrapes https://offcampushousing.umich.edu/listing
 */

import * as cheerio from 'cheerio';
import { type NormalizedListing } from '@michigan-rental/shared';
import { HtmlScraper, type ScraperOptions } from './index';

export class UMichScraper extends HtmlScraper {
  name = 'umich';
  baseUrl = 'https://offcampushousing.umich.edu';

  constructor(options: ScraperOptions = {}) {
    super(options);
  }

  async scrapeListings(): Promise<NormalizedListing[]> {
    const listings: NormalizedListing[] = [];

    try {
      const listUrl = `${this.baseUrl}/listing`;
      this.logger.info({ url: listUrl }, 'Fetching UMich housing listings');
      
      const html = await this.fetchPage(listUrl);
      const $ = cheerio.load(html);

      // The page uses cards with property info
      // Looking at the structure, listings have address, beds, price, availability
      $('.listing-card, [class*="property-card"], [class*="listing"]').each((i, el) => {
        const $el = $(el);
        const listing = this.parseListingCard($, $el, i);
        if (listing) listings.push(listing);
      });

      // Also try to find listings in a different structure
      // The fetched content shows listings with addresses like "350 Thompson St"
      $('h3, h4, .card-title').each((i, el) => {
        const $el = $(el);
        const text = $el.text().trim();
        
        // Check if it looks like an address
        if (/\d+\s+[A-Za-z]+\s+(St|Ave|Rd|Dr|Ln|Ct|Blvd)/i.test(text)) {
          // Get the parent card
          const $card = $el.closest('.card, [class*="listing"], [class*="property"]');
          if ($card.length === 0) return;
          
          const cardText = $card.text();
          const listing = this.parseAddressCard(text, cardText, i);
          if (listing && !listings.some(l => l.street === listing.street)) {
            listings.push(listing);
          }
        }
      });

      this.logger.info({ count: listings.length }, 'Parsed UMich listings');
    } finally {
      await this.closeBrowser();
    }

    return listings;
  }

  private parseListingCard($: cheerio.CheerioAPI, $el: cheerio.Cheerio<cheerio.Element>, index: number): NormalizedListing | null {
    const text = $el.text();
    
    // Extract address
    const addressMatch = text.match(/(\d+[^,\n]+(?:St|Ave|Rd|Dr|Ln|Ct|Blvd)[^,\n]*),?\s*([^,\n]+)?,?\s*(MI)?\s*(\d{5})?/i);
    if (!addressMatch) return null;

    // Extract price range
    const priceMatch = text.match(/\$(\d{1,3}(?:,\d{3})*)\s*(?:-\s*\$(\d{1,3}(?:,\d{3})*))?/);
    const priceMin = priceMatch ? parseInt(priceMatch[1].replace(/,/g, ''), 10) : null;
    const priceMax = priceMatch?.[2] ? parseInt(priceMatch[2].replace(/,/g, ''), 10) : priceMin;

    // Extract beds
    const bedsMatch = text.match(/(\d+|S(?:tudio)?)\s*(?:-\s*(\d+))?\s*Bed/i);
    let beds: number | null = null;
    if (bedsMatch) {
      if (bedsMatch[1].toLowerCase().startsWith('s')) {
        beds = 0;
      } else {
        beds = parseInt(bedsMatch[1], 10);
      }
    }

    // Extract availability
    const availMatch = text.match(/Available[:\s]*(\d{4}-\d{2}-\d{2}|Now)/i);
    const availabilityDate = availMatch?.[1] && availMatch[1] !== 'Now' 
      ? new Date(availMatch[1])
      : null;

    const street = addressMatch[1].trim();
    
    return {
      sourceListingId: `umich-${street.replace(/\s+/g, '-').toLowerCase()}-${index}`,
      canonicalUrl: `${this.baseUrl}/listing`,
      title: street,
      street,
      city: addressMatch[2]?.trim() || 'Ann Arbor',
      state: 'MI',
      zip: addressMatch[4] || null,
      beds,
      baths: this.parseBaths(text),
      priceMin,
      priceMax,
      sqft: this.parseSqft(text),
      propertyType: 'apartment',
      availabilityDate,
      imageUrls: [],
    };
  }

  private parseAddressCard(address: string, cardText: string, index: number): NormalizedListing | null {
    const addressMatch = address.match(/(\d+[^,]+),?\s*([^,]+)?,?\s*(MI)?\s*(\d{5})?/i);
    if (!addressMatch) return null;

    // Extract price
    const priceMatch = cardText.match(/\$(\d{1,3}(?:,\d{3})*)\s*(?:-\s*\$(\d{1,3}(?:,\d{3})*))?/);
    const priceMin = priceMatch ? parseInt(priceMatch[1].replace(/,/g, ''), 10) : null;
    const priceMax = priceMatch?.[2] ? parseInt(priceMatch[2].replace(/,/g, ''), 10) : priceMin;

    // Extract beds
    const bedsMatch = cardText.match(/(\d+|S(?:tudio)?)\s*(?:-\s*(\d+))?\s*Bed/i);
    let beds: number | null = null;
    if (bedsMatch) {
      if (bedsMatch[1].toLowerCase().startsWith('s')) {
        beds = 0;
      } else {
        beds = parseInt(bedsMatch[1], 10);
      }
    }

    const street = addressMatch[1].trim();

    return {
      sourceListingId: `umich-${street.replace(/\s+/g, '-').toLowerCase()}-${index}`,
      canonicalUrl: `${this.baseUrl}/listing`,
      title: street,
      street,
      city: addressMatch[2]?.trim() || 'Ann Arbor',
      state: 'MI',
      zip: addressMatch[4] || null,
      beds,
      baths: this.parseBaths(cardText),
      priceMin,
      priceMax,
      sqft: this.parseSqft(cardText),
      propertyType: 'apartment',
      imageUrls: [],
    };
  }
}
