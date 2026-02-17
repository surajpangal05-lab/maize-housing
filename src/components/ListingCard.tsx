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
    <div className="card group">
      {/* Image Section */}
      <div className="relative aspect-[4/3] bg-gray-100 rounded-t-2xl overflow-hidden">
        {images.length > 0 ? (
          <img 
            src={images[0]} 
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          {/* Verification Badge */}
          {(isVerifiedStudent || isVerifiedLandlord) && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${
              isVerifiedStudent 
                ? 'bg-[#FFCB05] text-[#00274C]' 
                : 'bg-[#228B22] text-white'
            }`}>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {isVerifiedStudent ? 'Verified Student' : 'Verified Landlord'}
            </div>
          )}
          
          {/* Status */}
          {(isStale || isExpired) && (
            <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
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
          <span className="px-4 py-2 bg-white/95 backdrop-blur-sm rounded-xl text-lg font-bold text-[#00274C] shadow-lg">
            {formatCurrency(listing.rent)}<span className="text-sm font-normal text-gray-500">/mo</span>
          </span>
        </div>

        {/* Image count badge */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs font-medium flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {images.length}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-5">
        {/* Term Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {termTags.slice(0, 3).map(tag => (
            <span 
              key={tag} 
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#00274C]/10 text-[#00274C]"
            >
              {getTermTagLabel(tag)}
            </span>
          ))}
          {termTags.length > 3 && (
            <span className="px-2.5 py-1 text-xs text-gray-400">
              +{termTags.length - 3}
            </span>
          )}
        </div>
        
        <Link href={`/listings/${listing.id}`}>
          <h3 className="font-semibold text-lg text-[#00274C] hover:text-[#1E3A5F] transition-colors line-clamp-2 mb-2">
            {listing.title}
          </h3>
        </Link>
        
        <p className="text-gray-500 flex items-center gap-1.5 mb-3">
          <svg className="w-4 h-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate text-sm">{listing.neighborhood || listing.city}, {listing.state}</span>
        </p>
        
        {/* Property details */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {listing.bedrooms} bed
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {listing.bathrooms} bath
          </span>
          <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
            listing.type === 'SUBLEASE' 
              ? 'bg-[#FFCB05]/20 text-[#00274C]' 
              : 'bg-[#228B22]/20 text-[#228B22]'
          }`}>
            {listing.type === 'SUBLEASE' ? 'Sublease' : 'Rental'}
          </span>
        </div>
        
        {/* Dates */}
        <p className="text-xs text-gray-400 pt-3 border-t border-gray-100 flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDate(listing.moveInDate)} – {formatDate(listing.leaseEndDate)}
        </p>
        
        {/* Actions for dashboard */}
        {showActions && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
            {(isStale || isExpired) && onRenew && (
              <button 
                onClick={() => onRenew(listing.id)}
                className="flex-1 py-2.5 text-sm font-semibold bg-[#00274C] text-white rounded-lg hover:bg-[#1E3A5F] transition-colors"
              >
                Renew
              </button>
            )}
            {!isExpired && listing.status === 'ACTIVE' && onComplete && (
              <button 
                onClick={() => onComplete(listing.id)}
                className="flex-1 py-2.5 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Complete
              </button>
            )}
            <Link 
              href={`/listings/${listing.id}/edit`}
              className="flex-1 py-2.5 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              Edit
            </Link>
            {onDelete && (
              <button 
                onClick={() => onDelete(listing.id)}
                className="flex-1 py-2.5 text-sm font-semibold border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
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
