import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  userType: z.enum(['STUDENT', 'LANDLORD']),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const listingSchema = z.object({
  type: z.enum(['SUBLEASE', 'RENTAL']),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title too long'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description too long'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().default('Ann Arbor'),
  state: z.string().default('MI'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  neighborhood: z.string().optional(),
  propertyType: z.enum(['APARTMENT', 'HOUSE', 'ROOM', 'STUDIO', 'TOWNHOUSE']),
  bedrooms: z.number().min(0).max(10),
  bathrooms: z.number().min(0.5).max(10),
  sqft: z.number().min(100).max(10000).optional(),
  rent: z.number().min(1, 'Rent is required').max(10000),
  deposit: z.number().min(0).max(10000).optional(),
  subleaseFee: z.number().min(0).max(1000).optional(),
  utilitiesIncluded: z.boolean(),
  utilitiesNotes: z.string().max(500).optional(),
  termTags: z.array(z.enum(['FALL', 'WINTER', 'SPRING', 'SUMMER', 'FULL_YEAR'])).min(1, 'Select at least one term'),
  moveInDate: z.string().min(1, 'Move-in date is required'),
  moveInWindowStart: z.string().optional(),
  moveInWindowEnd: z.string().optional(),
  leaseEndDate: z.string().min(1, 'Lease end date is required'),
  amenities: z.array(z.string()),
  images: z.array(z.string()),
})

export const feedbackSchema = z.object({
  listingId: z.string().min(1),
  receiverId: z.string().min(1),
  overallRating: z.number().min(1).max(5),
  wouldRentAgain: z.boolean(),
  notes: z.string().max(1000).optional(),
})

export const messageSchema = z.object({
  listingId: z.string().min(1),
  receiverId: z.string().min(1),
  content: z.string().min(1, 'Message cannot be empty').max(2000),
})

export const phoneVerificationSchema = z.object({
  phone: z.string().regex(/^\+?1?\d{10,14}$/, 'Invalid phone number'),
})

export const verifyCodeSchema = z.object({
  code: z.string().length(6, 'Code must be 6 characters'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ListingInput = z.infer<typeof listingSchema>
export type FeedbackInput = z.infer<typeof feedbackSchema>
export type MessageInput = z.infer<typeof messageSchema>

