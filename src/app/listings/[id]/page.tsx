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
  const [imgIdx, setImgIdx] = useState(0)

  useEffect(() => { fetchListing() }, [id])

  const fetchListing = async () => {
    try {
      const res = await fetch(`/api/listings/${id}`)
      const data = await res.json()
      if (data.success) setListing(data.listing)
      else setError(data.error || 'Listing not found')
    } catch { setError('Failed to load listing') }
    finally { setLoading(false) }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !listing) return
    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id, receiverId: listing.userId, content: message.trim() }),
      })
      const data = await res.json()
      if (data.success) { setMessage(''); setMessageSent(true) }
      else alert(data.error || 'Failed to send message')
    } catch { alert('Something went wrong') }
    finally { setSending(false) }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-4 w-24 bg-slate-100 rounded mb-6" />
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-100 rounded w-1/3" />
            <div className="aspect-[16/9] bg-slate-100 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
            <span className="text-slate-300 text-xl">?</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Listing not found</h1>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <Link href="/listings" className="btn btn-secondary">Browse all listings</Link>
        </div>
      </div>
    )
  }

  let images: string[] = []
  try { images = listing.images ? JSON.parse(listing.images) : [] } catch { images = [] }
  const termTags = listing.termTags ? listing.termTags.split(',').filter(Boolean) : []
  let amenities: string[] = []
  try { amenities = listing.amenities ? JSON.parse(listing.amenities) : [] } catch { amenities = [] }
  const isOwner = session?.user?.id === listing.userId
  const isScraped = listing.id.startsWith('scraped_') || listing.userId === null
  const badge = !isScraped ? getVerificationBadge(listing.user.userType as UserType, listing.user.emailVerified, listing.user.phoneVerified, listing.user.isUmichEmail) : { type: 'VERIFIED_LANDLORD', label: 'VERIFIED', color: 'green' }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-gradient-to-r from-[#00274C] to-[#003D6E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm">
          <Link href="/listings" className="text-white/70 hover:text-white transition-colors">Listings</Link>
          <svg className="w-3.5 h-3.5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-white truncate max-w-xs">{listing.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            {images.length > 0 ? (
              <div className="space-y-3">
                <div className="relative aspect-[16/9] bg-slate-100 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-[#FFCB05] hover:shadow-lg transition-all">
                  <img src={images[imgIdx]} alt={listing.title} className="w-full h-full object-cover" />
                  {images.length > 1 && (
                    <>
                      <button onClick={() => setImgIdx(i => i === 0 ? images.length - 1 : i - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-white/80 backdrop-blur-md flex items-center justify-center hover:bg-white transition-colors shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      <button onClick={() => setImgIdx(i => i === images.length - 1 ? 0 : i + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-white/80 backdrop-blur-md flex items-center justify-center hover:bg-white transition-colors shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md text-white text-xs font-medium">
                        {imgIdx + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((img: string, idx: number) => (
                      <button key={idx} onClick={() => setImgIdx(idx)} className={`flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${idx === imgIdx ? 'border-[#FFCB05] shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-[16/9] bg-white rounded-xl border-2 border-gray-200 flex items-center justify-center">
                <span className="text-slate-300 text-sm">No images available</span>
              </div>
            )}

            {/* Title & badges */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="badge badge-gray">{badge?.label || 'LISTING'}</span>
                <span className={`badge ${listing.type === 'SUBLEASE' ? 'badge-warning' : 'badge-blue'}`}>
                  {listing.type === 'SUBLEASE' ? 'Sublease' : 'Rental'}
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">{listing.title}</h1>
              {(listing.address || listing.city) && (
                <p className="text-sm text-slate-500 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {[listing.address, listing.city, listing.state, listing.zipCode].filter(Boolean).join(', ')}
                </p>
              )}
              {listing.neighborhood && <p className="text-xs text-slate-400 mt-1">{listing.neighborhood}</p>}
            </div>

            {/* Key facts */}
            {(listing.bedrooms != null || listing.bathrooms != null || listing.propertyType || listing.sqft) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {listing.bedrooms != null && (
                  <div className="p-4 rounded-xl bg-white border-2 border-gray-200 hover:border-[#FFCB05] hover:shadow-lg transition-all">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Bedrooms</p>
                    <p className="text-xl font-bold text-[#00274C]">{listing.bedrooms}</p>
                  </div>
                )}
                {listing.bathrooms != null && (
                  <div className="p-4 rounded-xl bg-white border-2 border-gray-200 hover:border-[#FFCB05] hover:shadow-lg transition-all">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Bathrooms</p>
                    <p className="text-xl font-bold text-[#00274C]">{listing.bathrooms}</p>
                  </div>
                )}
                {listing.propertyType && (
                  <div className="p-4 rounded-xl bg-white border-2 border-gray-200 hover:border-[#FFCB05] hover:shadow-lg transition-all">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Type</p>
                    <p className="text-xl font-bold text-[#00274C]">{getPropertyTypeLabel(listing.propertyType)}</p>
                  </div>
                )}
                {listing.sqft && (
                  <div className="p-4 rounded-xl bg-white border-2 border-gray-200 hover:border-[#FFCB05] hover:shadow-lg transition-all">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Sq Ft</p>
                    <p className="text-xl font-bold text-[#00274C]">{listing.sqft.toLocaleString()}</p>
                  </div>
                )}
              </div>
            )}

            {/* Terms */}
            {termTags.length > 0 && (
              <div className="p-6 rounded-xl bg-white border-2 border-gray-200 hover:border-[#FFCB05] hover:shadow-lg transition-all">
                <h2 className="text-lg font-semibold mb-3 text-[#00274C]">Available terms</h2>
                <div className="flex flex-wrap gap-2">
                  {termTags.map(tag => (
                    <span key={tag} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FFCB05]/15 text-[#00274C]">
                      {getTermTagLabel(tag)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Dates */}
            {(listing.moveInDate || listing.leaseEndDate) && (
              <div className="p-6 rounded-xl bg-white border-2 border-gray-200 hover:border-[#FFCB05] hover:shadow-lg transition-all">
                <h2 className="text-lg font-semibold mb-3 text-[#00274C]">Availability</h2>
                <div className="grid grid-cols-2 gap-3">
                  {listing.moveInDate && (
                    <div className="p-4 rounded-xl bg-gray-50 border-2 border-gray-200">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Available from</p>
                      <p className="font-medium">{formatDate(listing.moveInDate)}</p>
                      {listing.moveInWindowStart && listing.moveInWindowEnd && (
                        <p className="text-xs text-slate-400 mt-1">Flexible: {formatDate(listing.moveInWindowStart)} – {formatDate(listing.moveInWindowEnd)}</p>
                      )}
                    </div>
                  )}
                  {listing.leaseEndDate && (
                    <div className="p-4 rounded-xl bg-gray-50 border-2 border-gray-200">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Lease end</p>
                      <p className="font-medium">{formatDate(listing.leaseEndDate)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {listing.description && (
              <div className="p-6 rounded-xl bg-white border-2 border-gray-200 hover:border-[#FFCB05] hover:shadow-lg transition-all">
                <h2 className="text-lg font-semibold mb-3 text-[#00274C]">Description</h2>
                <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
              </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="p-6 rounded-xl bg-white border-2 border-gray-200 hover:border-[#FFCB05] hover:shadow-lg transition-all">
                <h2 className="text-lg font-semibold mb-3 text-[#00274C]">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((a: string) => (
                    <span key={a} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-50 text-slate-600 border border-slate-100">{a}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Utilities */}
            {listing.utilitiesIncluded != null && (
              <div className="p-6 rounded-xl bg-white border-2 border-gray-200 hover:border-[#FFCB05] hover:shadow-lg transition-all">
                <h2 className="text-lg font-semibold mb-3 text-[#00274C]">Utilities</h2>
                <p className="text-sm text-slate-500">
                  {listing.utilitiesIncluded ? '✓ Included in rent' : '✗ Not included'}
                </p>
                {listing.utilitiesNotes && <p className="text-xs text-slate-400 mt-1">{listing.utilitiesNotes}</p>}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="sticky top-[76px] space-y-5">
              {/* Price card */}
              <div className="p-6 rounded-xl bg-white border-2 border-gray-200 hover:border-[#FFCB05] hover:shadow-lg transition-all">
                <div className="text-3xl font-bold mb-1">
                  {formatCurrency(listing.rent)}<span className="text-sm font-normal text-slate-400">/month</span>
                </div>

                {(listing.deposit || listing.subleaseFee) && (
                  <div className="mt-4 pt-4 border-t border-slate-50 space-y-2">
                    {listing.deposit && (
                      <div className="flex justify-between text-xs"><span className="text-slate-400">Security deposit</span><span className="font-medium">{formatCurrency(listing.deposit)}</span></div>
                    )}
                    {listing.subleaseFee && (
                      <div className="flex justify-between text-xs"><span className="text-slate-400">Sublease fee</span><span className="font-medium">{formatCurrency(listing.subleaseFee)}</span></div>
                    )}
                  </div>
                )}

                {/* Contact */}
                <div className="mt-6">
                  {isScraped ? (
                    !session ? (
                      <div className="space-y-3">
                        <Link href="/login" className="btn btn-secondary w-full">Sign in to contact</Link>
                        <p className="text-xs text-slate-400 text-center">Free account required</p>
                      </div>
                    ) : (listing.contactPhone || listing.contactEmail || listing.contactName) ? (
                      <div className="space-y-2.5">
                        {listing.contactName && (
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#00274C] flex items-center justify-center text-xs font-semibold text-[#FFCB05]">{listing.contactName[0]?.toUpperCase()}</div>
                            <span className="text-sm font-medium">{listing.contactName}</span>
                          </div>
                        )}
                        {listing.contactPhone && (
                          <a href={`tel:${listing.contactPhone}`} className="flex items-center gap-2.5 p-3 rounded-xl border-2 border-gray-200 hover:border-[#FFCB05] transition-colors text-sm">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            {listing.contactPhone}
                          </a>
                        )}
                        {listing.contactEmail && (
                          <a href={`mailto:${listing.contactEmail}`} className="flex items-center gap-2.5 p-3 rounded-xl border-2 border-gray-200 hover:border-[#FFCB05] transition-colors text-sm break-all">
                            <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            {listing.contactEmail}
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 text-center py-4">Contact info not available</p>
                    )
                  ) : session && !isOwner ? (
                    messageSent ? (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-center text-sm text-emerald-700 font-medium">
                        Message sent! Check your inbox for a reply.
                      </div>
                    ) : (
                      <form onSubmit={sendMessage}>
                        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Hi, I'm interested in this listing..." rows={3} className="input mb-3" required />
                        <button type="submit" disabled={sending} className="btn btn-secondary w-full">
                          {sending ? 'Sending...' : 'Send message'}
                        </button>
                      </form>
                    )
                  ) : !session ? (
                    <div className="space-y-3">
                      <Link href="/login" className="btn btn-secondary w-full">Sign in to contact</Link>
                      <p className="text-xs text-slate-400 text-center">Verify your email to message</p>
                    </div>
                  ) : (
                    <Link href={`/listings/${listing.id}/edit`} className="btn btn-secondary w-full">Edit listing</Link>
                  )}
                </div>

                {listing.type === 'SUBLEASE' && session && !isScraped && (
                  <div className="mt-3"><SubleasePacketButton listing={listing} /></div>
                )}
              </div>

              {/* Poster */}
              {!isScraped && (
                <div className="p-5 rounded-xl bg-white border-2 border-gray-200 hover:border-[#FFCB05] hover:shadow-lg transition-all">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Posted by</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#00274C] flex items-center justify-center text-sm font-semibold text-[#FFCB05]">
                      {listing.user.name?.[0]?.toUpperCase() || listing.user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{listing.user.name || listing.user.email.split('@')[0]}</p>
                      <p className="text-xs text-slate-400">Active {formatDate(listing.user.lastActiveAt)}</p>
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
