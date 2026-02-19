'use client'

import Link from 'next/link'
import { ListingWithUser, UserType } from '@/lib/types'
import { formatCurrency, formatDate, getVerificationBadge, getTermTagLabel } from '@/lib/utils'

interface ListingCardProps {
  listing: ListingWithUser
  showActions?: boolean
  onRenew?: (id: string) => void
  onComplete?: (id: string) => void
  onDelete?: (id: string) => void
  isStale?: boolean
  isExpired?: boolean
}

export default function ListingCard({
  listing,
  showActions = false,
  onRenew,
  onComplete,
  onDelete,
  isStale = false,
  isExpired = false,
}: ListingCardProps) {
  const badge = getVerificationBadge(
    listing.user.userType as UserType,
    listing.user.emailVerified,
    listing.user.phoneVerified,
    listing.user.isUmichEmail
  )

  const termTags = listing.termTags.split(',').filter(Boolean)
  let images: string[] = []
  try { images = listing.images ? JSON.parse(listing.images) : [] } catch { images = [] }

  const isVerifiedStudent = listing.user.userType === 'STUDENT' && listing.user.isUmichEmail && listing.user.emailVerified
  const isVerifiedLandlord = listing.user.userType === 'LANDLORD' && listing.user.emailVerified && listing.user.phoneVerified

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-[#FFCB05] hover:shadow-xl transition-all">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {images.length > 0 ? (
          <img src={images[0]} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        )}

        {/* Type badge */}
        <span className={`absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-full text-white ${
          listing.type === 'SUBLEASE' ? 'bg-blue-600' : 'bg-green-600'
        }`}>
          {listing.type === 'SUBLEASE' ? 'Sublease' : 'Rental'}
        </span>

        {/* Verified badge */}
        {(isVerifiedStudent || isVerifiedLandlord) && (
          <span className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full bg-[#FFCB05] text-[#00274C]">
            ✓ Verified
          </span>
        )}

        {/* Status */}
        {(isStale || isExpired) && (
          <span className={`absolute bottom-3 left-3 px-3 py-1 text-xs font-semibold rounded-full text-white ${
            isExpired ? 'bg-red-500' : 'bg-amber-500'
          }`}>
            {isExpired ? 'Expired' : 'Needs Renewal'}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <Link href={`/listings/${listing.id}`}>
          <h3 className="text-xl font-semibold text-[#00274C] hover:text-[#003D6E] transition-colors line-clamp-1 mb-1">{listing.title}</h3>
        </Link>

        <div className="flex items-center gap-2 text-gray-600 mt-1 mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm truncate">{listing.neighborhood || listing.city}, {listing.state}</span>
        </div>

        {/* Details row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              {listing.bedrooms} bed
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              {listing.bathrooms} bath
            </span>
          </div>
          <div className="flex items-center gap-1 text-[#00274C] font-bold">
            <span className="text-xl">{formatCurrency(listing.rent)}</span>
            <span className="text-sm font-normal text-gray-600">/mo</span>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatDate(listing.moveInDate)}{listing.leaseEndDate ? ` - ${formatDate(listing.leaseEndDate)}` : ''}</span>
        </div>

        {/* Term tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {termTags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600">{getTermTagLabel(tag)}</span>
          ))}
        </div>

        <p className="text-xs text-gray-500">Posted by: {listing.user.name || listing.user.email.split('@')[0]}</p>

        {/* Contact button */}
        <Link href={`/listings/${listing.id}`} className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-[#00274C] hover:bg-[#003366] text-white rounded-lg font-medium transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          Contact
        </Link>

        {/* Dashboard actions */}
        {showActions && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
            {(isStale || isExpired) && onRenew && (
              <button onClick={() => onRenew(listing.id)} className="flex-1 py-2 text-sm font-semibold bg-[#00274C] text-white rounded-lg hover:bg-[#003366] transition-colors">Renew</button>
            )}
            {!isExpired && listing.status === 'ACTIVE' && onComplete && (
              <button onClick={() => onComplete(listing.id)} className="flex-1 py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Complete</button>
            )}
            <Link href={`/listings/${listing.id}/edit`} className="flex-1 py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">Edit</Link>
            {onDelete && (
              <button onClick={() => onDelete(listing.id)} className="flex-1 py-2 text-sm font-semibold border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">Delete</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
