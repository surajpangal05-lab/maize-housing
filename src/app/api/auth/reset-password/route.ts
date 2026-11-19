import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkEmailCode } from '@/lib/verification'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, code, password } = await request.json()

    if (!email || typeof email !== 'string' || !code || typeof code !== 'string') {
      return NextResponse.json({ success: false, error: 'Email and code are required' }, { status: 400 })
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    const check = await checkEmailCode(normalizedEmail, code, 'PASSWORD_RESET')
    if (!check.ok) {
      return NextResponse.json(
        {
          success: false,
          error: check.reason === 'expired'
            ? 'This code has expired. Please request a new one.'
            : 'Invalid reset code',
        },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid reset code' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        // Completing a reset proves ownership of the inbox, so an account that
        // never finished the old verification flow is verified here too.
        emailVerified: user.emailVerified ?? new Date(),
      },
    })

    await prisma.verificationToken.delete({ where: { id: check.tokenId } })

    return NextResponse.json({ success: true, message: 'Password updated. You can now sign in.' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}
