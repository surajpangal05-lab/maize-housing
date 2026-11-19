'use client'

import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#00274C] flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#FFCB05]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#00274C] mb-2">Verification has moved</h1>
          <p className="text-gray-600 mb-6">
            Email verification now happens during registration. Please create a new account to verify your email.
          </p>
          <Link href="/register" className="btn btn-primary w-full">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  )
}
