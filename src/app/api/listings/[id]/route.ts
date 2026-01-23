import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { listingSchema } from '@/lib/validations'
import { getExpirationDate } from '@/lib/utils'

// Get a single listing
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
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

