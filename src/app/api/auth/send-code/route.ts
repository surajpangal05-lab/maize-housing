import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendVerificationCode } from '@/lib/email'
import { isUmichEmail } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const { email, userType } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (userType === 'STUDENT' && !isUmichEmail(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Students must use a @umich.edu email address' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    // Rate limit: max 1 code per email per 60 seconds
    const recentToken = await prisma.verificationToken.findFirst({
      where: {
        email: normalizedEmail,
        type: 'EMAIL',
        createdAt: { gt: new Date(Date.now() - 60_000) },
      },
    })

    if (recentToken) {
      return NextResponse.json(
        { success: false, error: 'Please wait 60 seconds before requesting a new code' },
        { status: 429 }
      )
    }

    // Clean up old tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { email: normalizedEmail, type: 'EMAIL' },
    })

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await prisma.verificationToken.create({
      data: {
        email: normalizedEmail,
        token: code,
        type: 'EMAIL',
        expires,
      },
    })

    try {
      await sendVerificationCode(normalizedEmail, code)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      return NextResponse.json(
        { success: false, error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email',
    })
  } catch (error) {
    console.error('Send code error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
