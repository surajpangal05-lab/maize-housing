'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ListingCard from '@/components/ListingCard'
import { ListingWithUser, UserType } from '@/lib/types'
import { getVerificationBadge } from '@/lib/utils'

interface ListingWithFlags extends ListingWithUser {
  isStale: boolean
  isExpired: boolean
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [listings, setListings] = useState<ListingWithFlags[]>([])
  const [user, setUser] = useState<{
    emailVerified: Date | null
    phoneVerified: Date | null
    userType: string
    isUmichEmail: boolean
    activeListingsCount: number
    successfulTransitions: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    
    if (status === 'authenticated') {
      fetchData()
    }
  }, [status, router])
  
  const fetchData = async () => {
    try {
      const [listingsRes, userRes] = await Promise.all([
        fetch('/api/user/listings'),
        fetch('/api/user/me')
      ])
      
      const [listingsData, userData] = await Promise.all([
        listingsRes.json(),
        userRes.json()
      ])
      
      if (listingsData.success) {
        setListings(listingsData.listings)
      }
      
      if (userData.success) {
        setUser(userData.user)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleRenew = async (listingId: string) => {
    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'renew' })
      })
      
      const data = await response.json()
      
      if (data.success) {
        fetchData()
      } else {
        alert(data.error || 'Failed to renew listing')
      }
    } catch {
      alert('Something went wrong')
    }
  }
  
  const handleComplete = async (listingId: string) => {
    if (!confirm('Mark this listing as completed? This will remove it from active listings.')) {
      return
    }
    
    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' })
      })
      
      const data = await response.json()
      
      if (data.success) {
        fetchData()
      } else {
        alert(data.error || 'Failed to complete listing')
      }
    } catch {
      alert('Something went wrong')
    }
  }
  
  if (status === 'loading' || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 rounded w-1/4" />
          <div className="grid md:grid-cols-3 gap-6">
            <div className="h-32 bg-neutral-200 rounded-xl" />
            <div className="h-32 bg-neutral-200 rounded-xl" />
            <div className="h-32 bg-neutral-200 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }
  
  const badge = user ? getVerificationBadge(
    user.userType as UserType,
    user.emailVerified,
    user.phoneVerified,
    user.isUmichEmail
  ) : null
  
  const isFullyVerified = badge?.type !== 'UNVERIFIED'
  const activeListings = listings.filter(l => l.status === 'ACTIVE')
  const completedListings = listings.filter(l => l.status === 'COMPLETED')
  const staleListings = activeListings.filter(l => l.isStale || l.isExpired)
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
        <p className="mt-2 text-neutral-500">
          Manage your listings and track your activity
        </p>
      </div>
      
      {/* Verification Alert */}
      {!isFullyVerified && (
        <div className="mb-6 alert alert-warning flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="font-semibold">Complete Your Verification</h3>
            <p className="text-sm mt-1">
              {user?.userType === 'STUDENT' && !user?.emailVerified && (
                'Verify your @umich.edu email to post listings and contact others.'
              )}
              {user?.userType === 'LANDLORD' && !user?.emailVerified && (
                'Verify your email to post listings.'
              )}
              {user?.userType === 'LANDLORD' && user?.emailVerified && !user?.phoneVerified && (
                'Verify your phone number to get the "Verified Landlord" badge.'
              )}
            </p>
            <Link href="/profile" className="inline-block mt-2 text-sm font-semibold hover:underline">
              Complete verification →
            </Link>
          </div>
        </div>
      )}
      
      {/* Stale Listings Alert */}
      {staleListings.length > 0 && (
        <div className="mb-6 alert alert-info flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-semibold">
              {staleListings.length} listing{staleListings.length > 1 ? 's need' : ' needs'} attention
            </h3>
            <p className="text-sm mt-1">
              Some of your listings are stale or expiring soon. Renew them to keep them visible.
            </p>
          </div>
        </div>
      )}
      
      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="card p-5">
          <p className="text-sm text-neutral-500 font-medium">Active Listings</p>
          <p className="text-3xl font-bold text-neutral-900 mt-1">{activeListings.length}</p>
          <p className="text-xs text-neutral-400 mt-1">Max: 3 listings</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-neutral-500 font-medium">Completed</p>
          <p className="text-3xl font-bold text-neutral-900 mt-1">{completedListings.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-neutral-500 font-medium">Successful Transitions</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{user?.successfulTransitions || 0}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-neutral-500 font-medium">Verification Status</p>
          <div className="mt-2">
            {badge && (
              <span className={`badge ${badge.type === 'VERIFIED_UM_STUDENT' ? 'badge-maize' : badge.type === 'VERIFIED_LANDLORD' ? 'badge-green' : 'badge-gray'}`}>
                {badge.label}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Create Listing CTA */}
      {activeListings.length < 3 && isFullyVerified && (
        <div className="mb-8 p-6 bg-gradient-to-r from-[#00274C] to-[#1E3A5F] rounded-xl text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-semibold">Ready to post a new listing?</h3>
              <p className="text-sm text-neutral-300 mt-1">
                You can have up to {3 - activeListings.length} more active listing{3 - activeListings.length !== 1 ? 's' : ''}.
              </p>
            </div>
            <Link href="/listings/create" className="btn btn-primary">
              Create Listing
            </Link>
          </div>
        </div>
      )}
      
      {/* Active Listings */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Your Active Listings</h2>
        {activeListings.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeListings.map(listing => (
              <ListingCard 
                key={listing.id} 
                listing={listing}
                showActions
                onRenew={handleRenew}
                onComplete={handleComplete}
                isStale={listing.isStale}
                isExpired={listing.isExpired}
              />
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <svg className="w-12 h-12 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="font-semibold text-neutral-900 mb-2">No active listings</h3>
            <p className="text-neutral-500 mb-4">
              {isFullyVerified 
                ? "You don't have any active listings yet."
                : "Complete your verification to start posting listings."
              }
            </p>
            {isFullyVerified && (
              <Link href="/listings/create" className="btn btn-primary">
                Create Your First Listing
              </Link>
            )}
          </div>
        )}
      </div>
      
      {/* Completed Listings */}
      {completedListings.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Completed Listings</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedListings.map(listing => (
              <ListingCard 
                key={listing.id} 
                listing={listing}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
