import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetCode } from '@/lib/email'
import { issueEmailCode } from '@/lib/verification'

const GENERIC = 'If an account exists for that email, a reset code is on its way.'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })

    // Do not reveal whether an account exists.
    if (!user) {
      return NextResponse.json({ success: true, message: GENERIC })
    }

    const code = await issueEmailCode(normalizedEmail, 'PASSWORD_RESET')
    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Please wait 60 seconds before requesting a new code' },
        { status: 429 }
      )
    }

    try {
      await sendPasswordResetCode(normalizedEmail, code)
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError)
      return NextResponse.json(
        { success: false, error: 'Failed to send the reset email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: GENERIC })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}
