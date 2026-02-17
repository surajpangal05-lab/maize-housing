import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { listingSchema } from '@/lib/validations'
import { getExpirationDate } from '@/lib/utils'

const SCRAPER_API_URL = process.env.SCRAPER_API_URL || 'http://localhost:3002'

// Fetch a scraped listing from the scraper API
async function fetchScrapedListing(scrapedId: string) {
  try {
    const response = await fetch(`${SCRAPER_API_URL}/listings/${scrapedId}`)
    
    if (!response.ok) return null
    
    const data = await response.json()
    const scraped = data.data
    
    if (!scraped) return null
    
    // Get ALL images from the scraped listing
    const images = scraped.images?.map((img: { originalUrl: string; storedUrl: string | null }) => 
      img.originalUrl || img.storedUrl
    ).filter(Boolean) || []
    
    // Only include fields that actually have data - don't hallucinate
    const hasAddress = scraped.street || scraped.unit
    const hasCity = scraped.city
    const hasState = scraped.state
    
    // Parse contact info if available
    const contact = scraped.contactJson as { phone?: string; email?: string; name?: string } | null
    
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
      moveInDate: scraped.availabilityDate || null,
      moveInWindowStart: null,
      moveInWindowEnd: null,
      leaseEndDate: null,
      amenities: scraped.amenitiesJson ? JSON.stringify(scraped.amenitiesJson) : null,
      images: images.length > 0 ? JSON.stringify(images) : null,
      createdAt: scraped.createdAt,
      updatedAt: scraped.updatedAt,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivityAt: scraped.scrapedAt,
      renewedAt: null,
      viewCount: 0,
      // Contact info from scraper
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
  } catch (error) {
    console.error('Error fetching scraped listing:', error)
    return null
  }
}

// Get a single listing
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if this is a scraped listing
    if (id.startsWith('scraped_')) {
      const scrapedId = id.replace('scraped_', '')
      const listing = await fetchScrapedListing(scrapedId)
      
      if (!listing) {
        return NextResponse.json(
          { success: false, error: 'Listing not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        listing,
      })
    }
    
    const listing = await prisma.listing.findUnique({
      where: { id },
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

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await prisma.listing.update({
      where: { id },
      data: { 
        viewCount: { increment: 1 },
        lastActivityAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      listing,
    })
  } catch (error) {
    console.error('Error fetching listing:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listing' },
      { status: 500 }
    )
  }
}

// Update a listing
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const listing = await prisma.listing.findUnique({
      where: { id },
    })

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      )
    }

    if (listing.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = listingSchema.parse(body)

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
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
        lastActivityAt: new Date(),
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
      listing: updatedListing,
    })
  } catch (error) {
    console.error('Error updating listing:', error)
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update listing' },
      { status: 500 }
    )
  }
}

// Delete a listing
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const listing = await prisma.listing.findUnique({
      where: { id },
    })

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      )
    }

    if (listing.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    await prisma.listing.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Listing deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting listing:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete listing' },
      { status: 500 }
    )
  }
}

// Renew a listing
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const listing = await prisma.listing.findUnique({
      where: { id },
    })

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      )
    }

    if (listing.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const action = body.action

    if (action === 'renew') {
      const updatedListing = await prisma.listing.update({
        where: { id },
        data: {
          expiresAt: getExpirationDate(30),
          renewedAt: new Date(),
          lastActivityAt: new Date(),
          status: 'ACTIVE',
        },
      })

      return NextResponse.json({
        success: true,
        listing: updatedListing,
        message: 'Listing renewed for 30 days',
      })
    }

    if (action === 'complete') {
      const updatedListing = await prisma.listing.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          lastActivityAt: new Date(),
        },
      })

      // Increment successful transitions for the user
      await prisma.user.update({
        where: { id: listing.userId },
        data: {
          successfulTransitions: { increment: 1 },
        },
      })

      return NextResponse.json({
        success: true,
        listing: updatedListing,
        message: 'Listing marked as completed',
      })
    }

    if (action === 'cancel') {
      const updatedListing = await prisma.listing.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          lastActivityAt: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        listing: updatedListing,
        message: 'Listing cancelled',
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error updating listing status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update listing' },
      { status: 500 }
    )
  }
}

