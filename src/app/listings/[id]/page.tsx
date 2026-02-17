'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ListingWithUser, UserType } from '@/lib/types'
import { formatCurrency, formatDate, getVerificationBadge, getTermTagLabel, getPropertyTypeLabel } from '@/lib/utils'
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
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
      <div className="min-h-screen bg-white">
        <div className="border-b border-neutral-200">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="h-4 bg-neutral-100 w-24" />
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-100 w-1/3 mb-4" />
            <div className="h-64 bg-neutral-100 mb-6" />
          </div>
        </div>
      </div>
    )
  }
  
  if (error || !listing) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-neutral-200">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <Link href="/listings" className="text-sm text-neutral-500 hover:text-neutral-900">
              ← Back to Listings
            </Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 border border-neutral-300 flex items-center justify-center mx-auto mb-6">
            <span className="text-neutral-400 text-2xl">?</span>
          </div>
          <h1 className="text-2xl text-neutral-900 mb-2">Listing Not Found</h1>
          <p className="text-neutral-500 text-sm mb-6">{error}</p>
          <Link href="/listings" className="inline-block px-6 py-3 bg-neutral-900 text-white text-xs tracking-wider">
            BROWSE ALL LISTINGS
          </Link>
        </div>
      </div>
    )
  }
  
  const termTags = listing.termTags ? listing.termTags.split(',').filter(Boolean) : []
  const images = listing.images ? JSON.parse(listing.images) : []
  const amenities = listing.amenities ? JSON.parse(listing.amenities) : []
  const isOwner = session?.user?.id === listing.userId
  const isScraped = listing.id.startsWith('scraped_') || listing.userId === null
  const badge = !isScraped ? getVerificationBadge(
    listing.user.userType as UserType,
    listing.user.emailVerified,
    listing.user.phoneVerified,
    listing.user.isUmichEmail
  ) : { type: 'VERIFIED_LANDLORD', label: 'VERIFIED', color: 'green' }
  
  return (
    <div className="min-h-screen bg-white">
      {/* Back link */}
      <div className="border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/listings" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
            ← Back to Listings
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            {images.length > 0 ? (
              <div className="space-y-3">
                <div className="aspect-[16/9] bg-neutral-100 border border-neutral-200 overflow-hidden relative">
                  <img 
                    src={images[currentImageIndex]} 
                    alt={`${listing.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Image navigation arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 border border-neutral-300 flex items-center justify-center hover:bg-white transition-colors"
                        aria-label="Previous image"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 border border-neutral-300 flex items-center justify-center hover:bg-white transition-colors"
                        aria-label="Next image"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      {/* Image counter */}
                      <div className="absolute bottom-3 right-3 px-3 py-1 bg-white/90 border border-neutral-300 text-xs">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>
                {/* Thumbnail strip for multiple images */}
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((img: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`flex-shrink-0 w-20 h-14 border overflow-hidden ${
                          idx === currentImageIndex ? 'border-neutral-900 ring-1 ring-neutral-900' : 'border-neutral-200'
                        }`}
                      >
                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-[16/9] bg-neutral-100 border border-neutral-200 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-neutral-400 text-xs tracking-wider">[NO IMAGES AVAILABLE]</span>
                </div>
              </div>
            )}
            
            {/* Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2 py-1 text-xs border border-neutral-300">
                  {badge?.label || 'LISTING'}
                </span>
                <span className="px-2 py-1 text-xs border border-neutral-900">
                  {listing.type === 'SUBLEASE' ? 'SUBLEASE' : 'RENTAL'}
                </span>
              </div>
              
              <h1 className="text-3xl text-neutral-900 mb-2">{listing.title}</h1>
              
              {/* Only show address if we have data */}
              {(listing.address || listing.city || listing.state) && (
                <p className="text-sm text-neutral-500">
                  {[listing.address, listing.city, listing.state, listing.zipCode].filter(Boolean).join(', ')}
                </p>
              )}
              {listing.neighborhood && (
                <p className="text-xs text-neutral-400 mt-1">{listing.neighborhood}</p>
              )}
            </div>
            
            {/* Key Details - only show if we have data */}
            {(listing.bedrooms != null || listing.bathrooms != null || listing.propertyType || listing.sqft) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {listing.bedrooms != null && (
                  <div className="border border-neutral-200 p-4">
                    <p className="text-xs text-neutral-500 tracking-wider mb-1">BEDROOMS</p>
                    <p className="text-xl text-neutral-900">{listing.bedrooms}</p>
                  </div>
                )}
                {listing.bathrooms != null && (
                  <div className="border border-neutral-200 p-4">
                    <p className="text-xs text-neutral-500 tracking-wider mb-1">BATHROOMS</p>
                    <p className="text-xl text-neutral-900">{listing.bathrooms}</p>
                  </div>
                )}
                {listing.propertyType && (
                  <div className="border border-neutral-200 p-4">
                    <p className="text-xs text-neutral-500 tracking-wider mb-1">TYPE</p>
                    <p className="text-xl text-neutral-900">{getPropertyTypeLabel(listing.propertyType)}</p>
                  </div>
                )}
                {listing.sqft && (
                  <div className="border border-neutral-200 p-4">
                    <p className="text-xs text-neutral-500 tracking-wider mb-1">SQ FT</p>
                    <p className="text-xl text-neutral-900">{listing.sqft.toLocaleString()}</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Terms */}
            {termTags.length > 0 && (
              <div>
                <h2 className="text-lg text-neutral-900 mb-4">Available Terms</h2>
                <div className="flex flex-wrap gap-2">
                  {termTags.map(tag => (
                    <span key={tag} className="px-3 py-2 text-xs border border-neutral-900 bg-neutral-900 text-white">
                      {getTermTagLabel(tag)}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Dates - only show if we have date data */}
            {(listing.moveInDate || listing.leaseEndDate) && (
              <div>
                <h2 className="text-lg text-neutral-900 mb-4">Availability</h2>
                <div className="grid grid-cols-2 gap-4">
                  {listing.moveInDate && (
                    <div className="border border-neutral-200 p-4">
                      <p className="text-xs text-neutral-500 tracking-wider mb-1">AVAILABLE FROM</p>
                      <p className="text-neutral-900">{formatDate(listing.moveInDate)}</p>
                      {listing.moveInWindowStart && listing.moveInWindowEnd && (
                        <p className="text-xs text-neutral-400 mt-1">
                          Flexible: {formatDate(listing.moveInWindowStart)} - {formatDate(listing.moveInWindowEnd)}
                        </p>
                      )}
                    </div>
                  )}
                  {listing.leaseEndDate && (
                    <div className="border border-neutral-200 p-4">
                      <p className="text-xs text-neutral-500 tracking-wider mb-1">LEASE END</p>
                      <p className="text-neutral-900">{formatDate(listing.leaseEndDate)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Description - only show if we have one */}
            {listing.description && (
              <div>
                <h2 className="text-lg text-neutral-900 mb-4">Description</h2>
                <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-wrap">{listing.description}</p>
              </div>
            )}
            
            {/* Amenities */}
            {amenities.length > 0 && (
              <div>
                <h2 className="text-lg text-neutral-900 mb-4">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity: string) => (
                    <span key={amenity} className="px-3 py-2 text-xs border border-neutral-300">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Utilities - only show if we have data */}
            {listing.utilitiesIncluded != null && (
              <div>
                <h2 className="text-lg text-neutral-900 mb-4">Utilities</h2>
                <p className="text-sm text-neutral-600">
                  {listing.utilitiesIncluded ? '✓ Utilities included in rent' : '✗ Utilities not included'}
                </p>
                {listing.utilitiesNotes && (
                  <p className="text-xs text-neutral-500 mt-2">{listing.utilitiesNotes}</p>
                )}
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="border border-neutral-200 p-6 sticky top-24">
              <div className="text-3xl text-neutral-900 mb-1">
                {formatCurrency(listing.rent)}<span className="text-sm text-neutral-500">/month</span>
              </div>
              
              {(listing.deposit || listing.subleaseFee) && (
                <div className="mt-4 pt-4 border-t border-neutral-200 space-y-2">
                  {listing.deposit && (
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-500">Security Deposit</span>
                      <span className="text-neutral-900">{formatCurrency(listing.deposit)}</span>
                    </div>
                  )}
                  {listing.subleaseFee && (
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-500">Sublease Fee</span>
                      <span className="text-neutral-900">{formatCurrency(listing.subleaseFee)}</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Contact Section */}
              {isScraped ? (
                <div className="mt-6">
                  <p className="text-xs text-neutral-500 tracking-wider mb-3">CONTACT LANDLORD</p>
                  
                  {/* Require sign in to see contact info */}
                  {!session ? (
                    <div className="space-y-3">
                      <p className="text-sm text-neutral-500 text-center py-3">
                        Sign in to view contact information
                      </p>
                      <Link 
                        href="/login" 
                        className="block w-full py-3 bg-neutral-900 text-white text-xs tracking-wider text-center hover:bg-neutral-800 transition-colors"
                      >
                        SIGN IN TO CONTACT
                      </Link>
                      <p className="text-xs text-neutral-400 text-center">
                        Create a free account to contact landlords
                      </p>
                    </div>
                  ) : (listing.contactPhone || listing.contactEmail || listing.contactName) ? (
                    <div className="space-y-3">
                      {listing.contactName && (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 border border-neutral-300 flex items-center justify-center flex-shrink-0">
                            <span className="text-neutral-600 text-xs">
                              {listing.contactName[0]?.toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm text-neutral-900">{listing.contactName}</span>
                        </div>
                      )}
                      
                      {listing.contactPhone && (
                        <a 
                          href={`tel:${listing.contactPhone}`}
                          className="flex items-center gap-3 p-3 border border-neutral-200 hover:border-neutral-900 transition-colors"
                        >
                          <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-sm">{listing.contactPhone}</span>
                        </a>
                      )}
                      
                      {listing.contactEmail && (
                        <a 
                          href={`mailto:${listing.contactEmail}`}
                          className="flex items-center gap-3 p-3 border border-neutral-200 hover:border-neutral-900 transition-colors"
                        >
                          <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm break-all">{listing.contactEmail}</span>
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-500 text-center py-4 border border-neutral-200">
                      Contact information not available for this listing
                    </p>
                  )}
                </div>
              ) : session && !isOwner ? (
                <div className="mt-6">
                  {messageSent ? (
                    <div className="p-4 border border-neutral-900 text-center text-xs">
                      ✓ Message sent! Check your messages for a response.
                    </div>
                  ) : (
                    <form onSubmit={sendMessage}>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Hi, I'm interested in this listing..."
                        rows={4}
                        className="w-full px-4 py-3 text-sm border border-neutral-300 focus:outline-none focus:border-neutral-900 resize-none mb-3"
                        required
                      />
                      <button
                        type="submit"
                        disabled={sending}
                        className="w-full py-3 bg-neutral-900 text-white text-xs tracking-wider hover:bg-neutral-800 transition-colors disabled:opacity-50"
                      >
                        {sending ? 'SENDING...' : 'SEND MESSAGE'}
                      </button>
                    </form>
                  )}
                </div>
              ) : !session ? (
                <div className="mt-6">
                  <Link href="/login" className="block w-full py-3 bg-neutral-900 text-white text-xs tracking-wider text-center hover:bg-neutral-800 transition-colors">
                    SIGN IN TO CONTACT
                  </Link>
                  <p className="text-xs text-neutral-500 text-center mt-2">
                    You must verify your email to message
                  </p>
                </div>
              ) : (
                <div className="mt-6">
                  <Link href={`/listings/${listing.id}/edit`} className="block w-full py-3 bg-neutral-900 text-white text-xs tracking-wider text-center hover:bg-neutral-800 transition-colors">
                    EDIT LISTING
                  </Link>
                </div>
              )}
              
              {/* Sublease Packet */}
              {listing.type === 'SUBLEASE' && session && !isScraped && (
                <div className="mt-4">
                  <SubleasePacketButton listing={listing} />
                </div>
              )}
              
              {/* Poster Info */}
              {!isScraped && (
                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <p className="text-xs text-neutral-500 tracking-wider mb-3">POSTED BY</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border border-neutral-300 flex items-center justify-center">
                      <span className="text-neutral-600 text-sm">
                        {listing.user.name?.[0]?.toUpperCase() || listing.user.email[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-neutral-900 text-sm">
                        {listing.user.name || listing.user.email.split('@')[0]}
                      </p>
                      <p className="text-xs text-neutral-500">
                        Active: {formatDate(listing.user.lastActiveAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
