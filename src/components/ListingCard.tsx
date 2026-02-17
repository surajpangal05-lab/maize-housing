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
  
  return (
    <div className="border border-neutral-200 bg-white">
      {/* Image Section */}
      <div className="relative aspect-[4/3] bg-neutral-100 border-b border-neutral-200">
        {images.length > 0 ? (
          <img 
            src={images[0]} 
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-neutral-400 text-xs tracking-wider">[IMAGE]</span>
          </div>
        )}
        
        {/* Status indicator */}
        {(isStale || isExpired) && (
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 text-xs border ${isExpired ? 'border-red-500 text-red-500' : 'border-amber-500 text-amber-600'}`}>
              {isExpired ? 'EXPIRED' : 'NEEDS RENEWAL'}
            </span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs border border-neutral-300">
              {listing.bedrooms} BR
            </span>
            <span className="px-2 py-1 text-xs border border-neutral-300">
              {listing.type === 'SUBLEASE' ? 'Sublease' : 'Rental'}
            </span>
          </div>
          <span className="text-sm text-neutral-900">
            {formatCurrency(listing.rent)}/mo
          </span>
        </div>
        
        <Link href={`/listings/${listing.id}`}>
          <h3 className="text-neutral-900 hover:text-neutral-600 transition-colors truncate">
            {listing.title}
          </h3>
        </Link>
        
        <p className="text-xs text-neutral-500 truncate mt-1">
          {listing.neighborhood || listing.city}, {listing.state}
        </p>
        
        {/* Dates */}
        <p className="text-xs text-neutral-400 mt-2">
          Available: {formatDate(listing.moveInDate)} – {formatDate(listing.leaseEndDate)}
        </p>
        
        {/* Term Tags */}
        <div className="mt-3 flex flex-wrap gap-1">
          {termTags.slice(0, 2).map(tag => (
            <span key={tag} className="px-2 py-1 text-xs border border-neutral-200">
              {getTermTagLabel(tag)}
            </span>
          ))}
          {termTags.length > 2 && (
            <span className="px-2 py-1 text-xs text-neutral-400">
              +{termTags.length - 2}
            </span>
          )}
        </div>
        
        {/* Actions for dashboard */}
        {showActions && (
          <div className="mt-4 pt-3 border-t border-neutral-200 flex gap-2">
            {(isStale || isExpired) && onRenew && (
              <button 
                onClick={() => onRenew(listing.id)}
                className="flex-1 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
              >
                RENEW
              </button>
            )}
            {!isExpired && listing.status === 'ACTIVE' && onComplete && (
              <button 
                onClick={() => onComplete(listing.id)}
                className="flex-1 py-2 text-xs border border-neutral-300 hover:border-neutral-900 transition-colors"
              >
                COMPLETE
              </button>
            )}
            <Link 
              href={`/listings/${listing.id}/edit`}
              className="flex-1 py-2 text-xs border border-neutral-300 hover:border-neutral-900 transition-colors text-center"
            >
              EDIT
            </Link>
            {onDelete && (
              <button 
                onClick={() => onDelete(listing.id)}
                className="flex-1 py-2 text-xs border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
              >
                DELETE
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
