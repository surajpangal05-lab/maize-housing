import {
  normalizeListing,
  normalizeWixListing,
  canonicalizeUrl,
  getPrisma,
  createLogger,
  RateLimiter,
  type Logger,
  type NormalizedListing,
  type DiscoveryConfig,
  type IngestRunResult,
} from '@michigan-rental/shared';
import { Prisma, type PrismaClient } from '@prisma/client';
import { ListingFetcher } from './fetcher';
import { HtmlFallbackScraper } from './html-fallback';
import { ImageDownloader } from '../images/downloader';
import { EndpointDiscoverer } from '../discovery/interceptor';
import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import * as path from 'path';
import * as fs from 'fs/promises';

export interface SyncOptions {
  source: string;
  limit?: number;
  since?: Date;
  configPath?: string;
  htmlFallback?: boolean;
  imageStorageMode?: 'local' | 's3';
  localImageDir?: string;
  scraperConcurrency?: number;
  imageConcurrency?: number;
  rateLimitRps?: number;
  scrapeContactInfo?: boolean; // Whether to scrape contact info from listing pages
}

export class SyncEngine {
  private prisma: PrismaClient;
  private logger: Logger;
  private imageDownloader: ImageDownloader;
  private options: SyncOptions;

  constructor(options: SyncOptions) {
    this.options = options;
    this.prisma = getPrisma();
    this.logger = createLogger('sync-engine');
    this.imageDownloader = new ImageDownloader({
      concurrency: options.imageConcurrency || 4,
      storageMode: options.imageStorageMode || 'local',
      localDir: options.localImageDir || './data/images',
      logger: this.logger,
    });
  }

  async run(): Promise<IngestRunResult> {
    const startTime = Date.now();
    const errors: Array<{ message: string; listingId?: string; url?: string }> = [];
    let listingsUpserted = 0;
    let listingsSkipped = 0;
    let imagesDownloaded = 0;

    // Ensure source exists
    const source = await this.ensureSource();

    // Create ingest run record
    const ingestRun = await this.prisma.ingestRun.create({
      data: {
        sourceId: source.id,
        status: 'running',
      },
    });

    this.logger.info({ runId: ingestRun.id, source: this.options.source }, 'Starting sync run');

    try {
      // Step 1: Fetch raw listings
      const rawListings = await this.fetchListings();
      this.logger.info({ count: rawListings.length }, 'Raw listings fetched');

      // Step 2: Normalize listings (use Wix normalizer for michiganrental)
      const isWixSource = this.options.source === 'michiganrental';
      const normalized = rawListings.map((raw) => {
        try {
          if (isWixSource) {
            return normalizeWixListing(raw as Record<string, unknown>, source.baseUrl);
          }
          return normalizeListing(raw, source.baseUrl);
        } catch (err) {
          errors.push({ message: `Normalization failed: ${(err as Error).message}` });
          return null;
        }
      }).filter((n): n is NormalizedListing => n !== null);

      this.logger.info({ count: normalized.length }, 'Listings normalized');

      // Step 3: Deduplicate
      const deduped = this.deduplicate(normalized);
      this.logger.info({ count: deduped.length }, 'Listings deduplicated');

      // Step 4: Upsert each listing
      for (const listing of deduped) {
        try {
          const result = await this.upsertListing(source.id, listing);
          if (result.created || result.updated) {
            listingsUpserted++;

            // Step 5: Download images
            const imgCount = await this.imageDownloader.downloadListingImages(
              result.listingId,
              listing.imageUrls
            );
            imagesDownloaded += imgCount;
          } else {
            listingsSkipped++;
          }
        } catch (err) {
          errors.push({
            message: `Upsert failed: ${(err as Error).message}`,
            url: listing.canonicalUrl,
          });
          this.logger.error({ error: (err as Error).message, url: listing.canonicalUrl }, 'Failed to upsert listing');
        }
      }

      // Update ingest run
      await this.prisma.ingestRun.update({
        where: { id: ingestRun.id },
        data: {
          finishedAt: new Date(),
          status: errors.length > 0 ? 'completed_with_errors' : 'completed',
          listingsUpserted,
          listingsSkipped,
          imagesDownloaded,
          errorsJson: errors.length > 0 ? errors : undefined,
        },
      });
    } catch (err) {
      const msg = (err as Error).message;
      errors.push({ message: `Fatal error: ${msg}` });
      this.logger.error({ error: msg }, 'Sync run failed');

      await this.prisma.ingestRun.update({
        where: { id: ingestRun.id },
        data: {
          finishedAt: new Date(),
          status: 'failed',
          errorsJson: errors,
        },
      });
    }

    const durationMs = Date.now() - startTime;
    this.logger.info(
      { runId: ingestRun.id, listingsUpserted, listingsSkipped, imagesDownloaded, errors: errors.length, durationMs },
      'Sync run finished'
    );

    return {
      runId: ingestRun.id,
      status: errors.length > 0 ? 'partial' : 'completed',
      listingsUpserted,
      listingsSkipped,
      imagesDownloaded,
      errors,
      durationMs,
    };
  }

