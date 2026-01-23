import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { feedbackSchema } from '@/lib/validations'

// Get feedback stats for a user (aggregate only, no individual ratings)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get aggregate stats only - no individual ratings exposed
    const feedbackReceived = await prisma.feedback.findMany({
      where: { receiverId: userId },
      select: {
        overallRating: true,
        wouldRentAgain: true,
      },
    })

    const totalFeedback = feedbackReceived.length
    const wouldRentAgainCount = feedbackReceived.filter(f => f.wouldRentAgain).length
    
    // Get successful transitions count from user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        successfulTransitions: true,
        lastActiveAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      stats: {
        successfulTransitions: user?.successfulTransitions || 0,
        lastActiveAt: user?.lastActiveAt,
        totalFeedback,
        // Only show "would rent again" percentage if there's enough feedback
        wouldRentAgainPercentage: totalFeedback >= 3 
          ? Math.round((wouldRentAgainCount / totalFeedback) * 100)
          : null,
      },
    })
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}

// Submit feedback for a completed listing
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = feedbackSchema.parse(body)

    // Check if listing exists and is completed
    const listing = await prisma.listing.findUnique({
      where: { id: validatedData.listingId },
    })

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      )
    }

    if (listing.status !== 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: 'Can only leave feedback for completed listings' },
        { status: 400 }
      )
    }

    // Check if user was involved in the transaction
    // (either the listing owner or someone who messaged about it)
    const wasInvolved = listing.userId === session.user.id || 
      await prisma.message.findFirst({
        where: {
          listingId: validatedData.listingId,
          OR: [
            { senderId: session.user.id },
            { receiverId: session.user.id },
          ],
        },
      })

    if (!wasInvolved) {
      return NextResponse.json(
        { success: false, error: 'You must be involved in the transaction to leave feedback' },
        { status: 403 }
      )
    }

    // Check if feedback already exists
    const existingFeedback = await prisma.feedback.findUnique({
      where: {
        listingId_giverId: {
          listingId: validatedData.listingId,
          giverId: session.user.id,
        },
      },
    })

    if (existingFeedback) {
      return NextResponse.json(
        { success: false, error: 'You have already left feedback for this listing' },
        { status: 400 }
      )
    }

    // Cannot give feedback to yourself
    if (validatedData.receiverId === session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot leave feedback for yourself' },
        { status: 400 }
      )
    }

    const feedback = await prisma.feedback.create({
      data: {
        listingId: validatedData.listingId,
        giverId: session.user.id,
        receiverId: validatedData.receiverId,
        overallRating: validatedData.overallRating,
        wouldRentAgain: validatedData.wouldRentAgain,
        notes: validatedData.notes,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedbackId: feedback.id,
    })
  } catch (error) {
    console.error('Error submitting feedback:', error)
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}

