'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ListingWithUser, SearchFilters as SearchFiltersType } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'

// Dynamically import map to avoid SSR issues
const ListingsMap = dynamic(() => import('@/components/ListingsMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-neutral-50">
      <span className="text-sm text-neutral-400">Loading map...</span>
    </div>
  ),
})

const NEIGHBORHOODS = [
  { id: 'central', label: 'Central Campus' },
  { id: 'north', label: 'North Campus' },
  { id: 'kerrytown', label: 'Kerrytown' },
  { id: 'southu', label: 'South U' },
  { id: 'oldwest', label: 'Old West Side' },
]

const LEASE_TERMS = ['Fall', 'Winter', 'Spring', 'Summer']

export default function ListingsPage() {
  const [listings, setListings] = useState<ListingWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<SearchFiltersType>({})
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [sortBy, setSortBy] = useState('newest')
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null)
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  
  useEffect(() => {
    fetchListings()
  }, [filters])
  
  const fetchListings = async (page = 1) => {
    setLoading(true)
    
    const params = new URLSearchParams()
    params.set('page', page.toString())
    params.set('limit', '12')
    
    if (filters.type) params.set('type', filters.type)
    if (filters.minRent) params.set('minRent', filters.minRent.toString())
    if (filters.maxRent) params.set('maxRent', filters.maxRent.toString())
    if (filters.bedrooms !== undefined) params.set('bedrooms', filters.bedrooms.toString())
    if (filters.moveInStart) params.set('moveInStart', filters.moveInStart)
    if (filters.moveInEnd) params.set('moveInEnd', filters.moveInEnd)
    
    try {
      const response = await fetch(`/api/listings?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        setListings(data.listings)
        setPagination({
          page: data.pagination.page,
          totalPages: data.pagination.totalPages,
          total: data.pagination.total
        })
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const updateFilter = (key: keyof SearchFiltersType, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({})
    setSelectedNeighborhood(null)
    setSelectedTerm(null)
  }

  // Calculate walk time to Diag based on address/neighborhood
  const getWalkTime = (listing: ListingWithUser) => {
    const addr = (listing.neighborhood || listing.address || '').toLowerCase()
    if (addr.includes('state') || addr.includes('south u') || addr.includes('central')) return '5'
    if (addr.includes('kerrytown') || addr.includes('liberty') || addr.includes('main')) return '10'
    if (addr.includes('north') || addr.includes('plymouth')) return '15'
    if (addr.includes('west')) return '12'
    return '10'
  }
  
  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0">
      {/* Header */}
      <div className="border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">Ann Arbor Subleases</p>
          <h1 className="text-3xl font-semibold text-neutral-900">Browse Listings</h1>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="border-b border-neutral-200 bg-neutral-50 sticky top-16 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4">
          {/* Top Row - Main Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {/* Price */}
            <select 
              className="px-4 py-2 text-sm border border-neutral-300 bg-white focus:outline-none focus:border-neutral-900"
              onChange={(e) => {
                const val = e.target.value
                if (val === 'under1000') updateFilter('maxRent', 1000)
                else if (val === '1000-1500') { updateFilter('minRent', 1000); updateFilter('maxRent', 1500) }
                else if (val === '1500-2000') { updateFilter('minRent', 1500); updateFilter('maxRent', 2000) }
                else if (val === '2000+') updateFilter('minRent', 2000)
                else { updateFilter('minRent', undefined); updateFilter('maxRent', undefined) }
              }}
            >
              <option value="">Any Price</option>
              <option value="under1000">Under $1,000</option>
              <option value="1000-1500">$1,000 - $1,500</option>
              <option value="1500-2000">$1,500 - $2,000</option>
              <option value="2000+">$2,000+</option>
            </select>

            {/* Bedrooms */}
            <select 
              className="px-4 py-2 text-sm border border-neutral-300 bg-white focus:outline-none focus:border-neutral-900"
              onChange={(e) => {
                const val = e.target.value
                updateFilter('bedrooms', val ? Number(val) : undefined)
              }}
            >
              <option value="">Any Beds</option>
              <option value="0">Studio</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedrooms</option>
              <option value="3">3+ Bedrooms</option>
            </select>

            {/* Term Buttons */}
            <div className="hidden md:flex items-center gap-1 ml-2">
              {LEASE_TERMS.map((term) => (
                <button
                  key={term}
                  onClick={() => setSelectedTerm(selectedTerm === term ? null : term)}
                  className={`px-3 py-2 text-sm border transition-colors ${
                    selectedTerm === term
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-300 bg-white hover:border-neutral-900'
                  }`}
                >
                  {term}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="ml-auto px-4 py-2 text-sm border border-neutral-300 bg-white focus:outline-none focus:border-neutral-900"
            >
              <option value="newest">Newest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>

          {/* Neighborhood Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {NEIGHBORHOODS.map((hood) => (
              <button
                key={hood.id}
                onClick={() => setSelectedNeighborhood(selectedNeighborhood === hood.id ? null : hood.id)}
                className={`px-3 py-1.5 text-xs border transition-colors ${
                  selectedNeighborhood === hood.id
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-300 bg-white hover:border-neutral-900'
                }`}
              >
                {hood.label}
              </button>
            ))}
            {(selectedNeighborhood || selectedTerm || filters.minRent || filters.maxRent || filters.bedrooms !== undefined) && (
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-900"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-neutral-500">
            {pagination.total} {pagination.total === 1 ? 'listing' : 'listings'} available
          </p>
        </div>

        {/* Map */}
        <div className="aspect-[3/1] bg-neutral-100 mb-8 overflow-hidden border border-neutral-200">
          <ListingsMap 
            listings={listings.map(l => ({
              id: l.id,
              title: l.title,
              street: l.address,
              city: l.city,
              rent: l.rent,
              beds: l.bedrooms,
            }))}
          />
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-neutral-100 mb-3" />
                <div className="h-5 bg-neutral-100 w-1/3 mb-2" />
                <div className="h-4 bg-neutral-100 w-2/3" />
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} walkTime={getWalkTime(listing)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-neutral-300">
            <p className="text-neutral-500 mb-2">No listings match your filters</p>
            <p className="text-sm text-neutral-400 mb-4">Try adjusting your search criteria</p>
            <button onClick={clearFilters} className="text-sm text-neutral-900 underline">
              Clear all filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-10 flex justify-center items-center gap-4">
            <button
              onClick={() => fetchListings(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-5 py-2 text-sm border border-neutral-300 hover:border-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-neutral-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchListings(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-5 py-2 text-sm border border-neutral-300 hover:border-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Mobile Filter Button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 px-6 py-3 bg-neutral-900 text-white text-sm font-medium shadow-lg z-50"
      >
        Filters
      </button>
    </div>
  )
}

function ListingCard({ listing, walkTime }: { listing: ListingWithUser; walkTime: string }) {
  const images = listing.images ? JSON.parse(listing.images) : []
  
  return (
    <Link href={`/listings/${listing.id}`} className="block group">
      {/* Image */}
      <div className="aspect-[4/3] bg-neutral-100 mb-3 overflow-hidden">
        {images.length > 0 ? (
          <img 
            src={images[0]} 
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">
            No image
          </div>
        )}
      </div>
      
      {/* Price - Bold and Prominent */}
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-lg font-semibold text-neutral-900">
          {listing.rent ? formatCurrency(listing.rent) : 'Contact'}
          {listing.rent && <span className="text-sm font-normal text-neutral-500">/mo</span>}
        </span>
      </div>
      
      {/* Address */}
      <h3 className="text-sm text-neutral-900 group-hover:text-neutral-600 transition-colors truncate mb-1">
        {listing.address || listing.title}
      </h3>
      
      {/* Tags Row */}
      <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
        <span>{listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms} bed`}</span>
        {listing.bathrooms && (
          <>
            <span>·</span>
            <span>{listing.bathrooms} bath</span>
          </>
        )}
        <span>·</span>
        <span>{listing.neighborhood || listing.city}</span>
      </div>
      
      {/* Walk Time Badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-400">
          {walkTime} min walk to Diag
        </span>
      </div>
      
      {/* Posted date */}
      <p className="text-xs text-neutral-400 mt-2">
        Posted {formatDate(listing.createdAt)}
      </p>
    </Link>
  )
}
