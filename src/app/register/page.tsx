'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function RegisterPage() {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#FFCB05] flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#00274C] mb-2">Check your email</h1>
            <p className="text-gray-600 mb-6">
              We&apos;ve sent a verification link to <strong>{formData.email}</strong>
            </p>
            
            {/* Demo mode */}
            <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
              <p className="text-xs font-medium text-gray-500 mb-2">DEMO MODE</p>
              <p className="text-sm text-gray-600 mb-3">
                In production, you&apos;d receive an email. For testing:
              </p>
              <code className="block bg-gray-100 rounded px-3 py-2 text-xs text-gray-700 break-all mb-3">
                {verificationToken}
              </code>
              <Link 
                href={`/verify-email?token=${verificationToken}`}
                className="text-sm text-[#00274C] font-medium hover:underline"
              >
                Click here to verify →
              </Link>
            </div>
            
            <Link href="/login" className="btn btn-primary w-full">
              Continue to Login
            </Link>
          </div>
        </div>
      </div>
    )
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
          
          <h1 className="text-3xl font-bold text-[#00274C] mb-2">Create Account</h1>
          <p className="text-gray-600 mb-8">Join the MaizeLease community</p>
          
          {/* User Type Selection */}
          <div className="mb-6">
            <label className="label">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({...formData, userType: 'STUDENT'})}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  formData.userType === 'STUDENT'
                    ? 'border-[#FFCB05] bg-[#FFCB05]/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-xl mb-1 block">🎓</span>
                <span className="font-medium text-[#00274C]">Student</span>
                <p className="text-xs text-gray-500 mt-1">@umich.edu email</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, userType: 'LANDLORD'})}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  formData.userType === 'LANDLORD'
                    ? 'border-[#FFCB05] bg-[#FFCB05]/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-xl mb-1 block">🏠</span>
                <span className="font-medium text-[#00274C]">Landlord</span>
                <p className="text-xs text-gray-500 mt-1">Email + phone</p>
              </button>
            </div>
          </div>
          
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
                <p className="mt-1 text-xs text-gray-500">Must be @umich.edu</p>
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
              className="btn btn-primary w-full py-3.5"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
          
          <p className="mt-8 text-center text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[#00274C] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      
      {/* Right Panel - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#00274C] p-12 items-center justify-center relative">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-3xl bg-[#FFCB05] flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4">
            Join the Michigan Housing Community
          </h2>
          <p className="text-white/70 text-lg">
            Create your free account and start browsing verified listings today.
          </p>
        </div>
      </div>
    </div>
  )
}
