import { NextResponse } from 'next/server'
import { auth, sendPhoneVerification, verifyPhone } from '@/lib/auth'
import { phoneVerificationSchema, verifyCodeSchema } from '@/lib/validations'

// Send verification code to phone
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
    
    // If code is provided, verify it
    if (body.code) {
      const validatedData = verifyCodeSchema.parse(body)
      await verifyPhone(session.user.id, validatedData.code)
      
      return NextResponse.json({
        success: true,
        message: 'Phone number verified successfully',
      })
    }
    
    // Otherwise, send verification code
    const validatedData = phoneVerificationSchema.parse(body)
    const code = await sendPhoneVerification(session.user.id, validatedData.phone)

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your phone',
      // Remove in production - only for demo
      code,
    })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Phone verification failed' },
      { status: 500 }
    )
  }
}

