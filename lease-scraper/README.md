# MichiganRental Listings Ingest

A complete system that scrapes rental listings from [michiganrental.com](https://www.michiganrental.com/all-properties-map-listings), stores them in PostgreSQL, and exposes them through a REST API for your own website.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  apps/scraper   │────▸│  PostgreSQL DB    │◂────│   apps/api      │
│  (Playwright +  │     │  (Prisma ORM)     │     │  (Express)      │
│   CLI)          │     └──────────────────┘     └─────────────────┘
└─────────────────┘            │                        │
        │                      │                        │
        ▼                      ▼                        ▼
   /data/images        packages/shared           GET /listings
   (local storage)     (types, validators,       GET /listings/:id
                        normalizer, utils)       POST /admin/ingest/run
```

## Repo Layout

```
/apps/scraper          — Playwright scraper, JSON endpoint discovery, CLI
/apps/api              — Express REST API server
/packages/shared       — Prisma schema, types, validators, utilities
/fixtures              — Recorded fixture data for tests
/data/images           — Local image storage (gitignored)
/config                — Discovery config (auto-generated)
```

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL running locally (or a connection string)
- Playwright browsers (installed automatically)

### 1. Install Dependencies

```bash
npm install
npx playwright install chromium
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your DATABASE_URL and ADMIN_TOKEN
```

### 3. Run Database Migrations

```bash
npx prisma generate --schema=packages/shared/prisma/schema.prisma
npx prisma migrate dev --schema=packages/shared/prisma/schema.prisma --name init
```

### 4. Discover API Endpoints

```bash
cd apps/scraper
npx tsx src/cli/index.ts discover --url https://www.michiganrental.com/all-properties-map-listings
```

This launches a headless browser, loads the target page, intercepts all JSON responses, and saves any discovered listing endpoints to `config/discovery.json`.

### 5. Run a Sync

```bash
# Sync all listings
npx tsx src/cli/index.ts sync --source michiganrental --limit 0

# Sync with a limit
npx tsx src/cli/index.ts sync --source michiganrental --limit 50

# Sync listings updated since a date
npx tsx src/cli/index.ts sync --source michiganrental --since 2026-01-01
```

### 6. Start the API Server

```bash
cd apps/api
npx tsx src/index.ts
# or from root:
npm run api:dev
```

The API runs at `http://localhost:3000` by default.

### 7. Run Tests

```bash
npm test
```

## API Endpoints

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check with DB status |
| `GET` | `/listings` | List listings with filters |
| `GET` | `/listings/:id` | Get single listing with images |
| `GET` | `/sources` | List all ingest sources |

### Query Parameters for `GET /listings`

| Param | Type | Description |
|-------|------|-------------|
| `city` | string | Filter by city (case-insensitive) |
| `minPrice` | number | Minimum price |
| `maxPrice` | number | Maximum price |
| `beds` | integer | Minimum bedrooms |
| `baths` | number | Minimum bathrooms |
| `bounds` | string | Geo bounds: `minLat,minLng,maxLat,maxLng` |
| `availabilityBefore` | date | Available before date |
| `availabilityAfter` | date | Available after date |
| `q` | string | Full-text search on title, description, address |
| `page` | integer | Page number (default 1) |
| `limit` | integer | Results per page (default 20, max 100) |

### Admin (requires `X-Admin-Token` header)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/admin/ingest/run` | Trigger a sync run |
| `GET` | `/admin/ingest/runs` | List recent ingest runs |
| `GET` | `/admin/ingest/runs/:id` | Get run details |
| `DELETE` | `/admin/listings/:id` | Delete listing + images |

## CLI Commands

All CLI commands run from `/apps/scraper`:

```bash
# Discover endpoints
npx tsx src/cli/index.ts discover --url <URL> --output config/discovery.json

# Run sync
npx tsx src/cli/index.ts sync --source michiganrental --limit 0

# Record fixtures for testing
npx tsx src/cli/index.ts fixtures record --url <URL> --output fixtures
```

## How It Works

### Endpoint Discovery

1. **Browser launch**: Playwright opens a headless Chromium browser and navigates to the target page.
2. **Network interception**: Every network response is captured. JSON responses are analyzed using heuristics:
   - Content-Type must be `application/json`
   - Response body is searched for known listing array keys (`listings`, `properties`, `results`, `items`, `data`)
   - Items in the array are scored for listing-like fields (`lat`, `lng`, `address`, `price`, `beds`, etc.)
3. **Map interaction**: If a map element is detected (Leaflet, Google Maps, Mapbox), the scraper scrolls and zooms to trigger lazy-loaded data.
4. **Pagination detection**: The discovered endpoint URL and request body are analyzed for pagination patterns (page, offset, cursor, bounding box).
5. **Config persistence**: All discovered endpoints are saved to `config/discovery.json` for deterministic re-use.

### Pagination Handling

The fetcher supports four pagination strategies:

- **Page-based**: Increments `?page=N` until an empty response
- **Offset-based**: Increments `?offset=N&limit=50` until empty
- **Cursor-based**: Follows `nextCursor` / `cursor` / `after` from response metadata
- **Bounds-based** (for map APIs): Tiles Michigan's bounding box into a grid and deduplicates by listing ID

### Image Ingestion

- Images are downloaded with configurable concurrency (default 4 parallel)
- Each image is SHA-256 checksummed for deduplication
- Dimensions are detected from binary headers (PNG, JPEG, GIF, WebP)
- Stored locally at `/data/images/<listingId>/<sha256>.<ext>`
- Metadata (original URL, stored path, MIME type, dimensions) is saved in the DB

### HTML Fallback

If no JSON endpoint is discovered, set `HTML_FALLBACK=true` to enable:
- Playwright renders each listing page
- Cheerio parses HTML for structured data
- JSON-LD (`application/ld+json`) is preferred when available
- Falls back to CSS selector heuristics for common listing page patterns

## Environment Variables

See `.env.example` for all options. Key variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | — | PostgreSQL connection string |
| `ADMIN_TOKEN` | — | Token for admin API endpoints |
| `SCRAPER_CONCURRENCY` | `2` | Parallel scraper tasks |
| `IMAGE_CONCURRENCY` | `4` | Parallel image downloads |
| `RATE_LIMIT_RPS` | `1` | Requests per second per host |
| `IMAGE_STORAGE_MODE` | `local` | `local` or `s3` |
| `LOCAL_IMAGE_DIR` | `./data/images` | Local image directory |
| `HTML_FALLBACK` | `false` | Use HTML scraping instead of JSON |
| `API_PORT` | `3000` | API server port |

## Alternatives Considered

- **Puppeteer vs Playwright**: Chose Playwright for better multi-browser support and auto-waiting.
- **Knex vs Prisma**: Chose Prisma for type-safe schema, migrations, and generated client.
- **Sharp for images**: Could add Sharp for image resizing/optimization; currently uses raw buffer dimension detection to keep dependencies minimal.
- **Bull/BullMQ for job queue**: The current `setImmediate` approach for admin-triggered syncs works for single-instance deployments. For production scale, consider adding Bull with Redis.
- **Full-text search**: Currently uses Prisma `contains` queries. For production, consider adding PostgreSQL `tsvector` indexes or Elasticsearch.
