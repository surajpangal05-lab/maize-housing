'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')
  
  useEffect(() => {
    if (!token) {
      setStatus('error')
      setError('No verification token provided')
      return
    }
    
    verifyEmail()
  }, [token])
  
  const verifyEmail = async () => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setStatus('success')
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setStatus('error')
        setError(data.error || 'Verification failed')
      }
    } catch {
      setStatus('error')
      setError('Something went wrong')
    }
  }
  
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-neutral-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Image
            src="/logo.png"
            alt="MaizeLease"
            width={160}
            height={53}
            className="h-12 w-auto mx-auto grayscale"
          />
        </div>

        <div className="border border-neutral-200 p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 border border-neutral-300 flex items-center justify-center mx-auto mb-6">
                <svg className="w-6 h-6 text-neutral-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <h1 className="text-2xl font-serif text-neutral-900 mb-2">Verifying your email...</h1>
              <p className="text-neutral-500 text-sm">Please wait while we verify your email address.</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="w-16 h-16 border border-neutral-900 flex items-center justify-center mx-auto mb-6">
                <svg className="w-6 h-6 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-serif text-neutral-900 mb-2">Email Verified</h1>
              <p className="text-neutral-500 text-sm mb-6">
                Your email has been verified successfully. Redirecting to login...
              </p>
              <Link 
                href="/login" 
                className="inline-block px-6 py-3 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
              >
                CONTINUE TO LOGIN
              </Link>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="w-16 h-16 border border-neutral-300 flex items-center justify-center mx-auto mb-6">
                <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-serif text-neutral-900 mb-2">Verification Failed</h1>
              <p className="text-neutral-500 text-sm mb-6">{error}</p>
              <Link 
                href="/register" 
                className="inline-block px-6 py-3 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
              >
                TRY AGAIN
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
