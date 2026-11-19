import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validations'
import { isUmichEmail } from '@/lib/utils'
import { checkEmailCode } from '@/lib/verification'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, ...rest } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ success: false, error: 'Verification code is required' }, { status: 400 })
    }

    const validatedData = registerSchema.parse(rest)
    const normalizedEmail = validatedData.email.trim().toLowerCase()

    if (validatedData.userType === 'STUDENT' && !isUmichEmail(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Students must register with a @umich.edu email address' },
        { status: 400 }
      )
    }

    const check = await checkEmailCode(normalizedEmail, code, 'EMAIL')
    if (!check.ok) {
      return NextResponse.json(
        {
          success: false,
          error: check.reason === 'expired'
            ? 'Verification code has expired. Please request a new one.'
            : 'Invalid verification code',
        },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existingUser?.emailVerified) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(validatedData.password, 12)
    const data = {
      passwordHash,
      name: validatedData.name,
      userType: validatedData.userType,
      isUmichEmail: isUmichEmail(normalizedEmail),
      emailVerified: new Date(),
    }

    // An unverified account from the old link-based flow is claimed by whoever
    // proves ownership of the email now, rather than left permanently locked.
    const user = existingUser
      ? await prisma.user.update({ where: { id: existingUser.id }, data })
      : await prisma.user.create({ data: { email: normalizedEmail, ...data } })

    await prisma.verificationToken.delete({ where: { id: check.tokenId } })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. You can now sign in.',
      userId: user.id,
    })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: 'Registration failed' }, { status: 500 })
  }
}
