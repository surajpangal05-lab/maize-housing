import 'dotenv/config';
import { Command } from 'commander';
import { EndpointDiscoverer } from '../discovery/interceptor';
import { SyncEngine } from '../sync/sync-engine';
import { McKinleyScraper } from '../sources/mckinley';
import { JKellerScraper } from '../sources/jkeller';
import { UMichScraper } from '../sources/umich';
import { createLogger, disconnectPrisma, getPrisma } from '@michigan-rental/shared';
import * as path from 'path';
import * as fs from 'fs/promises';

const logger = createLogger('cli');
const program = new Command();

// Available HTML scrapers for new sources
const htmlScrapers: Record<string, () => import('../sources/index').SourceScraper> = {
  mckinley: () => new McKinleyScraper({ logger }),
  jkeller: () => new JKellerScraper({ logger }),
  umich: () => new UMichScraper({ logger }),
};

program
  .name('michigan-rental-scraper')
  .description('Michigan Rental Listings Ingest CLI')
  .version('1.0.0');

// ─── discover ────────────────────────────────────────────────────────
program
  .command('discover')
  .description('Discover JSON API endpoints from a target page')
  .option('--url <url>', 'Target URL to discover', 'https://www.michiganrental.com/all-properties-map-listings')
  .option('--output <path>', 'Output config file path', 'config/discovery.json')
  .action(async (opts) => {
    try {
      logger.info({ url: opts.url }, 'Starting endpoint discovery');
      const discoverer = new EndpointDiscoverer(logger);
      const config = await discoverer.discover(opts.url);

      const outputPath = path.resolve(process.cwd(), opts.output);
      await discoverer.saveConfig(config, outputPath);

      if (config.endpoints.length === 0) {
        logger.warn('No API endpoints discovered. Use HTML_FALLBACK=true for HTML scraping.');
      } else {
        logger.info({ endpoints: config.endpoints.length }, 'Discovery complete. Endpoints saved.');
        for (const ep of config.endpoints) {
          logger.info({
            url: ep.url.substring(0, 120),
            method: ep.method,
            pagination: ep.paginationType,
            sampleCount: ep.sampleCount,
          }, 'Endpoint');
        }
      }
    } catch (err) {
      logger.error({ error: (err as Error).message }, 'Discovery failed');
      process.exit(1);
    }
  });

// ─── sync ────────────────────────────────────────────────────────────
program
  .command('sync')
  .description('Sync listings from a source into the database')
  .option('--source <name>', 'Source name', 'michiganrental')
  .option('--limit <n>', 'Max listings to sync (0 = all)', '0')
  .option('--since <date>', 'Only sync listings after this date')
  .option('--config <path>', 'Discovery config file path', 'config/discovery.json')
  .action(async (opts) => {
    try {
      const engine = new SyncEngine({
        source: opts.source,
        limit: parseInt(opts.limit, 10),
        since: opts.since ? new Date(opts.since) : undefined,
        configPath: path.resolve(process.cwd(), opts.config),
        htmlFallback: process.env.HTML_FALLBACK === 'true',
        imageStorageMode: (process.env.IMAGE_STORAGE_MODE as 'local' | 's3') || 'local',
        localImageDir: process.env.LOCAL_IMAGE_DIR || './data/images',
        scraperConcurrency: parseInt(process.env.SCRAPER_CONCURRENCY || '2', 10),
        imageConcurrency: parseInt(process.env.IMAGE_CONCURRENCY || '4', 10),
        rateLimitRps: parseFloat(process.env.RATE_LIMIT_RPS || '1'),
      });

      const result = await engine.run();

      logger.info({
        status: result.status,
        upserted: result.listingsUpserted,
        skipped: result.listingsSkipped,
        images: result.imagesDownloaded,
        errors: result.errors.length,
        duration: `${(result.durationMs / 1000).toFixed(1)}s`,
      }, 'Sync complete');

      if (result.errors.length > 0) {
        logger.warn({ errors: result.errors.slice(0, 10) }, 'Sync errors (showing first 10)');
      }
    } catch (err) {
      logger.error({ error: (err as Error).message }, 'Sync failed');
      process.exit(1);
    } finally {
      await disconnectPrisma();
    }
  });

