#!/usr/bin/env npx tsx
/**
 * Sync Scraped Listings Script
 * 
 * This script triggers a sync run on the scraper API to fetch latest listings
 * from michiganrental.com. Run this periodically (e.g., daily via cron) to
 * keep listings up to date.
 * 
 * Usage:
 *   npx tsx scripts/sync-scraped-listings.ts
 * 
 * Environment variables:
 *   SCRAPER_API_URL - URL of the scraper API (default: http://localhost:3002)
 *   SCRAPER_ADMIN_TOKEN - Admin token for the scraper API
 */

const SCRAPER_API_URL = process.env.SCRAPER_API_URL || 'http://localhost:3002'
const ADMIN_TOKEN = process.env.SCRAPER_ADMIN_TOKEN || 'test-admin-token-123'

interface IngestRunResponse {
  data: {
    id: string
    sourceId: string
    status: string
    listingsUpserted: number
    listingsSkipped: number
    imagesDownloaded: number
  }
}

async function triggerSync() {
  console.log('🔄 Triggering sync with scraper API...')
  console.log(`   API URL: ${SCRAPER_API_URL}`)
  
  try {
    // First, check if API is healthy
    const healthResponse = await fetch(`${SCRAPER_API_URL}/health`)
    if (!healthResponse.ok) {
      throw new Error(`Scraper API health check failed: ${healthResponse.status}`)
    }
    
    const healthData = await healthResponse.json()
    console.log(`✅ Scraper API is healthy: ${JSON.stringify(healthData)}`)
    
    // Trigger a sync run
    const syncResponse = await fetch(`${SCRAPER_API_URL}/admin/ingest/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': ADMIN_TOKEN,
      },
      body: JSON.stringify({
        source: 'michiganrental',
        limit: 0, // No limit, sync all
      }),
    })
    
    if (!syncResponse.ok) {
      const errorText = await syncResponse.text()
      throw new Error(`Sync trigger failed: ${syncResponse.status} - ${errorText}`)
    }
    
    const syncData: IngestRunResponse = await syncResponse.json()
    console.log(`✅ Sync started: Run ID ${syncData.data.id}`)
    
    // Poll for completion
    let completed = false
    let attempts = 0
    const maxAttempts = 60 // 10 minutes max
    
    while (!completed && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)) // Wait 10 seconds
      
      const statusResponse = await fetch(`${SCRAPER_API_URL}/admin/ingest/runs/${syncData.data.id}`, {
        headers: {
          'X-Admin-Token': ADMIN_TOKEN,
        },
      })
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        console.log(`   Status: ${statusData.data.status}, Upserted: ${statusData.data.listingsUpserted}, Images: ${statusData.data.imagesDownloaded}`)
        
        if (statusData.data.status === 'completed' || statusData.data.status === 'failed') {
          completed = true
          
          if (statusData.data.status === 'completed') {
            console.log(`\n✅ Sync completed successfully!`)
            console.log(`   Listings upserted: ${statusData.data.listingsUpserted}`)
            console.log(`   Listings skipped: ${statusData.data.listingsSkipped}`)
            console.log(`   Images downloaded: ${statusData.data.imagesDownloaded}`)
          } else {
            console.log(`\n❌ Sync failed`)
            if (statusData.data.errorsJson) {
              console.log(`   Errors: ${JSON.stringify(statusData.data.errorsJson)}`)
            }
          }
        }
      }
      
      attempts++
    }
    
    if (!completed) {
      console.log(`\n⚠️ Sync still running after ${maxAttempts * 10} seconds. Check manually.`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

// Run the sync
triggerSync()
