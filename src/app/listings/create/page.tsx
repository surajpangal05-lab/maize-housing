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

const AMENITIES = [
  'In-unit Laundry', 'On-site Laundry', 'Parking', 'Gym', 'Pool',
  'Air Conditioning', 'Heating', 'Dishwasher', 'Furnished', 'Unfurnished',
  'Pet Friendly', 'Balcony', 'Rooftop', 'Doorman', 'Elevator',
]

export default function CreateListingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    type: 'SUBLEASE' as ListingType,
    title: '',
    description: '',
    address: '',
    city: 'Ann Arbor',
    state: 'MI',
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
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-1/3" />
          <div className="h-64 bg-neutral-200 rounded" />
        </div>
      </div>
    )
  }
  
  if (!session) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="card p-12">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">Sign in to Post a Listing</h1>
          <p className="text-neutral-500 mb-6">You need to be signed in and verified to create a listing.</p>
          <Link href="/login" className="btn btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    )
  }
  
  const toggleTermTag = (tag: TermTag) => {
    setFormData(prev => ({
      ...prev,
      termTags: prev.termTags.includes(tag)
        ? prev.termTags.filter(t => t !== tag)
        : [...prev.termTags, tag]
    }))
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Create a Listing</h1>
        <p className="mt-2 text-neutral-500">
          Fill out the details below to post your sublease or rental.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}
        
        {/* Listing Type */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Listing Type</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({...formData, type: 'SUBLEASE'})}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                formData.type === 'SUBLEASE'
                  ? 'border-[#FFCB05] bg-[#FFCB05]/5'
                  : 'border-neutral-200 hover:border-neutral-300 bg-white'
              }`}
            >
              <span className="text-xl mb-1 block">📋</span>
              <span className="font-semibold text-neutral-900">Sublease</span>
              <p className="text-xs text-neutral-500 mt-1">
                Transfer your lease to someone else
              </p>
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, type: 'RENTAL'})}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                formData.type === 'RENTAL'
                  ? 'border-[#FFCB05] bg-[#FFCB05]/5'
                  : 'border-neutral-200 hover:border-neutral-300 bg-white'
              }`}
            >
              <span className="text-xl mb-1 block">🏠</span>
              <span className="font-semibold text-neutral-900">Rental</span>
              <p className="text-xs text-neutral-500 mt-1">
                List a property for rent
              </p>
            </button>
          </div>
        </div>
        
        {/* Basic Info */}
        <div className="card p-6 space-y-5">
          <h2 className="text-lg font-semibold text-neutral-900">Basic Information</h2>
          
          <div>
            <label className="label">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., Cozy 2BR near Central Campus"
              required
              className="input"
            />
          </div>
          
          <div>
            <label className="label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe your place, what's included, the vibe of the area..."
              required
              rows={4}
              className="input"
            />
          </div>
        </div>
        
        {/* Location */}
        <div className="card p-6 space-y-5">
          <h2 className="text-lg font-semibold text-neutral-900">Location</h2>
          
          <div>
            <label className="label">Street Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="123 Main Street"
              required
              className="input"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                required
                className="input"
              />
            </div>
            <div>
              <label className="label">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                required
                className="input"
              />
            </div>
            <div>
              <label className="label">ZIP Code</label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                placeholder="48104"
                required
                pattern="\d{5}(-\d{4})?"
                className="input"
              />
            </div>
          </div>
          
          <div>
            <label className="label">Neighborhood <span className="text-neutral-400 font-normal">(optional)</span></label>
            <input
              type="text"
              value={formData.neighborhood}
              onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
              placeholder="e.g., Central Campus, Kerrytown, Burns Park"
              className="input"
            />
          </div>
        </div>
        
        {/* Property Details */}
        <div className="card p-6 space-y-5">
          <h2 className="text-lg font-semibold text-neutral-900">Property Details</h2>
          
          <div>
            <label className="label">Property Type</label>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData({...formData, propertyType: value})}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    formData.propertyType === value
                      ? 'bg-[#00274C] text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Bedrooms</label>
              <select
                value={formData.bedrooms}
                onChange={(e) => setFormData({...formData, bedrooms: parseInt(e.target.value)})}
                className="input"
              >
                {[0, 1, 2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>{n === 0 ? 'Studio' : n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Bathrooms</label>
              <select
                value={formData.bathrooms}
                onChange={(e) => setFormData({...formData, bathrooms: parseFloat(e.target.value)})}
                className="input"
              >
                {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Sq Ft <span className="text-neutral-400 font-normal">(optional)</span></label>
              <input
                type="number"
                value={formData.sqft}
                onChange={(e) => setFormData({...formData, sqft: e.target.value})}
                placeholder="800"
                className="input"
              />
            </div>
          </div>
        </div>
        
        {/* Pricing */}
        <div className="card p-6 space-y-5">
          <h2 className="text-lg font-semibold text-neutral-900">Pricing</h2>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Monthly Rent</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">$</span>
                <input
                  type="number"
                  value={formData.rent}
                  onChange={(e) => setFormData({...formData, rent: e.target.value})}
                  placeholder="1200"
                  required
                  min="1"
                  className="input pl-7"
                />
              </div>
            </div>
            <div>
              <label className="label">Deposit <span className="text-neutral-400 font-normal">(optional)</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">$</span>
                <input
                  type="number"
                  value={formData.deposit}
                  onChange={(e) => setFormData({...formData, deposit: e.target.value})}
                  placeholder="1200"
                  className="input pl-7"
                />
              </div>
            </div>
            {formData.type === 'SUBLEASE' && (
              <div>
                <label className="label">Sublease Fee <span className="text-neutral-400 font-normal">(optional)</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">$</span>
                  <input
                    type="number"
                    value={formData.subleaseFee}
                    onChange={(e) => setFormData({...formData, subleaseFee: e.target.value})}
                    placeholder="0"
                    className="input pl-7"
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.utilitiesIncluded}
                onChange={(e) => setFormData({...formData, utilitiesIncluded: e.target.checked})}
              />
              <span className="text-sm font-medium text-neutral-700">Utilities included in rent</span>
            </label>
          </div>
          
          <div>
            <label className="label">Utilities Notes <span className="text-neutral-400 font-normal">(optional)</span></label>
            <input
              type="text"
              value={formData.utilitiesNotes}
              onChange={(e) => setFormData({...formData, utilitiesNotes: e.target.value})}
              placeholder="e.g., Water included, electric ~$50/mo"
              className="input"
            />
          </div>
        </div>
        
        {/* Dates & Terms */}
        <div className="card p-6 space-y-5">
          <h2 className="text-lg font-semibold text-neutral-900">Dates & Terms</h2>
          
          <div>
            <label className="label">Available Terms <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-2">
              {TERM_TAGS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleTermTag(value)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    formData.termTags.includes(value)
                      ? 'bg-[#FFCB05] text-[#00274C]'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Move-in Date</label>
              <input
                type="date"
                value={formData.moveInDate}
                onChange={(e) => setFormData({...formData, moveInDate: e.target.value})}
                required
                className="input"
              />
            </div>
            <div>
              <label className="label">Lease End Date</label>
              <input
                type="date"
                value={formData.leaseEndDate}
                onChange={(e) => setFormData({...formData, leaseEndDate: e.target.value})}
                required
                className="input"
              />
            </div>
          </div>
          
          <div>
            <label className="label">Flexible Move-in Window <span className="text-neutral-400 font-normal">(optional)</span></label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                value={formData.moveInWindowStart}
                onChange={(e) => setFormData({...formData, moveInWindowStart: e.target.value})}
                placeholder="Earliest"
                className="input"
              />
              <input
                type="date"
                value={formData.moveInWindowEnd}
                onChange={(e) => setFormData({...formData, moveInWindowEnd: e.target.value})}
                placeholder="Latest"
                className="input"
              />
            </div>
          </div>
        </div>
        
        {/* Amenities */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map(amenity => (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  formData.amenities.includes(amenity)
                    ? 'bg-[#00274C] text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {amenity}
              </button>
            ))}
          </div>
        </div>
        
        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3.5 text-base"
          >
            {loading ? 'Creating Listing...' : 'Create Listing'}
          </button>
          <p className="mt-3 text-xs text-neutral-500 text-center">
            By posting, you agree to our terms of service. Listings expire after 30 days unless renewed.
          </p>
        </div>
      </form>
    </div>
  )
}
