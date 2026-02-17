'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      
      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="inline-block mb-8">
            <Image
              src="/logo.png"
              alt="MaizeLease"
              width={160}
              height={50}
              className="h-12 w-auto"
            />
          </Link>
          
          <h1 className="text-3xl font-bold text-[#00274C] mb-2">Welcome back</h1>
          <p className="text-gray-600 mb-8">
            Sign in to your MaizeLease account to continue
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="alert alert-error">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
            
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@umich.edu"
                required
                className="input"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Password</label>
                <Link href="/forgot-password" className="text-sm text-[#00274C] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3.5"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <p className="mt-8 text-center text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-[#00274C] hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
      
      {/* Right Panel - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#00274C] to-[#1E3A5F] p-12 items-center justify-center relative overflow-hidden">
        {/* Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="login-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1.5" fill="#FFCB05" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#login-pattern)" />
          </svg>
        </div>
        
        <div className="relative text-center max-w-md">
          <div className="w-20 h-20 rounded-3xl bg-[#FFCB05] flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4">
            Find Your Perfect UMich Home
          </h2>
          <p className="text-white/70 text-lg mb-8">
            Verified listings. Academic-term leases. Built for the Michigan community.
          </p>
          
          <div className="flex justify-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-[#FFCB05]">60+</p>
              <p className="text-white/60 text-sm">Listings</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#FFCB05]">100%</p>
              <p className="text-white/60 text-sm">Verified</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#FFCB05]">Free</p>
              <p className="text-white/60 text-sm">Always</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#FFCB05] border-t-transparent rounded-full" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
