import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendVerificationCode } from '@/lib/email'
import { isUmichEmail } from '@/lib/utils'
import { issueEmailCode } from '@/lib/verification'

export async function POST(request: Request) {
  try {
    const { email, userType } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (userType === 'STUDENT' && !isUmichEmail(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Students must use a @umich.edu email address' },
        { status: 400 }
      )
    }

    // Accounts created under the old flow may exist without ever having been
    // verified. Let those owners finish signing up; only block verified accounts.
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existingUser?.emailVerified) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists. Try signing in or resetting your password.' },
        { status: 400 }
      )
    }

    const code = await issueEmailCode(normalizedEmail, 'EMAIL')
    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Please wait 60 seconds before requesting a new code' },
        { status: 429 }
      )
    }

    try {
      await sendVerificationCode(normalizedEmail, code)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      return NextResponse.json(
        { success: false, error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Verification code sent to your email' })
  } catch (error) {
    console.error('Send code error:', error)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}
