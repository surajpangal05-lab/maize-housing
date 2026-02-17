import { chromium, type Browser, type Page, type Response } from 'playwright';
import { createLogger, type Logger } from '@michigan-rental/shared';
import type { DiscoveredEndpoint, DiscoveryConfig } from '@michigan-rental/shared';
import * as fs from 'fs/promises';
import * as path from 'path';

/** Keys that suggest a response contains listing data */
const LISTING_KEYS = [
  'listings', 'properties', 'results', 'items', 'data',
  'records', 'units', 'rentals', 'apartments',
];

/** Keys that suggest individual listing objects */
const LISTING_FIELD_KEYS = [
  'lat', 'lng', 'latitude', 'longitude', 'address',
  'price', 'rent', 'beds', 'bedrooms', 'baths', 'bathrooms',
];

interface CandidateResponse {
  url: string;
  method: string;
  headers: Record<string, string>;
  postData?: string;
  body: unknown;
  listingsPath: string;
  listingsCount: number;
}

/**
 * Detect if a JSON object looks like it contains listing data.
 * Returns the "path" to the listings array if found, or null.
 */
function detectListingsPath(obj: unknown, depth = 0, currentPath = ''): { path: string; count: number } | null {
  if (depth > 5) return null;
  if (!obj || typeof obj !== 'object') return null;

  // Direct array of listing-like objects
  if (Array.isArray(obj)) {
    if (obj.length > 0 && looksLikeListing(obj[0])) {
      return { path: currentPath || '$', count: obj.length };
    }
    return null;
  }

  const record = obj as Record<string, unknown>;

  // Check known listing array keys
  for (const key of LISTING_KEYS) {
    if (key in record && Array.isArray(record[key])) {
      const arr = record[key] as unknown[];
      if (arr.length > 0 && looksLikeListing(arr[0])) {
        const p = currentPath ? `${currentPath}.${key}` : key;
        return { path: p, count: arr.length };
      }
    }
  }

  // Recurse into nested objects
  for (const [key, val] of Object.entries(record)) {
    if (val && typeof val === 'object') {
      const result = detectListingsPath(val, depth + 1, currentPath ? `${currentPath}.${key}` : key);
      if (result) return result;
    }
  }

  return null;
}

/** Heuristic: does this object look like a listing? */
function looksLikeListing(obj: unknown): boolean {
  if (!obj || typeof obj !== 'object') return false;
  const keys = Object.keys(obj as Record<string, unknown>).map(k => k.toLowerCase());
  let score = 0;
  for (const field of LISTING_FIELD_KEYS) {
    if (keys.includes(field)) score++;
  }
  return score >= 2;
}

/**
 * Detect pagination type from request/response patterns.
 */
function detectPaginationType(url: string, body: unknown): DiscoveredEndpoint['paginationType'] {
  const urlLower = url.toLowerCase();
  const urlObj = new URL(url);

  if (urlObj.searchParams.has('page') || urlObj.searchParams.has('pageNumber')) return 'page';
  if (urlObj.searchParams.has('offset') || urlObj.searchParams.has('skip')) return 'offset';
  if (urlObj.searchParams.has('cursor') || urlObj.searchParams.has('after')) return 'cursor';
  if (
    urlObj.searchParams.has('bounds') ||
    urlObj.searchParams.has('bbox') ||
    urlObj.searchParams.has('minLat') ||
    urlObj.searchParams.has('sw_lat') ||
    urlLower.includes('bound') ||
    urlLower.includes('bbox')
  ) {
    return 'bounds';
  }

  // Check POST body for pagination params
  if (body && typeof body === 'object') {
    const bodyKeys = Object.keys(body as Record<string, unknown>).map(k => k.toLowerCase());
    if (bodyKeys.some(k => ['page', 'pagenumber'].includes(k))) return 'page';
    if (bodyKeys.some(k => ['offset', 'skip'].includes(k))) return 'offset';
    if (bodyKeys.some(k => ['cursor', 'after'].includes(k))) return 'cursor';
    if (bodyKeys.some(k => ['bounds', 'bbox', 'boundingbox', 'sw_lat', 'ne_lat'].includes(k))) return 'bounds';
  }

  return 'none';
}

export class EndpointDiscoverer {
  private logger: Logger;
  private candidates: CandidateResponse[] = [];
  private browser: Browser | null = null;

  constructor(logger?: Logger) {
    this.logger = logger || createLogger('discovery');
  }

  /**
   * Load a page with Playwright, intercept all network responses,
   * and identify JSON endpoints that serve listing data.
   */
  async discover(targetUrl: string): Promise<DiscoveryConfig> {
    this.logger.info({ targetUrl }, 'Starting endpoint discovery');
    this.candidates = [];

    this.browser = await chromium.launch({ headless: true });
    const context = await this.browser.newContext({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      viewport: { width: 1440, height: 900 },
    });

    const page = await context.newPage();

    // Intercept responses
    page.on('response', async (response: Response) => {
      await this.handleResponse(response);
    });

    try {
      await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 60000 });

