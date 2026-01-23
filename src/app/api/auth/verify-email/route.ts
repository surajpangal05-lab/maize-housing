import { NextResponse } from 'next/server'
import { verifyEmail } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Verification token is required' },
        { status: 400 }
      )
    }

    const user = await verifyEmail(token)

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      user: {
        id: user?.id,
        email: user?.email,
        emailVerified: user?.emailVerified,
      },
    })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    )
  }
}

