import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Email verification is now handled during registration. Please create a new account.' },
    { status: 410 }
  )
}
