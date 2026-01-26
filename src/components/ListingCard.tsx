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
    <div className="card overflow-hidden group">
      {/* Image Section */}
      <div className="relative h-44 bg-neutral-100">
        {images.length > 0 ? (
          <img 
            src={images[0]} 
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
            <svg className="w-12 h-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 22V12h6v10" />
            </svg>
          </div>
        )}
        
        {/* Top badges row */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          {/* Verification Badge */}
          <span className={`badge ${
            badge.type === 'VERIFIED_UM_STUDENT' 
              ? 'badge-maize' 
              : badge.type === 'VERIFIED_LANDLORD' 
                ? 'badge-green' 
                : 'badge-gray'
          }`}>
            {badge.type !== 'UNVERIFIED' && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {badge.type === 'VERIFIED_UM_STUDENT' ? 'UM Student' : badge.type === 'VERIFIED_LANDLORD' ? 'Landlord' : 'Unverified'}
          </span>
          
          {/* Listing Type */}
          <span className="badge badge-blue">
            {listing.type === 'SUBLEASE' ? 'Sublease' : 'Rental'}
          </span>
        </div>
        
        {/* Bottom row */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          {/* Status indicator */}
          {(isStale || isExpired) && (
            <span className={`badge ${isExpired ? 'badge-red' : 'badge-orange'}`}>
              {isExpired ? 'Expired' : 'Needs Renewal'}
            </span>
          )}
          {!isStale && !isExpired && <span />}
          
          {/* Price */}
          <span className="px-2.5 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg text-base font-bold text-neutral-900 shadow-sm">
            {formatCurrency(listing.rent)}<span className="text-xs font-normal text-neutral-500">/mo</span>
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <Link href={`/listings/${listing.id}`}>
          <h3 className="font-semibold text-neutral-900 hover:text-[#00274C] transition-colors truncate">
            {listing.title}
          </h3>
        </Link>
        
        <p className="mt-1.5 text-sm text-neutral-500 truncate flex items-center gap-1">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {listing.address}, {listing.city}
        </p>
        
        {/* Property Details */}
        <div className="mt-3 flex items-center gap-3 text-sm text-neutral-600">
          <span className="flex items-center gap-1">
            <span className="font-medium">{listing.bedrooms}</span> bed
          </span>
          <span className="text-neutral-300">•</span>
          <span className="flex items-center gap-1">
            <span className="font-medium">{listing.bathrooms}</span> bath
          </span>
          <span className="text-neutral-300">•</span>
          <span>{getPropertyTypeLabel(listing.propertyType)}</span>
        </div>
        
        {/* Term Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {termTags.slice(0, 3).map(tag => (
            <span 
              key={tag} 
              className="px-2 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-600 rounded"
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
        
        {/* Dates */}
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>Move in: <span className="font-medium text-neutral-700">{formatDate(listing.moveInDate)}</span></span>
          <span>Until: <span className="font-medium text-neutral-700">{formatDate(listing.leaseEndDate)}</span></span>
        </div>
        
        {/* Trust Indicators */}
        {listing.user.successfulTransitions > 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {listing.user.successfulTransitions} successful transition{listing.user.successfulTransitions !== 1 ? 's' : ''}
          </div>
        )}
        
        {/* Actions for dashboard */}
        {showActions && (
          <div className="mt-4 pt-3 border-t border-neutral-100 flex gap-2">
            {(isStale || isExpired) && onRenew && (
              <button 
                onClick={() => onRenew(listing.id)}
                className="btn btn-primary flex-1 py-2 text-xs"
              >
                Renew
              </button>
            )}
            {!isExpired && listing.status === 'ACTIVE' && onComplete && (
              <button 
                onClick={() => onComplete(listing.id)}
                className="btn btn-outline flex-1 py-2 text-xs"
              >
                Complete
              </button>
            )}
            <Link 
              href={`/listings/${listing.id}/edit`}
              className="btn btn-outline flex-1 py-2 text-xs"
            >
              Edit
            </Link>
            {onDelete && (
              <button 
                onClick={() => onDelete(listing.id)}
                className="btn btn-outline flex-1 py-2 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
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
