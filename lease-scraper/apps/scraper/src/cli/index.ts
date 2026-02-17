import 'dotenv/config';
import { Command } from 'commander';
import { EndpointDiscoverer } from '../discovery/interceptor';
import { SyncEngine } from '../sync/sync-engine';
import { createLogger, disconnectPrisma } from '@michigan-rental/shared';
import * as path from 'path';
import * as fs from 'fs/promises';

const logger = createLogger('cli');
const program = new Command();

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
