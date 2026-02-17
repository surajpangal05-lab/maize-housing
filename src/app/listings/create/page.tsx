'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ListingType, PropertyType, TermTag } from '@/lib/types'

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'HOUSE', label: 'House' },
  { value: 'ROOM', label: 'Room' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'TOWNHOUSE', label: 'Townhouse' },
]

const TERM_TAGS: { value: TermTag; label: string }[] = [
  { value: 'FALL', label: 'Fall' },
  { value: 'WINTER', label: 'Winter' },
  { value: 'SPRING', label: 'Spring' },
  { value: 'SUMMER', label: 'Summer' },
  { value: 'FULL_YEAR', label: 'Full Year' },
]

const AMENITIES_LEFT = ['Wi-Fi', 'Kitchen', 'Pet Friendly', 'Air Conditioning']
const AMENITIES_RIGHT = ['Laundry', 'Parking', 'Furnished', 'Heating']

const STEPS = ['Details', 'Photos', 'Pricing', 'Review']

export default function CreateListingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  
  const [formData, setFormData] = useState({
    type: 'SUBLEASE' as ListingType,
    title: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    neighborhood: '',
    propertyType: 'APARTMENT' as PropertyType,
    bedrooms: 1,
    bathrooms: 1,
    sqft: '',
    rent: '',
    deposit: '',
    subleaseFee: '',
    utilitiesIncluded: false,
    utilitiesNotes: '',
    termTags: [] as TermTag[],
    moveInDate: '',
    moveInWindowStart: '',
    moveInWindowEnd: '',
    leaseEndDate: '',
    amenities: [] as string[],
    images: [] as string[],
  })
  
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-neutral-100 w-1/3" />
            <div className="h-64 bg-neutral-100" />
          </div>
        </div>
      </div>
    )
  }
  
  if (!session) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="border border-neutral-200 p-12">
            <h1 className="text-2xl font-serif text-neutral-900 mb-4">Sign in to Post a Listing</h1>
            <p className="text-neutral-500 mb-6">You need to be signed in and verified to create a listing.</p>
            <Link href="/login" className="inline-block px-6 py-3 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (formData.termTags.length === 0) {
      setError('Please select at least one term')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          rent: parseFloat(formData.rent),
          deposit: formData.deposit ? parseFloat(formData.deposit) : undefined,
          subleaseFee: formData.subleaseFee ? parseFloat(formData.subleaseFee) : undefined,
          sqft: formData.sqft ? parseInt(formData.sqft) : undefined,
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        router.push(`/listings/${data.listing.id}`)
      } else {
        setError(data.error || 'Failed to create listing')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-white">
      {/* Back link */}
      <div className="border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-8 py-3">
          <Link href="/" className="text-xs text-neutral-500 hover:text-neutral-900">
            ← Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-serif text-neutral-900 mb-2">Post a Sublease</h1>
          <p className="text-neutral-500">Fill out the form below to list your apartment</p>
        </div>

        {/* Steps */}
        <div className="flex mb-8">
          {STEPS.map((step, idx) => (
            <button
              key={step}
              onClick={() => setCurrentStep(idx)}
              className={`flex-1 py-3 border border-neutral-900 text-center transition-colors ${
                idx > 0 ? 'border-l-0' : ''
              } ${
                idx === currentStep
                  ? 'bg-neutral-900 text-white'
                  : 'hover:bg-neutral-100'
              }`}
            >
              <p className={`text-xs tracking-wider mb-1 ${idx === currentStep ? 'text-neutral-400' : 'text-neutral-500'}`}>STEP {idx + 1}</p>
              <p className="text-xs">{step}</p>
            </button>
          ))}
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-8 p-4 border border-red-200 bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}
          
          {/* Basic Information */}
          <div className="border border-neutral-900 p-6 mb-6">
            <h2 className="text-lg mb-6">Basic Information</h2>
            
            {/* Title */}
            <div className="mb-4">
              <label className="label">LISTING TITLE</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Spacious 1BR in Downtown"
                required
                className="w-full px-4 py-3 text-sm border border-neutral-900 focus:outline-none"
              />
            </div>
            
            {/* Bedrooms & Bathrooms */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">BEDROOMS</label>
                <select
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({...formData, bedrooms: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 text-sm border border-neutral-900 focus:outline-none bg-white"
                >
                  <option value="">Select</option>
                  {[0, 1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={n}>{n === 0 ? 'Studio' : n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">BATHROOMS</label>
                <select
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({...formData, bathrooms: parseFloat(e.target.value)})}
                  className="w-full px-4 py-3 text-sm border border-neutral-900 focus:outline-none bg-white"
                >
                  <option value="">Select</option>
                  {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Address */}
            <div className="mb-4">
              <label className="label">ADDRESS</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Street address"
                required
                className="w-full px-4 py-3 text-sm border border-neutral-900 focus:outline-none mb-2"
              />
              <div className="flex gap-0">
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder="City"
                  required
                  className="flex-1 px-4 py-3 text-sm border border-neutral-900 focus:outline-none"
                />
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  placeholder="State"
                  required
                  className="w-24 px-4 py-3 text-sm border border-neutral-900 border-l-0 focus:outline-none"
                />
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                  placeholder="ZIP"
                  required
                  className="w-24 px-4 py-3 text-sm border border-neutral-900 border-l-0 focus:outline-none"
                />
              </div>
            </div>
            
            {/* Description */}
            <div>
              <label className="label">DESCRIPTION</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe your apartment..."
                required
                rows={4}
                className="w-full px-4 py-3 text-sm border border-neutral-900 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Photos */}
          <div className="mb-6">
            <h2 className="text-lg mb-4">Photos</h2>
            
            {/* Photo Preview */}
            <div className="flex gap-0 mb-4">
              {[1, 2, 3].map((i, idx) => (
                <div key={i} className={`flex-1 aspect-[4/3] bg-neutral-100 border border-neutral-900 ${idx > 0 ? 'border-l-0' : ''} flex items-center justify-center`}>
                  <span className="text-neutral-400 text-xs tracking-wider">[PHOTO {i}]</span>
                </div>
              ))}
            </div>
            
            {/* Upload */}
            <div className="border-2 border-dashed border-neutral-900 p-6 text-center">
              <svg className="w-5 h-5 mx-auto mb-2 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <p className="text-xs tracking-wider mb-1">UPLOAD PHOTOS</p>
              <p className="text-xs text-neutral-500">PNG, JPG up to 10MB</p>
            </div>
          </div>

          {/* Dates & Pricing */}
          <div className="border border-neutral-900 p-6 mb-6">
            <h2 className="text-lg mb-6">Dates & Pricing</h2>
            
            <div className="border-b border-neutral-200 pb-6 mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="label">AVAILABLE FROM</label>
                  <input
                    type="date"
                    value={formData.moveInDate}
                    onChange={(e) => setFormData({...formData, moveInDate: e.target.value})}
                    required
                    className="w-full px-4 py-3 text-sm border border-neutral-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="label">AVAILABLE UNTIL</label>
                  <input
                    type="date"
                    value={formData.leaseEndDate}
                    onChange={(e) => setFormData({...formData, leaseEndDate: e.target.value})}
                    required
                    className="w-full px-4 py-3 text-sm border border-neutral-900 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">MONTHLY RENT</label>
                  <input
                    type="text"
                    value={formData.rent}
                    onChange={(e) => setFormData({...formData, rent: e.target.value})}
                    placeholder="$1,200"
                    required
                    className="w-full px-4 py-3 text-sm border border-neutral-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="label">SECURITY DEPOSIT</label>
                  <input
                    type="text"
                    value={formData.deposit}
                    onChange={(e) => setFormData({...formData, deposit: e.target.value})}
                    placeholder="$1,000"
                    className="w-full px-4 py-3 text-sm border border-neutral-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            
            {/* Amenities */}
            <h3 className="text-base mb-4">Amenities</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <div className="space-y-3">
                {AMENITIES_LEFT.map(amenity => (
                  <label key={amenity} className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="w-4 h-4 border-neutral-900 accent-neutral-900"
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
              <div className="space-y-3">
                {AMENITIES_RIGHT.map(amenity => (
                  <label key={amenity} className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="w-4 h-4 border-neutral-900 accent-neutral-900"
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          {/* Submit Buttons */}
          <div className="flex gap-0">
            <button
              type="button"
              className="flex-1 py-3 border border-neutral-900 text-xs tracking-wider hover:bg-neutral-100 transition-colors"
            >
              SAVE DRAFT
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-neutral-900 border border-neutral-900 text-white text-xs tracking-wider hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'PUBLISHING...' : 'PUBLISH LISTING'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
