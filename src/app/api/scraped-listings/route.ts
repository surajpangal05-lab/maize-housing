import { NextResponse } from 'next/server'

const SCRAPER_API_URL = process.env.SCRAPER_API_URL || 'http://localhost:3002'

interface ScrapedListing {
  id: string
  sourceId: string
  sourceListingId: string | null
  canonicalUrl: string
  title: string | null
  street: string | null
  unit: string | null
  city: string | null
  state: string | null
  zip: string | null
  lat: number | null
  lng: number | null
  priceMin: number | null
  priceMax: number | null
  beds: number | null
  baths: number | null
  sqft: number | null
  propertyType: string | null
  availabilityDate: string | null
  leaseTerm: string | null
  deposit: number | null
  feesJson: unknown
  amenitiesJson: unknown
  description: string | null
  contactJson: unknown
  createdAt: string
  updatedAt: string
  scrapedAt: string
  images: {
    id: string
    originalUrl: string
    storedUrl: string | null
    width: number | null
    height: number | null
    mimeType: string | null
    sortOrder: number
  }[]
  source: {
    name: string
  }
}

interface ScraperApiResponse {
  data: ScrapedListing[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Transform scraped listing to match our listing format
function transformScrapedListing(scraped: ScrapedListing) {
  // Build address from components
  const addressParts = [scraped.street, scraped.unit].filter(Boolean)
  const address = addressParts.join(', ') || 'Address not provided'
  
  // Get first image URL
  const images = scraped.images?.map(img => img.originalUrl || img.storedUrl).filter(Boolean) || []
  
  // Parse amenities
  let amenities: string[] = []
  if (scraped.amenitiesJson) {
    if (Array.isArray(scraped.amenitiesJson)) {
      amenities = scraped.amenitiesJson as string[]
    } else if (typeof scraped.amenitiesJson === 'object') {
      amenities = Object.keys(scraped.amenitiesJson as object)
    }
  }
  
  // Parse contact info
  const contact = scraped.contactJson as { phone?: string; email?: string; name?: string } | null
  
  // Only include data that actually exists
  const hasAddress = scraped.street || scraped.unit
  const hasCity = scraped.city
  const hasState = scraped.state
  
  return {
    id: `scraped_${scraped.id}`,
    userId: null,
    type: 'RENTAL',
    status: 'ACTIVE',
    title: scraped.title || (scraped.beds ? `${scraped.beds} BR` : 'Rental') + (hasCity ? ` in ${scraped.city}` : ''),
    description: scraped.description || null,
    address: hasAddress ? address : null,
    city: hasCity ? scraped.city : null,
    state: hasState ? scraped.state : null,
    zipCode: scraped.zip || null,
    neighborhood: null,
    propertyType: scraped.propertyType?.toUpperCase() || null,
    bedrooms: scraped.beds,
    bathrooms: scraped.baths,
    sqft: scraped.sqft,
    rent: scraped.priceMin || scraped.priceMax || null,
    deposit: scraped.deposit,
    subleaseFee: null,
    utilitiesIncluded: null,
    utilitiesNotes: null,
    termTags: '',
    moveInDate: scraped.availabilityDate || null,
    moveInWindowStart: null,
    moveInWindowEnd: null,
    leaseEndDate: null,
    amenities: amenities.length > 0 ? JSON.stringify(amenities) : null,
    images: images.length > 0 ? JSON.stringify(images) : null,
    createdAt: scraped.createdAt,
    updatedAt: scraped.updatedAt,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivityAt: scraped.scrapedAt,
    renewedAt: null,
    viewCount: 0,
    // Contact info
    contactPhone: contact?.phone || null,
    contactEmail: contact?.email || null,
    contactName: contact?.name || null,
    user: {
      id: 'scraped',
      email: contact?.email || 'listings@maizeleasing.com',
      name: contact?.name || 'Property Manager',
      userType: 'LANDLORD',
      emailVerified: new Date().toISOString(),
      phoneVerified: null,
      isUmichEmail: false,
      lastActiveAt: scraped.scrapedAt,
      successfulTransitions: 0,
    }
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  // Build query params for scraper API
  const params = new URLSearchParams()
  
  const page = searchParams.get('page') || '1'
  const limit = searchParams.get('limit') || '20'
  params.set('page', page)
  params.set('limit', limit)
  
  // Map our filter params to scraper API params
  if (searchParams.get('city')) params.set('city', searchParams.get('city')!)
  if (searchParams.get('minRent')) params.set('minPrice', searchParams.get('minRent')!)
  if (searchParams.get('maxRent')) params.set('maxPrice', searchParams.get('maxRent')!)
  if (searchParams.get('bedrooms')) params.set('beds', searchParams.get('bedrooms')!)
  if (searchParams.get('query')) params.set('q', searchParams.get('query')!)
  
  try {
    const response = await fetch(`${SCRAPER_API_URL}/listings?${params.toString()}`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })
    
    if (!response.ok) {
      console.error('Scraper API error:', response.status, response.statusText)
      return NextResponse.json({
        success: true,
        listings: [],
        pagination: { page: 1, totalPages: 0, total: 0 },
        source: 'scraped'
      })
    }
    
    const data: ScraperApiResponse = await response.json()
    
    // Transform scraped listings to our format
    const transformedListings = data.data.map(transformScrapedListing)
    
    return NextResponse.json({
      success: true,
      listings: transformedListings,
      pagination: {
        page: data.pagination.page,
        totalPages: data.pagination.totalPages,
        total: data.pagination.total,
      },
      source: 'scraped'
    })
  } catch (error) {
    console.error('Error fetching scraped listings:', error)
    return NextResponse.json({
      success: true,
      listings: [],
      pagination: { page: 1, totalPages: 0, total: 0 },
      source: 'scraped',
      error: 'Scraper API unavailable'
    })
  }
}
