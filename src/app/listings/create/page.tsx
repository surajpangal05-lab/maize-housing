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
    title: '', description: '', address: '', city: 'Ann Arbor', state: 'MI', zipCode: '', neighborhood: '',
    propertyType: 'APARTMENT' as PropertyType, bedrooms: 1, bathrooms: 1, sqft: '', rent: '', deposit: '',
    subleaseFee: '', utilitiesIncluded: false, utilitiesNotes: '', termTags: [] as TermTag[],
    moveInDate: '', moveInWindowStart: '', moveInWindowEnd: '', leaseEndDate: '', amenities: [] as string[], images: [] as string[],
  })

  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-7 h-7 border-3 border-[#FFCB05] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-sm mx-auto text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-[#00274C]">Sign in required</h1>
            <p className="text-slate-400 text-sm mb-6">You need to be signed in and verified to create a listing.</p>
            <Link href="/login?callbackUrl=/listings/create" className="inline-flex items-center justify-center bg-[#FFCB05] text-[#00274C] hover:bg-[#FFD42E] font-semibold py-2.5 px-6 rounded-lg border-2 border-[#FFCB05] transition-colors">Sign in to continue</Link>
          </div>
        </div>
      </div>
    )
  }

  const toggleTerm = (tag: TermTag) => {
    setFormData(prev => ({ ...prev, termTags: prev.termTags.includes(tag) ? prev.termTags.filter(t => t !== tag) : [...prev.termTags, tag] }))
  }

  const toggleAmenity = (a: string) => {
    setFormData(prev => ({ ...prev, amenities: prev.amenities.includes(a) ? prev.amenities.filter(x => x !== a) : [...prev.amenities, a] }))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).slice(0, 6 - imageFiles.length).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (ev) => {
          if (ev.target?.result) {
            setImagePreviews(prev => [...prev, ev.target!.result as string])
            setImageFiles(prev => [...prev, file])
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removeImage = (idx: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== idx))
    setImageFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!formData.title.trim()) { setError('Please enter a listing title'); return }
    if (formData.termTags.length === 0) { setError('Please select at least one term'); return }
    if (!formData.rent || parseFloat(formData.rent) <= 0) { setError('Please enter a valid monthly rent'); return }
    if (!formData.moveInDate || !formData.leaseEndDate) { setError('Please enter move-in and lease end dates'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          rent: parseFloat(formData.rent),
          deposit: formData.deposit ? parseFloat(formData.deposit) : undefined,
          subleaseFee: formData.subleaseFee ? parseFloat(formData.subleaseFee) : undefined,
          sqft: formData.sqft ? parseInt(formData.sqft) : undefined,
          images: imagePreviews,
        }),
      })
      const data = await res.json()
      if (data.success) router.push(`/listings/${data.listing.id}`)
      else setError(data.error || 'Failed to create listing')
    } catch { setError('Something went wrong. Please try again.') }
    finally { setLoading(false) }
  }

  const Field = ({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) => (
    <div>
      <label className="label">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      {children}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#00274C] to-[#003D6E] pt-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/listings" className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to listings
          </Link>
          <h1 className="text-white text-3xl font-bold">Post a listing</h1>
          <p className="text-white/70 mt-2">Fill out the details below to list your place.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="alert alert-error">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            )}

            {/* Type */}
            <div className="p-6 rounded-xl bg-white border-2 border-gray-200 hover:border-[#FFCB05] hover:shadow-lg transition-all">
              <h2 className="font-semibold mb-4">Listing type</h2>
              <div className="grid grid-cols-2 gap-3">
                {(['SUBLEASE', 'RENTAL'] as const).map(type => (
                  <button key={type} type="button" onClick={() => setFormData({ ...formData, type })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${formData.type === type ? 'border-[#FFCB05] bg-[#FFCB05]/5' : 'border-gray-200 hover:border-[#FFCB05]'}`}>
                    <span className="font-semibold text-sm">{type === 'SUBLEASE' ? 'Sublease' : 'Rental'}</span>
                    <p className="text-xs text-slate-400 mt-0.5">{type === 'SUBLEASE' ? "I'm subleasing my place" : "I'm a landlord"}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Basic info */}
            <div className="p-6 rounded-xl bg-white border-2 border-gray-200 hover:border-[#FFCB05] hover:shadow-lg transition-all">
              <h2 className="font-semibold mb-4">Basic information</h2>
              <div className="space-y-4">
                <Field label="Listing title" required>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Spacious 1BR near Central Campus" required className="input" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Property type">
                    <select value={formData.propertyType} onChange={(e) => setFormData({ ...formData, propertyType: e.target.value as PropertyType })} className="input">
                      {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Neighborhood">
                    <input type="text" value={formData.neighborhood} onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })} placeholder="e.g., Central Campus" className="input" />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Bedrooms" required>
                    <select value={formData.bedrooms} onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })} className="input">
                      {[0, 1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n === 0 ? 'Studio' : n}</option>)}
                    </select>
                  </Field>
                  <Field label="Bathrooms" required>
                    <select value={formData.bathrooms} onChange={(e) => setFormData({ ...formData, bathrooms: parseFloat(e.target.value) })} className="input">
                      {[1, 1.5, 2, 2.5, 3, 3.5, 4].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Street address" required>
                  <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="123 Main St" required className="input" />
                </Field>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="City"><input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="input" /></Field>
                  <Field label="State"><input type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="input" /></Field>
                  <Field label="ZIP" required><input type="text" value={formData.zipCode} onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })} placeholder="48104" required className="input" /></Field>
                </div>
                <Field label="Description" required>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe your place..." required rows={4} className="input" style={{ height: 'auto', minHeight: '100px' }} />
                </Field>
              </div>
            </div>

            {/* Terms */}
            <div className="p-6 rounded-xl bg-white border-2 border-gray-200 hover:border-[#FFCB05] hover:shadow-lg transition-all">
              <h2 className="font-semibold mb-1">Sublease term <span className="text-red-400">*</span></h2>
              <p className="text-xs text-slate-400 mb-4">Select all terms your listing is available for</p>
              <div className="flex flex-wrap gap-2">
                {TERM_TAGS.map(term => (
                  <button key={term.value} type="button" onClick={() => toggleTerm(term.value)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${formData.termTags.includes(term.value) ? 'bg-[#FFCB05] text-[#00274C] hover:bg-[#FFD42E] shadow-sm' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                    {term.label}
                  </button>
                ))}
              </div>
              {formData.termTags.length === 0 && (
                <p className="text-xs text-amber-500 mt-3 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Select at least one term
                </p>
              )}
            </div>

            {/* Photos */}
            <div className="p-6 rounded-xl bg-white border-2 border-gray-200 hover:border-[#FFCB05] hover:shadow-lg transition-all">
              <h2 className="font-semibold mb-1">Photos</h2>
              <p className="text-xs text-slate-400 mb-4">Add up to 6 photos of your place</p>
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2.5 mb-4">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-50">
                      <img src={preview} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 text-xs">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {imagePreviews.length < 6 && (
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center cursor-pointer hover:border-[#FFCB05] hover:bg-[#FFCB05]/5 transition-all">
                  <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
                  <svg className="w-8 h-8 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="text-sm font-medium mb-0.5">Click to upload</p>
                  <p className="text-xs text-slate-400">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>

            {/* Dates & Pricing */}
            <div className="p-6 rounded-xl bg-white border-2 border-gray-200 hover:border-[#FFCB05] hover:shadow-lg transition-all">
              <h2 className="font-semibold mb-4">Dates & pricing</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Move-in date" required><input type="date" value={formData.moveInDate} onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })} required className="input" /></Field>
                  <Field label="Lease end date" required><input type="date" value={formData.leaseEndDate} onChange={(e) => setFormData({ ...formData, leaseEndDate: e.target.value })} required className="input" /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Monthly rent" required>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                      <input type="number" value={formData.rent} onChange={(e) => setFormData({ ...formData, rent: e.target.value })} placeholder="1200" required min="1" className="input" style={{ paddingLeft: '1.75rem' }} />
                    </div>
                  </Field>
                  <Field label="Security deposit">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                      <input type="number" value={formData.deposit} onChange={(e) => setFormData({ ...formData, deposit: e.target.value })} placeholder="1000" min="0" className="input" style={{ paddingLeft: '1.75rem' }} />
                    </div>
                  </Field>
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={formData.utilitiesIncluded} onChange={(e) => setFormData({ ...formData, utilitiesIncluded: e.target.checked })} />
                  <span className="text-sm text-slate-600">Utilities included in rent</span>
                </label>
              </div>
            </div>

            {/* Amenities */}
            <div className="p-6 rounded-xl bg-white border-2 border-gray-200 hover:border-[#FFCB05] hover:shadow-lg transition-all">
              <h2 className="font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {AMENITIES.map(a => (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)}
                    className={`p-3 rounded-xl text-sm font-medium text-left transition-all ${formData.amenities.includes(a) ? 'bg-[#FFCB05]/10 border-2 border-[#FFCB05] text-[#00274C] hover:bg-[#FFD42E]/20' : 'bg-slate-50 border-2 border-transparent text-slate-500 hover:bg-slate-100 hover:border-gray-200'}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <Link href="/listings" className="btn btn-outline flex-1">Cancel</Link>
              <button type="submit" disabled={loading} className="flex-1 inline-flex items-center justify-center gap-2 bg-[#FFCB05] text-[#00274C] hover:bg-[#FFD42E] font-semibold py-2.5 px-6 rounded-lg border-2 border-[#FFCB05] transition-colors disabled:opacity-50 disabled:pointer-events-none">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Publishing...
                  </span>
                ) : 'Publish listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
