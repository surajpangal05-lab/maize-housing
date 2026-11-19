import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validations'
import { isUmichEmail } from '@/lib/utils'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, ...rest } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Verification code is required' },
        { status: 400 }
      )
    }

    const validatedData = registerSchema.parse(rest)
    const normalizedEmail = validatedData.email.trim().toLowerCase()

    if (validatedData.userType === 'STUDENT' && !isUmichEmail(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Students must register with a @umich.edu email address' },
        { status: 400 }
      )
    }

    // Verify the code
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        email: normalizedEmail,
        token: code.trim(),
        type: 'EMAIL',
      },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { id: verificationToken.id } })
      return NextResponse.json(
        { success: false, error: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Check if user already exists (race condition guard)
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 12)
    const isUmich = isUmichEmail(normalizedEmail)

    // Create user with email already verified
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash: hashedPassword,
        name: validatedData.name,
        userType: validatedData.userType,
        isUmichEmail: isUmich,
        emailVerified: new Date(),
      },
    })

    // Clean up the verification token
    await prisma.verificationToken.delete({ where: { id: verificationToken.id } })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. You can now sign in.',
      userId: user.id,
    })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    )
  }
}
