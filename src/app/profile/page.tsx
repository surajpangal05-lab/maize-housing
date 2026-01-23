'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { UserType } from '@/lib/types'
import { getVerificationBadge, formatDate } from '@/lib/utils'
import VerificationBadge from '@/components/VerificationBadge'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [user, setUser] = useState<{
    id: string
    email: string
    emailVerified: Date | null
    name: string | null
    phone: string | null
    phoneVerified: Date | null
    userType: string
    isUmichEmail: boolean
    createdAt: Date
    successfulTransitions: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Phone verification state
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [showCodeInput, setShowCodeInput] = useState(false)
  const [phoneLoading, setPhoneLoading] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const [demoCode, setDemoCode] = useState('')
  
  // Profile editing
  const [editName, setEditName] = useState('')
  const [nameLoading, setNameLoading] = useState(false)
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    
    if (status === 'authenticated') {
      fetchUser()
    }
  }, [status, router])
  
  const fetchUser = async () => {
    try {
      const response = await fetch('/api/user/me')
      const data = await response.json()
      
      if (data.success) {
        setUser(data.user)
        setEditName(data.user.name || '')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const sendPhoneVerification = async () => {
    if (!phoneNumber.trim()) {
      setPhoneError('Please enter a phone number')
      return
    }
    
    setPhoneLoading(true)
    setPhoneError('')
    
    try {
      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber.replace(/\D/g, '') })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setShowCodeInput(true)
        setDemoCode(data.code) // Demo only - would be sent via SMS in production
      } else {
        setPhoneError(data.error || 'Failed to send verification code')
      }
    } catch {
      setPhoneError('Something went wrong')
    } finally {
      setPhoneLoading(false)
    }
  }
  
  const verifyPhoneCode = async () => {
    if (!verificationCode.trim()) {
      setPhoneError('Please enter the verification code')
      return
    }
    
    setPhoneLoading(true)
    setPhoneError('')
    
    try {
      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode })
      })
      
      const data = await response.json()
      
      if (data.success) {
        fetchUser()
        setShowCodeInput(false)
        setPhoneNumber('')
        setVerificationCode('')
        setDemoCode('')
      } else {
        setPhoneError(data.error || 'Invalid verification code')
      }
    } catch {
      setPhoneError('Something went wrong')
    } finally {
      setPhoneLoading(false)
    }
  }
  
  const updateName = async () => {
    if (!editName.trim()) return
    
    setNameLoading(true)
    
    try {
      const response = await fetch('/api/user/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setUser(data.user)
      }
    } catch (error) {
      console.error('Error updating name:', error)
    } finally {
      setNameLoading(false)
    }
  }
  
  if (status === 'loading' || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 rounded w-1/4" />
          <div className="h-64 bg-neutral-200 rounded-xl" />
        </div>
      </div>
    )
  }
  
  if (!user) return null
  
  const badge = getVerificationBadge(
    user.userType as UserType,
    user.emailVerified,
    user.phoneVerified,
    user.isUmichEmail
  )
  
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Profile</h1>
        <p className="mt-2 text-neutral-500">
          Manage your account and verification status
        </p>
      </div>
      
      {/* Profile Card */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-[#FFCB05] flex items-center justify-center flex-shrink-0">
            <span className="text-[#00274C] text-2xl font-bold">
              {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-semibold text-neutral-900">
                {user.name || user.email.split('@')[0]}
              </h2>
              <VerificationBadge
                userType={user.userType as UserType}
                emailVerified={user.emailVerified}
                phoneVerified={user.phoneVerified}
                isUmichEmail={user.isUmichEmail}
                size="sm"
              />
            </div>
            <p className="text-neutral-500">{user.email}</p>
            <p className="text-sm text-neutral-400 mt-1">
              Member since {formatDate(user.createdAt)}
            </p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="mt-6 pt-6 border-t border-neutral-100 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-neutral-500">Account Type</p>
            <p className="font-semibold text-neutral-900 capitalize">{user.userType.toLowerCase()}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Successful Transitions</p>
            <p className="font-semibold text-neutral-900">{user.successfulTransitions}</p>
          </div>
        </div>
      </div>
      
      {/* Edit Name */}
      <div className="card p-6 mb-6">
        <h3 className="font-semibold text-neutral-900 mb-4">Display Name</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Your name"
            className="input flex-1"
          />
          <button
            onClick={updateName}
            disabled={nameLoading || !editName.trim() || editName === user.name}
            className="btn btn-primary px-6"
          >
            {nameLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      
      {/* Verification Status */}
      <div className="card p-6 mb-6">
        <h3 className="font-semibold text-neutral-900 mb-4">Verification Status</h3>
        
        {/* Email Verification */}
        <div className="flex items-center justify-between py-4 border-b border-neutral-100">
          <div>
            <p className="font-medium text-neutral-900">Email Verification</p>
            <p className="text-sm text-neutral-500">{user.email}</p>
          </div>
          {user.emailVerified ? (
            <span className="badge badge-green">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Verified
            </span>
          ) : (
            <span className="badge badge-gray">Pending</span>
          )}
        </div>
        
        {/* Phone Verification (for landlords) */}
        {user.userType === 'LANDLORD' && (
          <div className="py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium text-neutral-900">Phone Verification</p>
                <p className="text-sm text-neutral-500">
                  {user.phoneVerified ? user.phone : 'Required for "Verified Landlord" badge'}
                </p>
              </div>
              {user.phoneVerified ? (
                <span className="badge badge-green">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              ) : (
                <span className="badge badge-gray">Not verified</span>
              )}
            </div>
            
            {!user.phoneVerified && (
              <div className="space-y-3">
                {phoneError && (
                  <div className="alert alert-error">
                    {phoneError}
                  </div>
                )}
                
                {!showCodeInput ? (
                  <div className="flex gap-3">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="(123) 456-7890"
                      className="input flex-1"
                    />
                    <button
                      onClick={sendPhoneVerification}
                      disabled={phoneLoading}
                      className="btn btn-primary px-6"
                    >
                      {phoneLoading ? 'Sending...' : 'Send Code'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Demo mode - show code */}
                    {demoCode && (
                      <div className="alert alert-warning">
                        🔧 <strong>Demo Mode:</strong> Your verification code is <code className="bg-amber-100 px-2 py-0.5 rounded mx-1">{demoCode}</code>
                      </div>
                    )}
                    
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="input flex-1"
                      />
                      <button
                        onClick={verifyPhoneCode}
                        disabled={phoneLoading}
                        className="btn btn-primary px-6"
                      >
                        {phoneLoading ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setShowCodeInput(false)
                        setVerificationCode('')
                        setDemoCode('')
                      }}
                      className="text-sm text-neutral-500 hover:text-neutral-700 font-medium"
                    >
                      ← Back
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Verification Benefits */}
      <div className="card p-6 bg-neutral-50">
        <h3 className="font-semibold text-neutral-900 mb-4">Verification Benefits</h3>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-neutral-900">Build Trust</p>
              <p className="text-sm text-neutral-500">Verified users get a badge that shows others you&apos;re legitimate.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-neutral-900">Higher Visibility</p>
              <p className="text-sm text-neutral-500">Verified listings rank higher in search results.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-neutral-900">Full Access</p>
              <p className="text-sm text-neutral-500">Post listings and contact other users on the platform.</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}