  private async fetchListings() {
    // Check if we should use HTML fallback
    if (this.options.htmlFallback) {
      this.logger.info('Using HTML fallback scraper');
      const scraper = new HtmlFallbackScraper({
        logger: this.logger,
        rateLimitRps: this.options.rateLimitRps,
        limit: this.options.limit,
      });
      return scraper.scrape('https://www.michiganrental.com/all-properties-map-listings');
    }

    // Try to load discovery config
    const configPath = this.options.configPath || path.resolve(process.cwd(), 'config', 'discovery.json');
    let config: DiscoveryConfig;

    try {
      config = await EndpointDiscoverer.loadConfig(configPath);
      this.logger.info({ endpoints: config.endpoints.length }, 'Loaded discovery config');
    } catch {
      this.logger.info('No discovery config found, running discovery first');
      const discoverer = new EndpointDiscoverer(this.logger);
      config = await discoverer.discover('https://www.michiganrental.com/all-properties-map-listings');
      await discoverer.saveConfig(config, configPath);
    }

    if (config.endpoints.length === 0) {
      this.logger.warn('No API endpoints discovered, falling back to HTML scraper');
      const scraper = new HtmlFallbackScraper({
        logger: this.logger,
        rateLimitRps: this.options.rateLimitRps,
        limit: this.options.limit,
      });
      return scraper.scrape('https://www.michiganrental.com/all-properties-map-listings');
    }

    // Use the best endpoint (highest sample count)
    const bestEndpoint = config.endpoints.reduce((a, b) =>
      a.sampleCount > b.sampleCount ? a : b
    );

    this.logger.info(
      { url: bestEndpoint.url.substring(0, 120), pagination: bestEndpoint.paginationType, sampleCount: bestEndpoint.sampleCount },
      'Using discovered endpoint'
    );

    const fetcher = new ListingFetcher(bestEndpoint, {
      limit: this.options.limit,
      since: this.options.since,
      logger: this.logger,
      rateLimitRps: this.options.rateLimitRps,
    });

    return fetcher.fetchAll();
  }

  private deduplicate(listings: NormalizedListing[]): NormalizedListing[] {
    const seen = new Map<string, NormalizedListing>();

    for (const listing of listings) {
      const key = listing.sourceListingId || listing.canonicalUrl;
      if (!key) continue;

      if (!seen.has(key)) {
        seen.set(key, listing);
      }
    }

    return Array.from(seen.values());
  }

  private async upsertListing(
    sourceId: string,
    listing: NormalizedListing
  ): Promise<{ listingId: string; created: boolean; updated: boolean }> {
    // Try to find existing by sourceListingId or canonicalUrl
    let existing = null;

    if (listing.sourceListingId) {
      existing = await this.prisma.listing.findFirst({
        where: { sourceId, sourceListingId: listing.sourceListingId },
      });
    }

    if (!existing && listing.canonicalUrl) {
      existing = await this.prisma.listing.findFirst({
        where: { sourceId, canonicalUrl: listing.canonicalUrl },
      });
    }

    const data = {
      sourceId,
      sourceListingId: listing.sourceListingId,
      canonicalUrl: listing.canonicalUrl,
      title: listing.title,
      street: listing.street,
      unit: listing.unit,
      city: listing.city,
      state: listing.state,
      zip: listing.zip,
      lat: listing.lat,
      lng: listing.lng,
      priceMin: listing.priceMin,
      priceMax: listing.priceMax,
      beds: listing.beds,
      baths: listing.baths,
      sqft: listing.sqft,
      propertyType: listing.propertyType,
      availabilityDate: listing.availabilityDate,
      leaseTerm: listing.leaseTerm,
      deposit: listing.deposit,
      feesJson: listing.feesJson ?? undefined,
      amenitiesJson: listing.amenitiesJson ?? undefined,
      description: listing.description,
      contactJson: listing.contactJson ?? undefined,
      rawJson: listing.rawJson ?? undefined,
      scrapedAt: new Date(),
    };

    if (existing) {
      const updated = await this.prisma.listing.update({
        where: { id: existing.id },
        data,
      });
      return { listingId: updated.id, created: false, updated: true };
    }

    const created = await this.prisma.listing.create({ data });
    return { listingId: created.id, created: true, updated: false };
  }