// ─── scrape-contacts ────────────────────────────────────────────────
program
  .command('scrape-contacts')
  .description('Scrape contact info from individual listing pages')
  .option('--source <name>', 'Source name', 'michiganrental')
  .option('--limit <n>', 'Max listings to process (0 = all)', '50')
  .action(async (opts) => {
    try {
      logger.info({ source: opts.source, limit: opts.limit }, 'Starting contact info scrape');
      
      const engine = new SyncEngine({
        source: opts.source,
        limit: parseInt(opts.limit, 10),
        rateLimitRps: parseFloat(process.env.RATE_LIMIT_RPS || '0.5'),
      });

      const result = await engine.scrapeContactInfo();

      logger.info({
        updated: result.updated,
        errors: result.errors,
      }, 'Contact scrape complete');
    } catch (err) {
      logger.error({ error: (err as Error).message }, 'Contact scrape failed');
      process.exit(1);
    } finally {
      await disconnectPrisma();
    }
  });

// ─── sync-html ────────────────────────────────────────────────────────
program
  .command('sync-html')
  .description('Sync listings from HTML scrapers (mckinley, jkeller, umich)')
  .option('--source <name>', 'Source name (mckinley, jkeller, umich)', '')
  .option('--limit <n>', 'Max listings per source (0 = all)', '0')
  .action(async (opts) => {
    const prisma = getPrisma();
    const limit = parseInt(opts.limit, 10);
    const sources = opts.source ? [opts.source] : Object.keys(htmlScrapers);
    
    let totalUpserted = 0;
    let totalSkipped = 0;

    try {
      for (const sourceName of sources) {
        if (!htmlScrapers[sourceName]) {
          logger.warn({ source: sourceName }, 'Unknown HTML source, skipping');
          continue;
        }

        logger.info({ source: sourceName }, 'Starting HTML scrape');
        
        const scraper = htmlScrapers[sourceName]();
        const listings = await scraper.scrapeListings();
        
        logger.info({ source: sourceName, count: listings.length }, 'Scraped listings');

        // Ensure source exists
        let source = await prisma.source.findUnique({ where: { name: sourceName } });
        if (!source) {
          source = await prisma.source.create({
            data: { name: sourceName, baseUrl: scraper.baseUrl },
          });
        }

        // Validate and filter listings
        const validListings = listings.filter((listing) => {
          // Must have a title (non-empty and meaningful)
          if (!listing.title || listing.title.trim().length < 3) {
            logger.info({ title: listing.title, url: listing.canonicalUrl }, 'Filtered: missing or invalid title');
            return false;
          }
          // Filter out titles that are ONLY bedroom types (no property name)
          const badTitlePatterns = [
            /^\s*-?\s*(studio|1|2|3|4|5)\s*bed(room)?s?\s*$/i,
            /^\s*bed(room)?\s*$/i,
          ];
          if (badTitlePatterns.some(p => p.test(listing.title || ''))) {
            logger.info({ title: listing.title, url: listing.canonicalUrl }, 'Filtered: generic/bad title');
            return false;
          }
          // Rent validation: only filter if rent IS set AND is unreasonable ($200-$20,000/month)
          const rent = listing.priceMin || listing.priceMax;
          if (rent !== null && rent !== undefined && rent > 0 && (rent < 200 || rent > 20000)) {
            logger.info({ title: listing.title, rent, url: listing.canonicalUrl }, 'Filtered: unreasonable rent');
            return false;
          }
          // Must have canonical URL
          if (!listing.canonicalUrl) {
            logger.info({ title: listing.title }, 'Filtered: missing canonical URL');
            return false;
          }
          return true;
        });

        logger.info({ source: sourceName, valid: validListings.length, filtered: listings.length - validListings.length }, 'Validated listings');

        // Upsert listings
        for (const listing of validListings) {
          if (limit > 0 && totalUpserted >= limit) break;

          try {
            // Check for cross-source duplicates by address
            if (listing.street && listing.city) {
              const normalizedStreet = listing.street.toLowerCase().replace(/[^a-z0-9]/g, '');
              const existingDupe = await prisma.listing.findFirst({
                where: {
                  city: { equals: listing.city, mode: 'insensitive' },
                  NOT: { sourceId: source.id },
                },
              });

              if (existingDupe) {
                const cityListings = await prisma.listing.findMany({
                  where: { city: { equals: listing.city, mode: 'insensitive' } },
                  select: { street: true, sourceId: true },
                });

                const isDupe = cityListings.some(cl => {
                  if (cl.sourceId === source!.id || !cl.street) return false;
                  const clNormalized = cl.street.toLowerCase().replace(/[^a-z0-9]/g, '');
                  return clNormalized === normalizedStreet;
                });

                if (isDupe) {
                  totalSkipped++;
                  continue;
                }
              }
            }

            await prisma.listing.upsert({
              where: {
                sourceId_canonicalUrl: {
                  sourceId: source.id,
                  canonicalUrl: listing.canonicalUrl,
                },
              },
              create: {
                sourceId: source.id,
                sourceListingId: listing.sourceListingId,
                canonicalUrl: listing.canonicalUrl,
                title: listing.title,
                street: listing.street,
                unit: listing.unit,
                city: listing.city,
                state: listing.state,
                zip: listing.zip,
                priceMin: listing.priceMin,
                priceMax: listing.priceMax,
                beds: listing.beds,
                baths: listing.baths,
                sqft: listing.sqft,
                propertyType: listing.propertyType,
                availabilityDate: listing.availabilityDate,
                description: listing.description,
                contactJson: listing.contactJson ?? undefined,
                scrapedAt: new Date(),
              },
              update: {
                title: listing.title,
                priceMin: listing.priceMin,
                priceMax: listing.priceMax,
                beds: listing.beds,
                baths: listing.baths,
                sqft: listing.sqft,
                availabilityDate: listing.availabilityDate,
                description: listing.description,
                contactJson: listing.contactJson ?? undefined,
                scrapedAt: new Date(),
              },
            });

            // Store images
            if (listing.imageUrls && listing.imageUrls.length > 0) {
              const dbListing = await prisma.listing.findFirst({
                where: { sourceId: source.id, canonicalUrl: listing.canonicalUrl },
              });
              if (dbListing) {
                for (let i = 0; i < listing.imageUrls.length; i++) {
                  await prisma.listingImage.upsert({
                    where: {
                      listingId_originalUrl: {
                        listingId: dbListing.id,
                        originalUrl: listing.imageUrls[i],
                      },
                    },
                    create: {
                      listingId: dbListing.id,
                      originalUrl: listing.imageUrls[i],
                      sortOrder: i,
                    },
                    update: { sortOrder: i },
                  }).catch(() => {}); // Ignore duplicate errors
                }
              }
            }

            totalUpserted++;
          } catch (err) {
            logger.warn({ error: (err as Error).message, listing: listing.title }, 'Failed to upsert listing');
          }
        }
      }

      logger.info({ upserted: totalUpserted, skipped: totalSkipped }, 'HTML sync complete');
    } catch (err) {
      logger.error({ error: (err as Error).message }, 'HTML sync failed');
      process.exit(1);
    } finally {
      await disconnectPrisma();
    }
  });

