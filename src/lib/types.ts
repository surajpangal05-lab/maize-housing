// Maize Housing Type Definitions

export type UserType = 'STUDENT' | 'LANDLORD'
export type ListingType = 'SUBLEASE' | 'RENTAL'
export type ListingStatus = 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED'
export type PropertyType = 'APARTMENT' | 'HOUSE' | 'ROOM' | 'STUDIO' | 'TOWNHOUSE'
export type TermTag = 'FALL' | 'WINTER' | 'SPRING' | 'SUMMER' | 'FULL_YEAR'

export interface UserProfile {
  id: string
  email: string
  emailVerified: Date | null
  name: string | null
  phone: string | null
  phoneVerified: Date | null
  image: string | null
  userType: UserType
  isUmichEmail: boolean
  createdAt: Date
  lastActiveAt: Date
  successfulTransitions: number
}

export interface VerificationBadge {
  type: 'VERIFIED_UM_STUDENT' | 'VERIFIED_LANDLORD' | 'UNVERIFIED'
  label: string
  color: string
}

export interface ListingFormData {
  type: ListingType
  title: string
  description: string
  address: string
  city: string
  state: string
  zipCode: string
  neighborhood?: string
  propertyType: PropertyType
  bedrooms: number
  bathrooms: number
  sqft?: number
  rent: number
  deposit?: number
  subleaseFee?: number
  utilitiesIncluded: boolean
  utilitiesNotes?: string
  termTags: TermTag[]
  moveInDate: string
  moveInWindowStart?: string
  moveInWindowEnd?: string
  leaseEndDate: string
  amenities: string[]
  images: string[]
}

export interface ListingWithUser {
  id: string
  userId: string
  type: ListingType
  status: ListingStatus
  title: string
  description: string
  address: string
  city: string
  state: string
  zipCode: string
  neighborhood: string | null
  propertyType: PropertyType
  bedrooms: number
  bathrooms: number
  sqft: number | null
  rent: number
  deposit: number | null
  subleaseFee: number | null
  utilitiesIncluded: boolean
  utilitiesNotes: string | null
  termTags: string
  moveInDate: Date
  moveInWindowStart: Date | null
  moveInWindowEnd: Date | null
  leaseEndDate: Date
  amenities: string | null
  images: string | null
  createdAt: Date
  updatedAt: Date
  expiresAt: Date
  lastActivityAt: Date
  renewedAt: Date | null
  viewCount: number
  user: {
    id: string
    name: string | null
    email: string
    userType: string
    isUmichEmail: boolean
    emailVerified: Date | null
    phoneVerified: Date | null
    successfulTransitions: number
    lastActiveAt: Date
  }
}

export interface SearchFilters {
  type?: ListingType
  termTags?: TermTag[]
  minRent?: number
  maxRent?: number
  bedrooms?: number
  bathrooms?: number
  propertyType?: PropertyType
  moveInStart?: string
  moveInEnd?: string
  neighborhood?: string
  verifiedOnly?: boolean
}

export interface FeedbackData {
  listingId: string
  receiverId: string
  overallRating: number
  wouldRentAgain: boolean
  notes?: string
}

// Sublease packet data for PDF generation
export interface SubleasePacketData {
  listing: ListingWithUser
  subleasorName: string
  subleasorEmail: string
  subleaseeName: string
  subleaseeEmail: string
  moveInDate: string
  moveOutDate: string
}

