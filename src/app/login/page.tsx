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
    <div className="min-h-screen bg-white">
      {/* Back link */}
      <div className="border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-8 py-3">
          <Link href="/" className="text-xs text-neutral-500 hover:text-neutral-900">
            ← Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-8 py-12">
        {/* Logo */}
        <div className="text-center mb-12">
          <Image
            src="/logo.png"
            alt="MaizeLease"
            width={160}
            height={53}
            className="h-12 w-auto mx-auto grayscale"
          />
        </div>

        {/* Form */}
        <div className="border border-neutral-900 p-6">
          <h1 className="text-3xl font-serif text-neutral-900 mb-2">Sign In</h1>
          <p className="text-neutral-500 text-sm mb-8">Welcome back to MaizeLease</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 border border-red-500 text-red-600 text-xs">
                {error}
              </div>
            )}
            
            <div>
              <label className="label">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@umich.edu"
                required
                className="w-full px-4 py-3 text-sm border border-neutral-900 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="label">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 text-sm border border-neutral-900 focus:outline-none"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>
          
          <p className="mt-8 text-center text-sm text-neutral-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-neutral-900 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse w-full max-w-md px-4">
          <div className="h-12 bg-neutral-100 w-32 mx-auto mb-12" />
          <div className="border border-neutral-200 p-8">
            <div className="h-8 bg-neutral-100 w-24 mb-8" />
            <div className="space-y-6">
              <div className="h-12 bg-neutral-100" />
              <div className="h-12 bg-neutral-100" />
              <div className="h-12 bg-neutral-100" />
            </div>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