// ─── sync-all ────────────────────────────────────────────────────────
program
  .command('sync-all')
  .description('Sync listings from ALL sources (michiganrental + HTML scrapers)')
  .option('--limit <n>', 'Max listings per source (0 = all)', '0')
  .action(async (opts) => {
    const limit = parseInt(opts.limit, 10);
    
    try {
      // 1. Sync michiganrental (API-based)
      logger.info('Syncing michiganrental...');
      const engine = new SyncEngine({
        source: 'michiganrental',
        limit,
        configPath: path.resolve(process.cwd(), 'config/discovery.json'),
        rateLimitRps: parseFloat(process.env.RATE_LIMIT_RPS || '1'),
      });
      const mrResult = await engine.run();
      logger.info({ 
        source: 'michiganrental', 
        upserted: mrResult.listingsUpserted,
        skipped: mrResult.listingsSkipped,
      }, 'michiganrental sync complete');

      // 2. Sync HTML sources
      logger.info('Syncing HTML sources...');
      // Run sync-html programmatically
      const prisma = getPrisma();
      
      for (const sourceName of Object.keys(htmlScrapers)) {
        logger.info({ source: sourceName }, 'Starting HTML scrape');
        
        const scraper = htmlScrapers[sourceName]();
        const listings = await scraper.scrapeListings();
        
        // Ensure source
        let source = await prisma.source.findUnique({ where: { name: sourceName } });
        if (!source) {
          source = await prisma.source.create({
            data: { name: sourceName, baseUrl: scraper.baseUrl },
          });
        }

        let upserted = 0;
        for (const listing of listings) {
          if (limit > 0 && upserted >= limit) break;
          
          try {
            await prisma.listing.upsert({
              where: {
                sourceId_canonicalUrl: {
                  sourceId: source.id,
                  canonicalUrl: listing.canonicalUrl,
                },
              },
              create: {
                sourceId: source.id,
                sourceListingId: listing.sourceListingId,
                canonicalUrl: listing.canonicalUrl,
                title: listing.title,
                street: listing.street,
                city: listing.city,
                state: listing.state,
                zip: listing.zip,
                priceMin: listing.priceMin,
                priceMax: listing.priceMax,
                beds: listing.beds,
                baths: listing.baths,
                sqft: listing.sqft,
                propertyType: listing.propertyType,
                description: listing.description,
                contactJson: listing.contactJson ?? undefined,
                scrapedAt: new Date(),
              },
              update: {
                title: listing.title,
                priceMin: listing.priceMin,
                priceMax: listing.priceMax,
                scrapedAt: new Date(),
              },
            });
            upserted++;
          } catch (err) {
            // Skip errors
          }
        }
        
        logger.info({ source: sourceName, upserted }, 'HTML source sync complete');
      }

      logger.info('All sources synced!');
    } catch (err) {
      logger.error({ error: (err as Error).message }, 'Sync-all failed');
      process.exit(1);
    } finally {
      await disconnectPrisma();
    }
  });

