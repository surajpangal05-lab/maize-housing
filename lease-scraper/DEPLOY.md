# Deploying Scraper API to Railway

## Quick Deploy (5 minutes)

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Connect your GitHub account if not already connected
4. Select your `maize-housing` repository

### Step 3: Configure the Service
Railway will auto-detect the monorepo. Configure these settings:

**Root Directory:** `lease-scraper`

**Build Command:** 
```
npm install && npm run db:generate && npm run build
```

**Start Command:**
```
npm run api
```

### Step 4: Add PostgreSQL Database
1. In your project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway automatically sets `DATABASE_URL`

### Step 5: Set Environment Variables
Click on your service → "Variables" tab → Add:

| Variable | Value |
|----------|-------|
| `ADMIN_TOKEN` | (generate a secure random string) |
| `API_PORT` | `3000` |
| `API_HOST` | `0.0.0.0` |
| `IMAGE_STORAGE_MODE` | `local` |

### Step 6: Run Database Migrations
In Railway dashboard:
1. Go to your service
2. Click "Settings" → "Deploy"
3. In "Custom Start Command" temporarily set:
   ```
   npx prisma migrate deploy --schema=packages/shared/prisma/schema.prisma && npm run api
   ```
4. Deploy once, then change back to just `npm run api`

### Step 7: Get Your API URL
After deployment:
1. Go to your service → "Settings" → "Networking"
2. Click "Generate Domain"
3. Copy the URL (e.g., `https://your-app.railway.app`)

### Step 8: Update Main App
In your main `maize-housing/.env`:
```
SCRAPER_API_URL=https://your-app.railway.app
```

---

## Alternative: CLI Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project in lease-scraper folder
cd lease-scraper
railway init

# Add Postgres
railway add --database postgres

# Deploy
railway up

# Get URL
railway domain
```

---

## Keeping Data in Sync

### Option A: Manual Sync (Free)
Run locally when you want to update:
```bash
npm run scraper:sync
npm run scraper:contacts
```

### Option B: Cron Job (Recommended)
Add to your main Vercel app's `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/sync-listings",
      "schedule": "0 6 * * *"
    }
  ]
}
```

Then create `/api/cron/sync-listings/route.ts` to trigger sync.

---

## Costs

**Railway Pricing:**
- Free tier: $5 credit/month (enough for light usage)
- Hobby: $5/month (includes more resources)
- Database: ~$5-10/month for small Postgres

**Total: ~$5-15/month** for a production-ready scraper API.
