'use client'

import Link from 'next/link'
import { ListingWithUser, UserType } from '@/lib/types'
import { formatCurrency, formatDate, getVerificationBadge, getTermTagLabel, getPropertyTypeLabel } from '@/lib/utils'

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
  isExpired = false
}: ListingCardProps) {
  const badge = getVerificationBadge(
    listing.user.userType as UserType,
    listing.user.emailVerified,
    listing.user.phoneVerified,
    listing.user.isUmichEmail
  )
  
  const termTags = listing.termTags.split(',').filter(Boolean)
  const images = listing.images ? JSON.parse(listing.images) : []
  
  // Determine verification status
  const isVerifiedStudent = listing.user.userType === 'STUDENT' && listing.user.isUmichEmail && listing.user.emailVerified
  const isVerifiedLandlord = listing.user.userType === 'LANDLORD' && listing.user.emailVerified && listing.user.phoneVerified
  
  return (
    <div className="card overflow-hidden group hover:shadow-lg transition-all duration-300">
      {/* Image Section */}
      <div className="relative aspect-[4/3] bg-neutral-100">
        {images.length > 0 ? (
          <img 
            src={images[0]} 
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
            <svg className="w-12 h-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        )}
        
        {/* Top badges overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          {/* Verification Badge */}
          {(isVerifiedStudent || isVerifiedLandlord) && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
              isVerifiedStudent 
                ? 'bg-[#FFCB05] text-[#00274C]' 
                : 'bg-emerald-500 text-white'
            }`}>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {isVerifiedStudent ? 'Verified Student' : 'Verified Landlord'}
            </div>
          )}
          
          {/* Status indicator */}
          {(isStale || isExpired) && (
            <span className={`px-2.5 py-1.5 text-xs font-semibold rounded-full ${
              isExpired 
                ? 'bg-red-500 text-white' 
                : 'bg-amber-500 text-white'
            }`}>
              {isExpired ? 'Expired' : 'Needs Renewal'}
            </span>
          )}
        </div>
        
        {/* Price badge */}
        <div className="absolute bottom-3 right-3">
          <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg text-sm font-bold text-neutral-900 shadow-sm">
            {formatCurrency(listing.rent)}/mo
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Term Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {termTags.slice(0, 3).map(tag => (
            <span 
              key={tag} 
              className="px-2 py-0.5 text-xs font-medium rounded bg-[#00274C]/10 text-[#00274C]"
            >
              {getTermTagLabel(tag)}
            </span>
          ))}
          {termTags.length > 3 && (
            <span className="px-2 py-0.5 text-xs text-neutral-400">
              +{termTags.length - 3}
            </span>
          )}
        </div>
        
        <Link href={`/listings/${listing.id}`}>
          <h3 className="font-semibold text-neutral-900 hover:text-[#00274C] transition-colors line-clamp-2 mb-2">
            {listing.title}
          </h3>
        </Link>
        
        <p className="text-sm text-neutral-500 flex items-center gap-1 mb-2">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{listing.neighborhood || listing.city}, {listing.state}</span>
        </p>
        
        {/* Property details */}
        <div className="flex items-center gap-3 text-sm text-neutral-600">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {listing.bedrooms} bed
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {listing.bathrooms} bath
          </span>
          <span className="px-2 py-0.5 text-xs font-medium rounded bg-neutral-100 text-neutral-600">
            {listing.type === 'SUBLEASE' ? 'Sublease' : 'Rental'}
          </span>
        </div>
        
        {/* Dates */}
        <p className="text-xs text-neutral-400 mt-3 pt-3 border-t border-neutral-100">
          Available: {formatDate(listing.moveInDate)} – {formatDate(listing.leaseEndDate)}
        </p>
        
        {/* Actions for dashboard */}
        {showActions && (
          <div className="mt-4 pt-3 border-t border-neutral-200 flex gap-2">
            {(isStale || isExpired) && onRenew && (
              <button 
                onClick={() => onRenew(listing.id)}
                className="flex-1 py-2 text-xs font-semibold bg-[#00274C] text-white rounded-lg hover:bg-[#1E3A5F] transition-colors"
              >
                Renew
              </button>
            )}
            {!isExpired && listing.status === 'ACTIVE' && onComplete && (
              <button 
                onClick={() => onComplete(listing.id)}
                className="flex-1 py-2 text-xs font-semibold border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Complete
              </button>
            )}
            <Link 
              href={`/listings/${listing.id}/edit`}
              className="flex-1 py-2 text-xs font-semibold border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-center"
            >
              Edit
            </Link>
            {onDelete && (
              <button 
                onClick={() => onDelete(listing.id)}
                className="flex-1 py-2 text-xs font-semibold border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
