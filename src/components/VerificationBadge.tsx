'use client'

import { UserType } from '@/lib/types'
import { getVerificationBadge } from '@/lib/utils'

interface VerificationBadgeProps {
  userType: UserType
  emailVerified: Date | null
  phoneVerified: Date | null
  isUmichEmail: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function VerificationBadge({ 
  userType, 
  emailVerified, 
  phoneVerified, 
  isUmichEmail,
  size = 'md'
}: VerificationBadgeProps) {
  const badge = getVerificationBadge(userType, emailVerified, phoneVerified, isUmichEmail)
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2'
  }
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }
  
  const badgeClasses = {
    VERIFIED_UM_STUDENT: 'badge badge-maize',
    VERIFIED_LANDLORD: 'badge badge-green',
    UNVERIFIED: 'badge badge-gray'
  }
  
  return (
    <span className={`${badgeClasses[badge.type]} ${sizeClasses[size]}`}>
      {badge.type !== 'UNVERIFIED' && (
        <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      {badge.label}
    </span>
  )
}