  private async ensureSource() {
    const name = this.options.source;
    const baseUrl = 'https://www.michiganrental.com';

    let source = await this.prisma.source.findUnique({ where: { name } });
    if (!source) {
      source = await this.prisma.source.create({
        data: { name, baseUrl },
      });
      this.logger.info({ sourceId: source.id, name }, 'Created source record');
    }
    return source;
  }

  /**
   * Scrape contact info from individual listing pages
   * This is useful when the API doesn't expose contact info
   */
  async scrapeContactInfo(): Promise<{ updated: number; errors: number }> {
    this.logger.info('Starting contact info scrape');
    
    const rateLimiter = new RateLimiter(this.options.rateLimitRps || 0.5);
    let updated = 0;
    let errors = 0;

    // Get all listings without contact info
    const listings = await this.prisma.listing.findMany({
      where: {
        contactJson: { equals: Prisma.DbNull },
        NOT: { canonicalUrl: '' },
      },
      select: {
        id: true,
        canonicalUrl: true,
        title: true,
      },
      take: (this.options.limit ?? 0) > 0 ? this.options.limit : 1000,
    });

    this.logger.info({ count: listings.length }, 'Listings to scrape for contact info');

    if (listings.length === 0) {
      return { updated, errors };
    }

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    });

    try {
      const page = await context.newPage();

      for (const listing of listings) {
        try {
          await rateLimiter.wait(new URL(listing.canonicalUrl).hostname);
          
          this.logger.info({ url: listing.canonicalUrl }, 'Scraping contact info');
          
          await page.goto(listing.canonicalUrl, { waitUntil: 'networkidle', timeout: 30000 });
          await page.waitForTimeout(2000);

          const html = await page.content();
          const contact = this.extractContactFromHtml(html);

          if (contact && Object.keys(contact).length > 0) {
            await this.prisma.listing.update({
              where: { id: listing.id },
              data: { contactJson: contact },
            });
            updated++;
            this.logger.info({ url: listing.canonicalUrl, contact }, 'Contact info found');
          } else {
            this.logger.debug({ url: listing.canonicalUrl }, 'No contact info found');
          }
        } catch (err) {
          errors++;
          this.logger.warn({ url: listing.canonicalUrl, error: (err as Error).message }, 'Failed to scrape contact');
        }
      }
    } finally {
      await browser.close();
    }

    this.logger.info({ updated, errors }, 'Contact info scrape complete');
    return { updated, errors };
  }

  /**
   * Extract contact info from HTML content
   */
  private extractContactFromHtml(html: string): { phone?: string; email?: string; name?: string } | null {
    const $ = cheerio.load(html);
    const contact: { phone?: string; email?: string; name?: string } = {};

    // Look for phone numbers
    const phonePatterns = [
      /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g,
      /(\d{3}[-.\s]\d{3}[-.\s]\d{4})/g,
    ];

    // Check common contact selectors
    const contactSelectors = [
      '[class*="contact"]',
      '[class*="phone"]',
      '[class*="agent"]',
      '[class*="landlord"]',
      '[class*="manager"]',
      'a[href^="tel:"]',
      'a[href^="mailto:"]',
    ];

    // Extract email from mailto links
    $('a[href^="mailto:"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && !contact.email) {
        contact.email = href.replace('mailto:', '').split('?')[0];
      }
    });

    // Extract phone from tel links
    $('a[href^="tel:"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && !contact.phone) {
        contact.phone = href.replace('tel:', '').replace(/[^\d+\-().\s]/g, '');
      }
    });

    // Try to find phone in text if not found in links
    if (!contact.phone) {
      for (const selector of contactSelectors) {
        const text = $(selector).text();
        for (const pattern of phonePatterns) {
          const match = text.match(pattern);
          if (match) {
            contact.phone = match[0];
            break;
          }
        }
        if (contact.phone) break;
      }
    }

    // Fallback: search entire body for phone
    if (!contact.phone) {
      const bodyText = $('body').text();
      for (const pattern of phonePatterns) {
        const match = bodyText.match(pattern);
        if (match) {
          contact.phone = match[0];
          break;
        }
      }
    }

    // Try to find contact name
    const nameSelectors = [
      '[class*="agent-name"]',
      '[class*="contact-name"]',
      '[class*="manager-name"]',
      '[class*="landlord-name"]',
    ];

    for (const selector of nameSelectors) {
      const name = $(selector).first().text().trim();
      if (name && name.length > 2 && name.length < 50) {
        contact.name = name;
        break;
      }
    }

    return Object.keys(contact).length > 0 ? contact : null;
  }
}
