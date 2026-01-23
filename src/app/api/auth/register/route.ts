import { NextResponse } from 'next/server'
import { registerUser } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    const { user, verificationToken } = await registerUser(
      validatedData.email,
      validatedData.password,
      validatedData.name,
      validatedData.userType
    )

    // In production, send verification email
    // For demo, we'll include the token in response
    console.log(`Verification token for ${user.email}: ${verificationToken}`)

    return NextResponse.json({
      success: true,
      message: 'Account created. Please check your email to verify your account.',
      userId: user.id,
      // Remove in production - only for demo
      verificationToken,
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

