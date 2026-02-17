import type { DiscoveredEndpoint, RawListing } from '@michigan-rental/shared';
import { RateLimiter, withRetry, createLogger, type Logger } from '@michigan-rental/shared';

/**
 * Resolve a dot-separated path on an object.
 * e.g. getByPath(obj, 'data.results') => obj.data.results
 */
function getByPath(obj: unknown, pathStr: string): unknown {
  if (pathStr === '$') return obj;
  const parts = pathStr.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

export interface FetcherOptions {
  concurrency?: number;
  limit?: number;
  since?: Date;
  logger?: Logger;
  rateLimitRps?: number;
  fixtureDir?: string;
}

export class ListingFetcher {
  private endpoint: DiscoveredEndpoint;
  private rateLimiter: RateLimiter;
  private logger: Logger;
  private options: FetcherOptions;

  constructor(endpoint: DiscoveredEndpoint, options: FetcherOptions = {}) {
    this.endpoint = endpoint;
    this.options = options;
    this.logger = options.logger || createLogger('fetcher');
    this.rateLimiter = new RateLimiter(options.rateLimitRps || 1);
  }

  /**
   * Fetch all listings from the endpoint, handling pagination.
   */
  async fetchAll(): Promise<RawListing[]> {
    const allListings: RawListing[] = [];
    const limit = this.options.limit || 0;
    const host = new URL(this.endpoint.url).hostname;

    switch (this.endpoint.paginationType) {
      case 'page':
        await this.fetchByPage(allListings, host, limit);
        break;
      case 'offset':
        await this.fetchByOffset(allListings, host, limit);
        break;
      case 'bounds':
        await this.fetchByBounds(allListings, host, limit);
        break;
      case 'cursor':
        await this.fetchByCursor(allListings, host, limit);
        break;
      default:
        // Single request, no pagination
        const data = await this.makeRequest(this.endpoint.url, host);
        const listings = this.extractListings(data);
        allListings.push(...listings);
        break;
    }

    this.logger.info({ total: allListings.length }, 'Fetching complete');
    return limit > 0 ? allListings.slice(0, limit) : allListings;
  }

  private async fetchByPage(results: RawListing[], host: string, limit: number) {
    let page = 1;
    const maxPages = 100;

    while (page <= maxPages) {
      const url = this.buildPaginatedUrl({ page });
      this.logger.info({ page, url: url.substring(0, 120) }, 'Fetching page');

      const data = await this.makeRequest(url, host);
      const listings = this.extractListings(data);

      if (listings.length === 0) break;
      results.push(...listings);

      if (limit > 0 && results.length >= limit) break;
      page++;
    }
  }

  private async fetchByOffset(results: RawListing[], host: string, limit: number) {
    let offset = 0;
    const pageSize = 50;
    const maxIterations = 200;

    for (let i = 0; i < maxIterations; i++) {
      const url = this.buildPaginatedUrl({ offset, limit: pageSize });
      this.logger.info({ offset, url: url.substring(0, 120) }, 'Fetching offset');

      const data = await this.makeRequest(url, host);
      const listings = this.extractListings(data);

      if (listings.length === 0) break;
      results.push(...listings);

      if (limit > 0 && results.length >= limit) break;
      offset += pageSize;
    }
  }

  private async fetchByCursor(results: RawListing[], host: string, limit: number) {
    let cursor: string | undefined;
    const maxIterations = 200;

    for (let i = 0; i < maxIterations; i++) {
      const url = cursor
        ? this.buildPaginatedUrl({ cursor })
        : this.endpoint.url;

      this.logger.info({ cursor, url: url.substring(0, 120) }, 'Fetching cursor');

      const data = await this.makeRequest(url, host);
      const listings = this.extractListings(data);

      if (listings.length === 0) break;
      results.push(...listings);

      // Try to find next cursor in response
      cursor = this.findNextCursor(data);
      if (!cursor) break;
      if (limit > 0 && results.length >= limit) break;
    }
  }

  private async fetchByBounds(results: RawListing[], host: string, limit: number) {
    // Tile around Michigan with focus on populated areas
    // Michigan approximate bounds: lat 41.7-46.0, lng -90.4 to -82.4
    const tiles = this.generateBoundsTiles(
      { minLat: 41.7, maxLat: 46.0, minLng: -90.4, maxLng: -82.4 },
      4
    );

    const seen = new Set<string>();

    for (const tile of tiles) {
      const url = this.buildBoundsUrl(tile);
      this.logger.info({ tile, url: url.substring(0, 120) }, 'Fetching bounds tile');

      try {
        const data = await this.makeRequest(url, host);
        const listings = this.extractListings(data);

        for (const listing of listings) {
          const dedupeKey = listing.id?.toString() || listing.sourceListingId || JSON.stringify(listing);
          if (!seen.has(dedupeKey)) {
            seen.add(dedupeKey);
            results.push(listing);
          }
        }
      } catch (err) {
        this.logger.warn({ error: (err as Error).message, tile }, 'Failed to fetch bounds tile');
      }

      if (limit > 0 && results.length >= limit) break;
    }
  }

  private generateBoundsTiles(
    bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
    divisions: number
  ) {
    const tiles: Array<{ minLat: number; maxLat: number; minLng: number; maxLng: number }> = [];
    const latStep = (bounds.maxLat - bounds.minLat) / divisions;
    const lngStep = (bounds.maxLng - bounds.minLng) / divisions;

    for (let latI = 0; latI < divisions; latI++) {
      for (let lngI = 0; lngI < divisions; lngI++) {
        tiles.push({
          minLat: bounds.minLat + latI * latStep,
          maxLat: bounds.minLat + (latI + 1) * latStep,
          minLng: bounds.minLng + lngI * lngStep,
          maxLng: bounds.minLng + (lngI + 1) * lngStep,
        });
      }
    }

    return tiles;
  }

  private buildPaginatedUrl(params: Record<string, unknown>): string {
    const url = new URL(this.endpoint.url);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }

  private buildBoundsUrl(bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }): string {
    const url = new URL(this.endpoint.url);
    // Try multiple common param formats
    if (url.searchParams.has('bounds') || url.searchParams.has('bbox')) {
      url.searchParams.set('bounds', `${bounds.minLat},${bounds.minLng},${bounds.maxLat},${bounds.maxLng}`);
    } else {
      url.searchParams.set('minLat', String(bounds.minLat));
      url.searchParams.set('minLng', String(bounds.minLng));
      url.searchParams.set('maxLat', String(bounds.maxLat));
      url.searchParams.set('maxLng', String(bounds.maxLng));
    }
    return url.toString();
  }

  private async makeRequest(url: string, host: string): Promise<unknown> {
    await this.rateLimiter.wait(host);

    return withRetry(
      async () => {
        const response = await fetch(url, {
          method: this.endpoint.method,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'MichiganRentalBot/1.0',
            ...this.endpoint.headers,
          },
          ...(this.endpoint.method === 'POST' && this.endpoint.body
            ? { body: JSON.stringify(this.endpoint.body) }
            : {}),
          signal: AbortSignal.timeout(30000),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      },
      { maxRetries: 3, logger: this.logger }
    );
  }

  private extractListings(data: unknown): RawListing[] {
    const raw = getByPath(data, this.endpoint.listingsPath);
    if (!Array.isArray(raw)) {
      this.logger.warn({ path: this.endpoint.listingsPath }, 'Listings path did not resolve to array');
      return [];
    }
    return raw as RawListing[];
  }

  private findNextCursor(data: unknown): string | undefined {
    if (!data || typeof data !== 'object') return undefined;
    const obj = data as Record<string, unknown>;

    const cursorKeys = ['nextCursor', 'cursor', 'next', 'nextPage', 'after', 'endCursor'];
    for (const key of cursorKeys) {
      if (obj[key] && typeof obj[key] === 'string') return obj[key] as string;
      if (obj.pagination && typeof obj.pagination === 'object') {
        const pag = obj.pagination as Record<string, unknown>;
        if (pag[key] && typeof pag[key] === 'string') return pag[key] as string;
      }
      if (obj.meta && typeof obj.meta === 'object') {
        const meta = obj.meta as Record<string, unknown>;
        if (meta[key] && typeof meta[key] === 'string') return meta[key] as string;
      }
    }

    return undefined;
  }
}
