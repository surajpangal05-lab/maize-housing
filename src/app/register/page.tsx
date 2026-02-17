'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function RegisterPage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'STUDENT' as 'STUDENT' | 'LANDLORD'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [verificationToken, setVerificationToken] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    
    if (formData.userType === 'STUDENT' && !formData.email.toLowerCase().endsWith('@umich.edu')) {
      setError('Students must register with a @umich.edu email address')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          userType: formData.userType
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuccess(true)
        setVerificationToken(data.verificationToken)
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }
  
  if (success) {
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
            <div className="w-16 h-16 border border-neutral-900 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-serif text-neutral-900 mb-2">Check your email</h1>
            <p className="text-neutral-500 text-sm mb-6">
              We&apos;ve sent a verification link to <strong className="text-neutral-900">{formData.email}</strong>
            </p>
            
            {/* Demo mode */}
            <div className="border border-dashed border-neutral-300 p-6 text-left mb-6">
              <p className="text-xs font-mono text-neutral-500 tracking-wider mb-3">DEMO MODE</p>
              <p className="text-sm text-neutral-600 mb-4">
                In production, you&apos;d receive an email. For testing:
              </p>
              <code className="block bg-neutral-100 px-4 py-3 text-xs font-mono text-neutral-700 break-all">
                {verificationToken}
              </code>
              <Link 
                href={`/verify-email?token=${verificationToken}`}
                className="mt-4 inline-block text-sm text-neutral-900 hover:underline"
              >
                Click here to verify →
              </Link>
            </div>
            
            <Link 
              href="/login" 
              className="inline-block px-6 py-3 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
            >
              CONTINUE TO LOGIN
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-8 py-3">
          <Link href="/" className="text-xs text-neutral-500 hover:text-neutral-900">
            ← Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-8 py-12">
        <div className="text-center mb-12">
          <Image
            src="/logo.png"
            alt="MaizeLease"
            width={160}
            height={53}
            className="h-12 w-auto mx-auto grayscale"
          />
        </div>

        <div className="border border-neutral-900 p-6">
          <h1 className="text-3xl font-serif text-neutral-900 mb-2">Create Account</h1>
          <p className="text-neutral-500 text-sm mb-8">Join the MaizeLease community</p>
          
          {/* User Type Selection */}
          <div className="mb-6">
            <label className="label">I AM A...</label>
            <div className="grid grid-cols-2 gap-0">
              <button
                type="button"
                onClick={() => setFormData({...formData, userType: 'STUDENT'})}
                className={`p-4 border border-neutral-900 text-left transition-colors ${
                  formData.userType === 'STUDENT'
                    ? 'bg-neutral-900 text-white'
                    : 'hover:bg-neutral-100'
                }`}
              >
                <span className="text-lg mb-1 block">🎓</span>
                <span className={`text-sm ${formData.userType === 'STUDENT' ? 'text-white' : 'text-neutral-900'}`}>Student</span>
                <p className={`text-xs mt-1 ${formData.userType === 'STUDENT' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  @umich.edu email
                </p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, userType: 'LANDLORD'})}
                className={`p-4 border border-neutral-900 border-l-0 text-left transition-colors ${
                  formData.userType === 'LANDLORD'
                    ? 'bg-neutral-900 text-white'
                    : 'hover:bg-neutral-100'
                }`}
              >
                <span className="text-lg mb-1 block">🏠</span>
                <span className={`text-sm ${formData.userType === 'LANDLORD' ? 'text-white' : 'text-neutral-900'}`}>Landlord</span>
                <p className={`text-xs mt-1 ${formData.userType === 'LANDLORD' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  Email + phone
                </p>
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 border border-red-500 text-red-600 text-xs">
                {error}
              </div>
            )}
            
            <div>
              <label className="label">FULL NAME</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Your name"
                required
                className="w-full px-4 py-3 text-sm border border-neutral-900 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="label">EMAIL</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder={formData.userType === 'STUDENT' ? 'uniqname@umich.edu' : 'you@email.com'}
                required
                className="w-full px-4 py-3 text-sm border border-neutral-900 focus:outline-none"
              />
              {formData.userType === 'STUDENT' && (
                <p className="mt-1 text-xs text-neutral-500">
                  Must be @umich.edu
                </p>
              )}
            </div>
            
            <div>
              <label className="label">PASSWORD</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full px-4 py-3 text-sm border border-neutral-900 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="label">CONFIRM PASSWORD</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
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
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </button>
          </form>
          
          <p className="mt-8 text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <Link href="/login" className="text-neutral-900 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
