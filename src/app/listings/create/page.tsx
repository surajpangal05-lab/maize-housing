'use client'

import { useState, useRef } from 'react'
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
  { value: 'SPRING', label: 'Spring/Summer' },
  { value: 'SUMMER', label: 'Summer' },
  { value: 'FULL_YEAR', label: 'Full Year' },
]

const AMENITIES = ['Wi-Fi', 'Kitchen', 'Pet Friendly', 'Air Conditioning', 'Laundry', 'Parking', 'Furnished', 'Heating']

export default function CreateListingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
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
  
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#FFCB05] border-t-transparent rounded-full" />
      </div>
    )
  }
  
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container py-16">
          <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#00274C]/10 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#00274C] mb-2">Sign in Required</h1>
            <p className="text-gray-600 mb-6">You need to be signed in and verified to create a listing.</p>
            <Link href="/login?callbackUrl=/listings/create" className="btn btn-primary">
              Sign In to Continue
            </Link>
          </div>
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
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    
    const newFiles = Array.from(files).slice(0, 6 - imageFiles.length)
    
    newFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            setImagePreviews(prev => [...prev, e.target!.result as string])
            setImageFiles(prev => [...prev, file])
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }
  
  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
    setImageFiles(prev => prev.filter((_, i) => i !== index))
  }
  
  const getImageUrls = (): string[] => {
    return imagePreviews
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!formData.title.trim()) {
      setError('Please enter a listing title')
      return
    }
    
    if (formData.termTags.length === 0) {
      setError('Please select at least one term (Fall, Winter, etc.)')
      return
    }
    
    if (!formData.rent || parseFloat(formData.rent) <= 0) {
      setError('Please enter a valid monthly rent')
      return
    }
    
    if (!formData.moveInDate || !formData.leaseEndDate) {
      setError('Please enter move-in and lease end dates')
      return
    }
    
    setLoading(true)
    
    try {
      const imageUrls = getImageUrls()
      
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          rent: parseFloat(formData.rent),
          deposit: formData.deposit ? parseFloat(formData.deposit) : undefined,
          subleaseFee: formData.subleaseFee ? parseFloat(formData.subleaseFee) : undefined,
          sqft: formData.sqft ? parseInt(formData.sqft) : undefined,
          images: imageUrls,
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        router.push(`/listings/${data.listing.id}`)
      } else {
        setError(data.error || 'Failed to create listing')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#00274C] py-12">
        <div className="container">
          <Link href="/listings" className="text-white/60 hover:text-white text-sm mb-4 inline-block">
            ← Back to Listings
          </Link>
          <h1 className="text-white text-3xl font-bold">Post a Listing</h1>
          <p className="text-white/70 mt-2">Fill out the form below to list your place</p>
        </div>
      </div>

      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="alert alert-error">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
            
            {/* Listing Type */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#00274C] mb-4">Listing Type</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'SUBLEASE'})}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    formData.type === 'SUBLEASE'
                      ? 'border-[#FFCB05] bg-[#FFCB05]/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium text-[#00274C]">Sublease</span>
                  <p className="text-xs text-gray-500 mt-1">I'm subleasing my place</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'RENTAL'})}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    formData.type === 'RENTAL'
                      ? 'border-[#FFCB05] bg-[#FFCB05]/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium text-[#00274C]">Rental</span>
                  <p className="text-xs text-gray-500 mt-1">I'm a landlord</p>
                </button>
              </div>
            </div>

            {/* Basic Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#00274C] mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="label">Listing Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Spacious 1BR near Central Campus"
                    required
                    className="input"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Property Type</label>
                    <select
                      value={formData.propertyType}
                      onChange={(e) => setFormData({...formData, propertyType: e.target.value as PropertyType})}
                      className="input"
                    >
                      {PROPERTY_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Neighborhood</label>
                    <input
                      type="text"
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
                      placeholder="e.g., Central Campus"
                      className="input"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Bedrooms *</label>
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
                    <label className="label">Bathrooms *</label>
                    <select
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({...formData, bathrooms: parseFloat(e.target.value)})}
                      className="input"
                    >
                      {[1, 1.5, 2, 2.5, 3, 3.5, 4].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="label">Street Address *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="123 Main St"
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
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">ZIP Code *</label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                      placeholder="48104"
                      required
                      className="input"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="label">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your place - location highlights, amenities, what makes it special..."
                    required
                    rows={4}
                    className="input"
                    style={{ height: 'auto', minHeight: '100px' }}
                  />
                </div>
              </div>
            </div>

            {/* Term Selection */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#00274C] mb-2">Sublease Term *</h2>
              <p className="text-sm text-gray-500 mb-4">Select all terms your listing is available for</p>
              
              <div className="flex flex-wrap gap-3">
                {TERM_TAGS.map(term => (
                  <button
                    key={term.value}
                    type="button"
                    onClick={() => toggleTermTag(term.value)}
                    className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                      formData.termTags.includes(term.value)
                        ? 'border-[#FFCB05] bg-[#FFCB05] text-[#00274C]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {term.label}
                  </button>
                ))}
              </div>
              
              {formData.termTags.length === 0 && (
                <p className="text-sm text-amber-600 mt-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Please select at least one term
                </p>
              )}
            </div>

            {/* Photos */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#00274C] mb-2">Photos</h2>
              <p className="text-sm text-gray-500 mb-4">Add up to 6 photos of your place</p>
              
              {/* Photo Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Upload Area */}
              {imagePreviews.length < 6 && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-[#FFCB05] hover:bg-[#FFCB05]/5 transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <svg className="w-10 h-10 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="font-medium text-[#00274C] mb-1">Click to upload photos</p>
                  <p className="text-sm text-gray-500">PNG, JPG up to 10MB each</p>
                </div>
              )}
            </div>

            {/* Dates & Pricing */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#00274C] mb-4">Dates & Pricing</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Move-in Date *</label>
                    <input
                      type="date"
                      value={formData.moveInDate}
                      onChange={(e) => setFormData({...formData, moveInDate: e.target.value})}
                      required
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Lease End Date *</label>
                    <input
                      type="date"
                      value={formData.leaseEndDate}
                      onChange={(e) => setFormData({...formData, leaseEndDate: e.target.value})}
                      required
                      className="input"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Monthly Rent *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
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
                    <label className="label">Security Deposit</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={formData.deposit}
                        onChange={(e) => setFormData({...formData, deposit: e.target.value})}
                        placeholder="1000"
                        min="0"
                        className="input pl-7"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={formData.utilitiesIncluded}
                      onChange={(e) => setFormData({...formData, utilitiesIncluded: e.target.checked})}
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Utilities included in rent</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#00274C] mb-4">Amenities</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {AMENITIES.map(amenity => (
                  <label 
                    key={amenity} 
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      formData.amenities.includes(amenity)
                        ? 'border-[#FFCB05] bg-[#FFCB05]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input 
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="hidden"
                    />
                    <span className={`text-sm ${formData.amenities.includes(amenity) ? 'text-[#00274C] font-medium' : 'text-gray-600'}`}>
                      {amenity}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Submit */}
            <div className="flex gap-4">
              <Link href="/listings" className="btn btn-outline flex-1">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex-1"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Publishing...
                  </span>
                ) : (
                  'Publish Listing'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
