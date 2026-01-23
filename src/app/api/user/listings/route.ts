import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isListingStale, isListingExpired } from '@/lib/utils'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const listings = await prisma.listing.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    // Add stale and expired flags
    const listingsWithFlags = listings.map(listing => ({
      ...listing,
      isStale: isListingStale(listing.lastActivityAt),
      isExpired: isListingExpired(listing.expiresAt),
    }))

    return NextResponse.json({
      success: true,
      listings: listingsWithFlags,
    })
  } catch (error) {
    console.error('Error fetching user listings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listings' },
      { status: 500 }
    )
  }
}

