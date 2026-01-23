'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
    
    // Check for @umich.edu email for students
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
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-neutral-50">
        <div className="w-full max-w-md">
          <div className="card p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900">Check your email!</h1>
            <p className="mt-2 text-neutral-500">
              We&apos;ve sent a verification link to <strong className="text-neutral-700">{formData.email}</strong>
            </p>
            
            {/* Demo mode - show verification token */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-left">
              <p className="text-sm font-semibold text-amber-800 mb-2">🔧 Demo Mode</p>
              <p className="text-sm text-amber-700 mb-3">
                In production, you&apos;d receive an email. For testing, use this token:
              </p>
              <code className="block bg-amber-100 px-3 py-2 rounded text-amber-900 font-mono text-sm break-all">
                {verificationToken}
              </code>
              <Link 
                href={`/verify-email?token=${verificationToken}`}
                className="mt-3 inline-block text-sm font-semibold text-amber-700 hover:text-amber-800"
              >
                Click here to verify →
              </Link>
            </div>
            
            <Link href="/login" className="btn btn-primary mt-6">
              Continue to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-neutral-50">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="MaizeLease" className="h-[67px] mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-neutral-900">Create your account</h1>
            <p className="mt-2 text-neutral-500">Join the MaizeLease community</p>
          </div>
          
          {/* User Type Selection */}
          <div className="mb-6">
            <label className="label">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({...formData, userType: 'STUDENT'})}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  formData.userType === 'STUDENT'
                    ? 'border-[#FFCB05] bg-[#FFCB05]/5'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <span className="text-2xl mb-2 block">🎓</span>
                <span className="font-semibold text-neutral-900">Student</span>
                <p className="text-xs text-neutral-500 mt-1">
                  Requires @umich.edu email
                </p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, userType: 'LANDLORD'})}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  formData.userType === 'LANDLORD'
                    ? 'border-[#FFCB05] bg-[#FFCB05]/5'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <span className="text-2xl mb-2 block">🏠</span>
                <span className="font-semibold text-neutral-900">Landlord</span>
                <p className="text-xs text-neutral-500 mt-1">
                  Email + phone verification
                </p>
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}
            
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Your name"
                required
                className="input"
              />
            </div>
            
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder={formData.userType === 'STUDENT' ? 'uniqname@umich.edu' : 'you@email.com'}
                required
                className="input"
              />
              {formData.userType === 'STUDENT' && (
                <p className="mt-1.5 text-xs text-neutral-500">
                  Must be your @umich.edu email address
                </p>
              )}
            </div>
            
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
                required
                minLength={8}
                className="input"
              />
            </div>
            
            <div>
              <label className="label">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="••••••••"
                required
                className="input"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          
          <p className="mt-6 text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[#00274C] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
