import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { scraperPrisma } from '@/lib/scraper-db'
import { listingSchema } from '@/lib/validations'
import { getExpirationDate, getVerificationBadge } from '@/lib/utils'
import { UserType } from '@/lib/types'

// Fetch scraped listings directly from database
async function fetchScrapedListings(searchParams: URLSearchParams) {
  try {
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const skip = (page - 1) * limit
    
    // Build where clause for filters
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}
    
    if (searchParams.get('city')) {
      where.city = { contains: searchParams.get('city'), mode: 'insensitive' }
    }
    if (searchParams.get('minRent')) {
      where.priceMin = { gte: parseFloat(searchParams.get('minRent')!) }
    }
    if (searchParams.get('maxRent')) {
      where.priceMax = { lte: parseFloat(searchParams.get('maxRent')!) }
    }
    if (searchParams.get('bedrooms')) {
      where.beds = parseInt(searchParams.get('bedrooms')!)
    }
    
    const [scrapedListings, total] = await Promise.all([
      scraperPrisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          source: true,
        },
      }),
      scraperPrisma.listing.count({ where }),
    ])
    
    // Transform to our format
    const listings = scrapedListings.map((scraped) => {
      // Get ALL images
      const images = scraped.images?.map((img) => img.originalUrl || img.storedUrl).filter(Boolean) || []
      
      // Parse contact JSON
      const contactJson = scraped.contactJson as { phone?: string; email?: string; name?: string } | null
      
      // Only include fields that actually have data - don't hallucinate
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
        address: hasAddress ? [scraped.street, scraped.unit].filter(Boolean).join(', ') : null,
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
        moveInDate: scraped.availabilityDate?.toISOString() || null,
        moveInWindowStart: null,
        moveInWindowEnd: null,
        leaseEndDate: null,
        amenities: scraped.amenitiesJson ? JSON.stringify(scraped.amenitiesJson) : null,
        images: images.length > 0 ? JSON.stringify(images) : null,
        createdAt: scraped.createdAt.toISOString(),
        updatedAt: scraped.updatedAt.toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastActivityAt: scraped.scrapedAt.toISOString(),
        renewedAt: null,
        viewCount: 0,
        // Contact info from scraper
        contactPhone: contactJson?.phone || null,
        contactEmail: contactJson?.email || null,
        contactName: contactJson?.name || null,
        user: {
          id: 'scraped',
          email: 'listings@maizeleasing.com',
          name: contactJson?.name || 'Property Manager',
          userType: 'LANDLORD',
          emailVerified: new Date().toISOString(),
          phoneVerified: null,
          isUmichEmail: false,
          lastActiveAt: scraped.scrapedAt.toISOString(),
          successfulTransitions: 0,
        }
      }
    })
    
    return { listings, total }
  } catch (error) {
    console.error('Error fetching scraped listings:', error)
    return { listings: [], total: 0 }
  }
}

