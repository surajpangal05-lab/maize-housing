'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { UserType } from '@/lib/types'
import { getVerificationBadge, formatDate } from '@/lib/utils'

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
  
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [showCodeInput, setShowCodeInput] = useState(false)
  const [phoneLoading, setPhoneLoading] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const [demoCode, setDemoCode] = useState('')
  
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
        setDemoCode(data.code)
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
      <div className="min-h-screen bg-white">
        <div className="border-b border-neutral-200">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="h-4 bg-neutral-100 w-24" />
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-neutral-100 w-1/4" />
            <div className="h-64 bg-neutral-100" />
          </div>
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
    <div className="min-h-screen bg-white">
      <div className="border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-serif text-neutral-900 mb-2">Profile</h1>
        <p className="text-neutral-500 mb-12">Manage your account and verification status</p>
        
        {/* Profile Card */}
        <div className="border border-neutral-200 p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 border border-neutral-300 flex items-center justify-center flex-shrink-0">
              <span className="text-neutral-900 text-2xl font-serif">
                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-serif text-neutral-900">
                  {user.name || user.email.split('@')[0]}
                </h2>
                <span className="text-xs font-mono px-2 py-1 border border-neutral-300">
                  {badge?.label || 'UNVERIFIED'}
                </span>
              </div>
              <p className="text-neutral-500 text-sm">{user.email}</p>
              <p className="text-xs text-neutral-400 mt-2">
                Member since {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="mt-8 pt-8 border-t border-neutral-200 grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-mono text-neutral-500 tracking-wider mb-1">ACCOUNT TYPE</p>
              <p className="font-medium text-neutral-900 capitalize">{user.userType.toLowerCase()}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-neutral-500 tracking-wider mb-1">SUCCESSFUL TRANSITIONS</p>
              <p className="font-medium text-neutral-900">{user.successfulTransitions}</p>
            </div>
          </div>
        </div>
        
        {/* Edit Name */}
        <div className="border border-neutral-200 p-8 mb-8">
          <h3 className="font-serif text-lg text-neutral-900 mb-6">Display Name</h3>
          <div className="flex gap-4">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Your name"
              className="flex-1 px-4 py-3 text-sm border border-neutral-300 focus:outline-none focus:border-neutral-900"
            />
            <button
              onClick={updateName}
              disabled={nameLoading || !editName.trim() || editName === user.name}
              className="px-6 py-3 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {nameLoading ? 'SAVING...' : 'SAVE'}
            </button>
          </div>
        </div>
        
        {/* Verification Status */}
        <div className="border border-neutral-200 p-8 mb-8">
          <h3 className="font-serif text-lg text-neutral-900 mb-6">Verification Status</h3>
          
          {/* Email Verification */}
          <div className="flex items-center justify-between py-4 border-b border-neutral-200">
            <div>
              <p className="font-medium text-neutral-900">Email</p>
              <p className="text-sm text-neutral-500">{user.email}</p>
            </div>
            {user.emailVerified ? (
              <span className="text-xs font-mono px-3 py-1 border border-neutral-900 text-neutral-900">
                VERIFIED
              </span>
            ) : (
              <span className="text-xs font-mono px-3 py-1 border border-neutral-300 text-neutral-500">
                PENDING
              </span>
            )}
          </div>
          
          {/* Phone Verification (for landlords) */}
          {user.userType === 'LANDLORD' && (
            <div className="py-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium text-neutral-900">Phone</p>
                  <p className="text-sm text-neutral-500">
                    {user.phoneVerified ? user.phone : 'Required for Verified Landlord badge'}
                  </p>
                </div>
                {user.phoneVerified ? (
                  <span className="text-xs font-mono px-3 py-1 border border-neutral-900 text-neutral-900">
                    VERIFIED
                  </span>
                ) : (
                  <span className="text-xs font-mono px-3 py-1 border border-neutral-300 text-neutral-500">
                    NOT VERIFIED
                  </span>
                )}
              </div>
              
              {!user.phoneVerified && (
                <div className="space-y-4">
                  {phoneError && (
                    <div className="p-4 border border-red-500 text-red-600 text-sm">
                      {phoneError}
                    </div>
                  )}
                  
                  {!showCodeInput ? (
                    <div className="flex gap-4">
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="(123) 456-7890"
                        className="flex-1 px-4 py-3 text-sm border border-neutral-300 focus:outline-none focus:border-neutral-900"
                      />
                      <button
                        onClick={sendPhoneVerification}
                        disabled={phoneLoading}
                        className="px-6 py-3 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
                      >
                        {phoneLoading ? 'SENDING...' : 'SEND CODE'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {demoCode && (
                        <div className="p-4 border border-dashed border-neutral-300">
                          <p className="text-xs font-mono text-neutral-500 mb-2">DEMO MODE</p>
                          <p className="text-sm text-neutral-600">
                            Verification code: <code className="bg-neutral-100 px-2 py-1">{demoCode}</code>
                          </p>
                        </div>
                      )}
                      
                      <div className="flex gap-4">
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          className="flex-1 px-4 py-3 text-sm border border-neutral-300 focus:outline-none focus:border-neutral-900"
                        />
                        <button
                          onClick={verifyPhoneCode}
                          disabled={phoneLoading}
                          className="px-6 py-3 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
                        >
                          {phoneLoading ? 'VERIFYING...' : 'VERIFY'}
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          setShowCodeInput(false)
                          setVerificationCode('')
                          setDemoCode('')
                        }}
                        className="text-sm text-neutral-500 hover:text-neutral-900"
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
        
        {/* Benefits */}
        <div className="border border-dashed border-neutral-300 p-8">
          <h3 className="font-serif text-lg text-neutral-900 mb-6">Verification Benefits</h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-4">
              <div className="w-6 h-6 border border-neutral-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-neutral-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-neutral-900">Build Trust</p>
                <p className="text-sm text-neutral-500">Verified users get a badge that shows others you're legitimate.</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="w-6 h-6 border border-neutral-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-neutral-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-neutral-900">Higher Visibility</p>
                <p className="text-sm text-neutral-500">Verified listings rank higher in search results.</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="w-6 h-6 border border-neutral-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-neutral-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-neutral-900">Full Access</p>
                <p className="text-sm text-neutral-500">Post listings and contact other users on the platform.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
