import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { messageSchema } from '@/lib/validations'

// Get messages for the current user
export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listingId')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      OR: [
        { senderId: session.user.id },
        { receiverId: session.user.id },
      ],
    }

    if (listingId) {
      where.listingId = listingId
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            userType: true,
            isUmichEmail: true,
            emailVerified: true,
            phoneVerified: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            userType: true,
            isUmichEmail: true,
            emailVerified: true,
            phoneVerified: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Group messages by conversation (listing + other user)
    type ConversationType = {
      listingId: string
      listing: typeof messages[0]['listing']
      otherUser: typeof messages[0]['sender']
      messages: typeof messages
      unreadCount: number
    }
    
    const conversations = messages.reduce((acc, message) => {
      const otherUserId = message.senderId === session.user.id 
        ? message.receiverId 
        : message.senderId
      const key = `${message.listingId}-${otherUserId}`
      
      if (!acc[key]) {
        acc[key] = {
          listingId: message.listingId,
          listing: message.listing,
          otherUser: message.senderId === session.user.id ? message.receiver : message.sender,
          messages: [],
          unreadCount: 0,
        }
      }
      
      acc[key].messages.push(message)
      if (!message.read && message.receiverId === session.user.id) {
        acc[key].unreadCount++
      }
      
      return acc
    }, {} as Record<string, ConversationType>)

    return NextResponse.json({
      success: true,
      conversations: Object.values(conversations),
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// Send a message
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is verified
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user?.emailVerified) {
      return NextResponse.json(
        { success: false, error: 'You must verify your email before contacting posters' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = messageSchema.parse(body)

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: validatedData.listingId },
    })

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      )
    }

    // Cannot message yourself
    if (validatedData.receiverId === session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot send message to yourself' },
        { status: 400 }
      )
    }

    const message = await prisma.message.create({
      data: {
        listingId: validatedData.listingId,
        senderId: session.user.id,
        receiverId: validatedData.receiverId,
        content: validatedData.content,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Update listing activity
    await prisma.listing.update({
      where: { id: validatedData.listingId },
      data: { lastActivityAt: new Date() },
    })

    return NextResponse.json({
      success: true,
      message,
    })
  } catch (error) {
    console.error('Error sending message:', error)
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