// ─── fixtures ────────────────────────────────────────────────────────
program
  .command('fixtures')
  .description('Record fixture data for tests')
  .argument('<action>', 'Action: record')
  .option('--url <url>', 'Target URL', 'https://www.michiganrental.com/all-properties-map-listings')
  .option('--output <dir>', 'Output directory', 'fixtures')
  .action(async (action, opts) => {
    if (action !== 'record') {
      logger.error('Only "record" action is supported');
      process.exit(1);
    }

    try {
      logger.info('Recording fixtures from live endpoint');

      const discoverer = new EndpointDiscoverer(logger);
      const config = await discoverer.discover(opts.url);

      const fixtureDir = path.resolve(process.cwd(), opts.output);
      await fs.mkdir(fixtureDir, { recursive: true });

      // Save discovery config as fixture
      await fs.writeFile(
        path.join(fixtureDir, 'discovery.json'),
        JSON.stringify(config, null, 2),
        'utf-8'
      );

      // For each endpoint, fetch a small sample and save
      for (let i = 0; i < config.endpoints.length; i++) {
        const ep = config.endpoints[i];
        try {
          const response = await fetch(ep.url, {
            method: ep.method,
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'MichiganRentalBot/1.0',
              ...ep.headers,
            },
            signal: AbortSignal.timeout(15000),
          });

          if (response.ok) {
            const data = await response.json();
            await fs.writeFile(
              path.join(fixtureDir, `endpoint-${i}.json`),
              JSON.stringify(data, null, 2),
              'utf-8'
            );
            logger.info({ endpoint: ep.url.substring(0, 80), file: `endpoint-${i}.json` }, 'Fixture recorded');
          }
        } catch (err) {
          logger.warn({ error: (err as Error).message }, 'Failed to record fixture for endpoint');
        }
      }

      logger.info({ dir: fixtureDir }, 'Fixtures recorded');
    } catch (err) {
      logger.error({ error: (err as Error).message }, 'Fixture recording failed');
      process.exit(1);
    }
  });

program.parse();
