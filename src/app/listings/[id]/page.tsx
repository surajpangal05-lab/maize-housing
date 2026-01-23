'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ListingWithUser, UserType } from '@/lib/types'
import { formatCurrency, formatDate, getVerificationBadge, getTermTagLabel, getPropertyTypeLabel } from '@/lib/utils'
import VerificationBadge from '@/components/VerificationBadge'
import SubleasePacketButton from '@/components/SubleasePacketButton'

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session } = useSession()
  const [listing, setListing] = useState<ListingWithUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [messageSent, setMessageSent] = useState(false)
  
  useEffect(() => {
    fetchListing()
  }, [id])
  
  const fetchListing = async () => {
    try {
      const response = await fetch(`/api/listings/${id}`)
      const data = await response.json()
      
      if (data.success) {
        setListing(data.listing)
      } else {
        setError(data.error || 'Listing not found')
      }
    } catch {
      setError('Failed to load listing')
    } finally {
      setLoading(false)
    }
  }
  
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !listing) return
    
    setSending(true)
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          receiverId: listing.userId,
          content: message.trim()
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage('')
        setMessageSent(true)
      } else {
        alert(data.error || 'Failed to send message')
      }
    } catch {
      alert('Something went wrong')
    } finally {
      setSending(false)
    }
  }
  
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-1/3 mb-4" />
          <div className="h-64 bg-neutral-200 rounded-xl mb-6" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-6 bg-neutral-200 rounded w-3/4" />
              <div className="h-4 bg-neutral-200 rounded w-1/2" />
              <div className="h-32 bg-neutral-200 rounded" />
            </div>
            <div className="space-y-4">
              <div className="h-48 bg-neutral-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (error || !listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <svg className="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Listing Not Found</h1>
        <p className="text-neutral-500 mb-6">{error}</p>
        <Link href="/listings" className="btn btn-primary">
          Browse All Listings
        </Link>
      </div>
    )
  }
  
  const termTags = listing.termTags.split(',').filter(Boolean)
  const images = listing.images ? JSON.parse(listing.images) : []
  const amenities = listing.amenities ? JSON.parse(listing.amenities) : []
  const isOwner = session?.user?.id === listing.userId
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm">
        <Link href="/listings" className="text-neutral-500 hover:text-neutral-700 transition-colors">
          Listings
        </Link>
        <span className="text-neutral-300">/</span>
        <span className="text-neutral-900 font-medium">{listing.title}</span>
      </nav>
      
      {/* Image Gallery */}
      <div className="mb-8 rounded-2xl overflow-hidden bg-neutral-100 h-64 md:h-96">
        {images.length > 0 ? (
          <img 
            src={images[0]} 
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-24 h-24 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 22V12h6v10" />
            </svg>
          </div>
        )}
      </div>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <VerificationBadge
                userType={listing.user.userType as UserType}
                emailVerified={listing.user.emailVerified}
                phoneVerified={listing.user.phoneVerified}
                isUmichEmail={listing.user.isUmichEmail}
              />
              <span className="badge badge-blue">
                {listing.type === 'SUBLEASE' ? 'Sublease' : 'Rental'}
              </span>
              {listing.user.successfulTransitions > 0 && (
                <span className="text-sm text-emerald-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {listing.user.successfulTransitions} successful transition{listing.user.successfulTransitions !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">{listing.title}</h1>
            
            <p className="text-lg text-neutral-500 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {listing.address}, {listing.city}, {listing.state} {listing.zipCode}
            </p>
            {listing.neighborhood && (
              <p className="text-sm text-neutral-400 mt-1">📍 {listing.neighborhood}</p>
            )}
          </div>
          
          {/* Key Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-4">
              <p className="text-sm text-neutral-500">Bedrooms</p>
              <p className="text-xl font-bold text-neutral-900">{listing.bedrooms}</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-neutral-500">Bathrooms</p>
              <p className="text-xl font-bold text-neutral-900">{listing.bathrooms}</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-neutral-500">Property Type</p>
              <p className="text-xl font-bold text-neutral-900">{getPropertyTypeLabel(listing.propertyType)}</p>
            </div>
            {listing.sqft && (
              <div className="card p-4">
                <p className="text-sm text-neutral-500">Square Feet</p>
                <p className="text-xl font-bold text-neutral-900">{listing.sqft.toLocaleString()}</p>
              </div>
            )}
          </div>
          
          {/* Term Tags */}
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">Available Terms</h2>
            <div className="flex flex-wrap gap-2">
              {termTags.map(tag => (
                <span 
                  key={tag} 
                  className="px-3 py-1.5 text-sm font-semibold bg-[#00274C] text-white rounded-lg"
                >
                  {getTermTagLabel(tag)}
                </span>
              ))}
            </div>
          </div>
          
          {/* Dates */}
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">Dates</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-4">
                <p className="text-sm text-neutral-500">Move-in Date</p>
                <p className="font-semibold text-neutral-900">{formatDate(listing.moveInDate)}</p>
                {listing.moveInWindowStart && listing.moveInWindowEnd && (
                  <p className="text-sm text-neutral-400 mt-1">
                    Flexible: {formatDate(listing.moveInWindowStart)} - {formatDate(listing.moveInWindowEnd)}
                  </p>
                )}
              </div>
              <div className="card p-4">
                <p className="text-sm text-neutral-500">Lease End Date</p>
                <p className="font-semibold text-neutral-900">{formatDate(listing.leaseEndDate)}</p>
              </div>
            </div>
          </div>
          
          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">Description</h2>
            <p className="text-neutral-600 whitespace-pre-wrap leading-relaxed">{listing.description}</p>
          </div>
          
          {/* Amenities */}
          {amenities.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-3">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {amenities.map((amenity: string) => (
                  <span 
                    key={amenity} 
                    className="px-3 py-1.5 text-sm bg-neutral-100 text-neutral-700 rounded-lg"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Utilities */}
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">Utilities</h2>
            <p className="text-neutral-600">
              {listing.utilitiesIncluded ? '✅ Utilities included in rent' : '❌ Utilities not included'}
            </p>
            {listing.utilitiesNotes && (
              <p className="text-sm text-neutral-500 mt-2">{listing.utilitiesNotes}</p>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Card */}
          <div className="card p-6 sticky top-24">
            <div className="text-3xl font-bold text-[#00274C] mb-1">
              {formatCurrency(listing.rent)}<span className="text-lg font-normal text-neutral-500">/month</span>
            </div>
            
            {(listing.deposit || listing.subleaseFee) && (
              <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2">
                {listing.deposit && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Security Deposit</span>
                    <span className="font-semibold text-neutral-900">{formatCurrency(listing.deposit)}</span>
                  </div>
                )}
                {listing.subleaseFee && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Sublease Fee</span>
                    <span className="font-semibold text-neutral-900">{formatCurrency(listing.subleaseFee)}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Contact Form */}
            {session && !isOwner ? (
              <div className="mt-6">
                {messageSent ? (
                  <div className="alert alert-success text-center">
                    ✅ Message sent! Check your messages for a response.
                  </div>
                ) : (
                  <form onSubmit={sendMessage}>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Hi, I'm interested in this listing..."
                      rows={4}
                      className="input mb-3"
                      required
                    />
                    <button
                      type="submit"
                      disabled={sending}
                      className="btn btn-primary w-full"
                    >
                      {sending ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            ) : !session ? (
              <div className="mt-6">
                <Link href="/login" className="btn btn-primary w-full">
                  Sign in to Contact
                </Link>
                <p className="text-xs text-neutral-500 text-center mt-2">
                  You must verify your email to message posters
                </p>
              </div>
            ) : (
              <div className="mt-6">
                <Link href={`/listings/${listing.id}/edit`} className="btn btn-primary w-full">
                  Edit Listing
                </Link>
              </div>
            )}
            
            {/* Sublease Packet */}
            {listing.type === 'SUBLEASE' && session && (
              <div className="mt-4">
                <SubleasePacketButton listing={listing} />
              </div>
            )}
            
            {/* Poster Info */}
            <div className="mt-6 pt-6 border-t border-neutral-100">
              <p className="text-sm text-neutral-500 mb-2">Posted by</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFCB05] flex items-center justify-center">
                  <span className="text-[#00274C] font-bold">
                    {listing.user.name?.[0]?.toUpperCase() || listing.user.email[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">
                    {listing.user.name || listing.user.email.split('@')[0]}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Last active: {formatDate(listing.user.lastActiveAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
