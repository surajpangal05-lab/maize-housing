# Scraper Integration

This folder contains scripts for integrating with the Michigan Rental scraper.

## Setup

1. **Start the scraper API** (in a separate terminal):
   ```bash
   cd lease-scraper
   npm install
   npx prisma generate --schema=packages/shared/prisma/schema.prisma
   npx prisma migrate dev --schema=packages/shared/prisma/schema.prisma
   npm run api:dev
   ```

2. **Run a sync** to populate the database:
   ```bash
   cd lease-scraper/apps/scraper
   npx tsx src/cli/index.ts sync --source michiganrental --limit 50
   ```

## Running the Scraper

### Manual Sync
```bash
npm run scraper:sync
```

### Start Scraper API
```bash
npm run scraper:start
```

## Automatic Updates

To keep listings up to date automatically, set up a cron job:

### On macOS/Linux

1. Open crontab:
   ```bash
   crontab -e
   ```

2. Add a daily sync at 3 AM:
   ```
   0 3 * * * cd /path/to/maize-housing && npm run scraper:sync >> /var/log/maize-scraper.log 2>&1
   ```

### On Vercel (Production)

Use Vercel Cron Jobs by adding to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/sync-listings",
      "schedule": "0 3 * * *"
    }
  ]
}
```

Then create `/app/api/cron/sync-listings/route.ts` to trigger the sync.

## Environment Variables

Add to your `.env`:
```
SCRAPER_API_URL=http://localhost:3002
SCRAPER_ADMIN_TOKEN=your-admin-token
```

## How It Works

1. The scraper API runs on port 3002 and stores listings in PostgreSQL
2. The MaizeLease API fetches from the scraper API and combines results with user-created listings
3. Scraped listings are marked with `isScraped: true` and show an "EXTERNAL" badge
4. Clicking a scraped listing opens the original source URL
5. The sync script triggers periodic updates to keep data fresh

## API Endpoints

- `GET /api/listings` - Returns both user and scraped listings (use `includeScraped=false` to exclude)
- `GET /api/scraped-listings` - Returns only scraped listings
