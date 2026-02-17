import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { VerificationBadge, UserType } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isUmichEmail(email: string): boolean {
  return email.toLowerCase().endsWith('@umich.edu')
}

export function getVerificationBadge(
  userType: UserType,
  emailVerified: Date | string | null,
  phoneVerified: Date | string | null,
  isUmichEmail: boolean
): VerificationBadge {
  if (userType === 'STUDENT' && emailVerified && isUmichEmail) {
    return {
      type: 'VERIFIED_UM_STUDENT',
      label: 'Verified UM Student',
      color: 'bg-maize text-blue-900'
    }
  }
  
  if (userType === 'LANDLORD' && emailVerified && phoneVerified) {
    return {
      type: 'VERIFIED_LANDLORD',
      label: 'Verified Landlord',
      color: 'bg-green-600 text-white'
    }
  }
  
  return {
    type: 'UNVERIFIED',
    label: 'Unverified',
    color: 'bg-gray-400 text-white'
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return formatDate(date)
}

export function getTermTagLabel(tag: string): string {
  const labels: Record<string, string> = {
    FALL: 'Fall',
    WINTER: 'Winter',
    SPRING: 'Spring',
    SUMMER: 'Summer',
    FULL_YEAR: 'Full Year'
  }
  return labels[tag] || tag
}

export function getPropertyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    APARTMENT: 'Apartment',
    HOUSE: 'House',
    ROOM: 'Room',
    STUDIO: 'Studio',
    TOWNHOUSE: 'Townhouse'
  }
  return labels[type] || type
}

export function generateVerificationCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function getExpirationDate(days: number = 30): Date {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

export function isListingStale(lastActivityAt: Date): boolean {
  const daysSinceActivity = Math.floor(
    (new Date().getTime() - new Date(lastActivityAt).getTime()) / (1000 * 60 * 60 * 24)
  )
  return daysSinceActivity >= 14
}

export function isListingExpired(expiresAt: Date): boolean {
  return new Date(expiresAt) < new Date()
}

export function getAcademicWeek(date: Date): string {
  // University of Michigan academic calendar approximation
  const month = date.getMonth()
  const day = date.getDate()
  
  // Fall semester: Late August - Mid December
  if (month >= 7 && month <= 11) {
    if (month === 7 && day >= 20) return 'Fall Move-In Week'
    if (month === 11 && day >= 10) return 'Fall Finals Week'
    return 'Fall Semester'
  }
  
  // Winter semester: January - April
  if (month >= 0 && month <= 3) {
    if (month === 0 && day <= 10) return 'Winter Move-In Week'
    if (month === 3 && day >= 20) return 'Winter Finals Week'
    return 'Winter Semester'
  }
  
  // Spring/Summer: May - August
  if (month >= 4 && month <= 7) {
    if (month === 4) return 'Spring Term'
    if (month === 5 || month === 6) return 'Summer Term'
    return 'Summer'
  }
  
  return 'Break'
}