      // Wait extra for lazy-loaded data
      await page.waitForTimeout(5000);

      // Scroll to trigger any lazy loading
      await this.scrollPage(page);
      await page.waitForTimeout(3000);

      // Try interacting with the map if present
      await this.interactWithMap(page);
      await page.waitForTimeout(3000);

    } catch (err) {
      this.logger.warn({ error: (err as Error).message }, 'Page load issue, continuing with intercepted data');
    } finally {
      await this.browser.close();
      this.browser = null;
    }

    const endpoints = this.buildEndpoints();
    const config: DiscoveryConfig = {
      source: 'michiganrental',
      targetUrl,
      endpoints,
    };

    this.logger.info(
      { endpointCount: endpoints.length, totalListings: endpoints.reduce((s, e) => s + e.sampleCount, 0) },
      'Discovery complete'
    );

    return config;
  }

  private async handleResponse(response: Response) {
    try {
      const url = response.url();
      const contentType = response.headers()['content-type'] || '';

      // Skip non-JSON responses
      if (!contentType.includes('application/json') && !contentType.includes('text/json')) {
        return;
      }

      // Skip small responses (likely not listing data)
      const status = response.status();
      if (status < 200 || status >= 300) return;

      const body = await response.json().catch(() => null);
      if (!body) return;

      const detection = detectListingsPath(body);
      if (!detection) return;

      const request = response.request();
      let postBody: string | undefined;
      try {
        postBody = request.postData() || undefined;
      } catch {
        // ignore
      }

      this.logger.info(
        { url: url.substring(0, 120), method: request.method(), listingsPath: detection.path, count: detection.count },
        'Candidate listing endpoint found'
      );

      this.candidates.push({
        url,
        method: request.method(),
        headers: Object.fromEntries(
          Object.entries(request.headers()).filter(([k]) =>
            ['content-type', 'authorization', 'x-api-key', 'accept'].includes(k.toLowerCase())
          )
        ),
        postData: postBody,
        body,
        listingsPath: detection.path,
        listingsCount: detection.count,
      });
    } catch (err) {
      // Non-critical, skip
    }
  }

  private async scrollPage(page: Page) {
    try {
      await page.evaluate(async () => {
        const w = globalThis as any;
        for (let i = 0; i < 5; i++) {
          w.scrollBy(0, w.innerHeight);
          await new Promise((r) => setTimeout(r, 800));
        }
        w.scrollTo(0, 0);
      });
    } catch {
      // ignore scroll errors
    }
  }

  private async interactWithMap(page: Page) {
    try {
      // Try to zoom out or pan the map to trigger more data loading
      const mapEl = await page.$('.map, [data-map], #map, .leaflet-container, .gm-style, .mapboxgl-map');
      if (mapEl) {
        this.logger.info('Map element detected, attempting interaction');
        const box = await mapEl.boundingBox();
        if (box) {
          // Click center of map
          await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
          await page.waitForTimeout(1000);

          // Zoom out with mouse wheel to get more data
          await page.mouse.wheel(0, 300);
          await page.waitForTimeout(2000);
        }
      }
    } catch {
      // ignore map interaction errors
    }
  }

  private buildEndpoints(): DiscoveredEndpoint[] {
    // Dedupe by base URL (strip query params for comparison)
    const seen = new Map<string, CandidateResponse>();

    for (const candidate of this.candidates) {
      try {
        const key = new URL(candidate.url).pathname + '|' + candidate.method;
        const existing = seen.get(key);
        if (!existing || candidate.listingsCount > existing.listingsCount) {
          seen.set(key, candidate);
        }
      } catch {
        seen.set(candidate.url, candidate);
      }
    }

    return Array.from(seen.values()).map((c) => {
      let parsedBody: unknown;
      try {
        parsedBody = c.postData ? JSON.parse(c.postData) : undefined;
      } catch {
        parsedBody = c.postData;
      }

      return {
        url: c.url,
        method: c.method,
        headers: c.headers,
        body: parsedBody,
        paginationType: detectPaginationType(c.url, parsedBody),
        listingsPath: c.listingsPath,
        sampleCount: c.listingsCount,
        discoveredAt: new Date().toISOString(),
      };
    });
  }

  /**
   * Save discovery config to a file.
   */
  async saveConfig(config: DiscoveryConfig, filePath: string): Promise<void> {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(config, null, 2), 'utf-8');
    this.logger.info({ filePath }, 'Discovery config saved');
  }

  /**
   * Load a previously saved discovery config.
   */
  static async loadConfig(filePath: string): Promise<DiscoveryConfig> {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  }
}