// Get all listings with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const type = searchParams.get('type')
    const termTags = searchParams.get('termTags')?.split(',')
    const minRent = searchParams.get('minRent')
    const maxRent = searchParams.get('maxRent')
    const bedrooms = searchParams.get('bedrooms')
    const bathrooms = searchParams.get('bathrooms')
    const propertyType = searchParams.get('propertyType')
    const moveInStart = searchParams.get('moveInStart')
    const moveInEnd = searchParams.get('moveInEnd')
    const neighborhood = searchParams.get('neighborhood')
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true'
    const includeScraped = searchParams.get('includeScraped') !== 'false' // Default to true
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      status: 'ACTIVE',
      expiresAt: { gt: new Date() },
    }

    if (type) where.type = type
    if (propertyType) where.propertyType = propertyType
    if (neighborhood) where.neighborhood = { contains: neighborhood }
    if (bedrooms) where.bedrooms = parseInt(bedrooms)
    if (bathrooms) where.bathrooms = parseFloat(bathrooms)
    
    if (minRent || maxRent) {
      where.rent = {}
      if (minRent) where.rent.gte = parseFloat(minRent)
      if (maxRent) where.rent.lte = parseFloat(maxRent)
    }

    if (moveInStart || moveInEnd) {
      where.moveInDate = {}
      if (moveInStart) where.moveInDate.gte = new Date(moveInStart)
      if (moveInEnd) where.moveInDate.lte = new Date(moveInEnd)
    }

    // Get listings with user info
    let listings = await prisma.listing.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            userType: true,
            isUmichEmail: true,
            emailVerified: true,
            phoneVerified: true,
            successfulTransitions: true,
            lastActiveAt: true,
          },
        },
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    })

    // Filter by term tags (since it's stored as comma-separated string)
    if (termTags && termTags.length > 0) {
      listings = listings.filter(listing => {
        const listingTags = listing.termTags.split(',')
        return termTags.some(tag => listingTags.includes(tag))
      })
    }

    // Filter by verified only
    if (verifiedOnly) {
      listings = listings.filter(listing => {
        const badge = getVerificationBadge(
          listing.user.userType as UserType,
          listing.user.emailVerified,
          listing.user.phoneVerified,
          listing.user.isUmichEmail
        )
        return badge.type !== 'UNVERIFIED'
      })
    }

    // Sort: verified listings rank higher
    listings.sort((a, b) => {
      const aVerified = getVerificationBadge(
        a.user.userType as UserType,
        a.user.emailVerified,
        a.user.phoneVerified,
        a.user.isUmichEmail
      ).type !== 'UNVERIFIED'
      
      const bVerified = getVerificationBadge(
        b.user.userType as UserType,
        b.user.emailVerified,
        b.user.phoneVerified,
        b.user.isUmichEmail
      ).type !== 'UNVERIFIED'

      if (aVerified && !bVerified) return -1
      if (!aVerified && bVerified) return 1
      return 0
    })

    const total = await prisma.listing.count({ where })

    // Fetch scraped listings if enabled and type is not SUBLEASE
    let allListings = [...listings]
    let scrapedTotal = 0
    
    if (includeScraped && type !== 'SUBLEASE') {
      const scraped = await fetchScrapedListings(searchParams)
      scrapedTotal = scraped.total
      
      // Combine user listings with scraped listings
      // User listings first, then scraped
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      allListings = [...allListings, ...scraped.listings] as any
    }

    return NextResponse.json({
      success: true,
      listings: allListings,
      pagination: {
        page,
        limit,
        total: total + scrapedTotal,
        totalPages: Math.ceil((total + scrapedTotal) / limit),
        userListingsTotal: total,
        scrapedListingsTotal: scrapedTotal,
      },
    })
  } catch (error) {
    console.error('Error fetching listings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listings' },
      { status: 500 }
    )
  }
}

// Create a new listing
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check verification status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Students must verify .edu email to post
    if (user.userType === 'STUDENT' && !user.emailVerified) {
      return NextResponse.json(
        { success: false, error: 'Students must verify their @umich.edu email to post listings' },
        { status: 403 }
      )
    }

    // Landlords must verify email to post
    if (user.userType === 'LANDLORD' && !user.emailVerified) {
      return NextResponse.json(
        { success: false, error: 'Landlords must verify their email to post listings' },
        { status: 403 }
      )
    }

    // Check listing limit (max 3 active listings)
    const activeListingsCount = await prisma.listing.count({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
    })

    if (activeListingsCount >= 3) {
      return NextResponse.json(
        { success: false, error: 'You can have a maximum of 3 active listings' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = listingSchema.parse(body)

    const listing = await prisma.listing.create({
      data: {
        userId: session.user.id,
        type: validatedData.type,
        title: validatedData.title,
        description: validatedData.description,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        zipCode: validatedData.zipCode,
        neighborhood: validatedData.neighborhood,
        propertyType: validatedData.propertyType,
        bedrooms: validatedData.bedrooms,
        bathrooms: validatedData.bathrooms,
        sqft: validatedData.sqft,
        rent: validatedData.rent,
        deposit: validatedData.deposit,
        subleaseFee: validatedData.subleaseFee,
        utilitiesIncluded: validatedData.utilitiesIncluded,
        utilitiesNotes: validatedData.utilitiesNotes,
        termTags: validatedData.termTags.join(','),
        moveInDate: new Date(validatedData.moveInDate),
        moveInWindowStart: validatedData.moveInWindowStart ? new Date(validatedData.moveInWindowStart) : null,
        moveInWindowEnd: validatedData.moveInWindowEnd ? new Date(validatedData.moveInWindowEnd) : null,
        leaseEndDate: new Date(validatedData.leaseEndDate),
        amenities: JSON.stringify(validatedData.amenities),
        images: JSON.stringify(validatedData.images),
        expiresAt: getExpirationDate(30),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            userType: true,
            isUmichEmail: true,
            emailVerified: true,
            phoneVerified: true,
            successfulTransitions: true,
            lastActiveAt: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      listing,
    })
  } catch (error) {
    console.error('Error creating listing:', error)
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create listing' },
      { status: 500 }
    )
  }
}

