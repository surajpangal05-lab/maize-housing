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
      <span className="text-xs text-neutral-400">Loading map...</span>
    </div>
  ),
})

const BEDROOMS = ['Studio', '1', '2', '3', '4+']

export default function ListingsPage() {
  const [listings, setListings] = useState<ListingWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<SearchFiltersType>({})
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [searchQuery, setSearchQuery] = useState('Ann Arbor, MI')
  const [sortBy, setSortBy] = useState('newest')
  
  useEffect(() => {
    fetchListings()
  }, [filters])
  
  const fetchListings = async (page = 1) => {
    setLoading(true)
    
    const params = new URLSearchParams()
    params.set('page', page.toString())
    params.set('limit', '10')
    
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
  }
  
  return (
    <div className="min-h-screen bg-white">
      {/* Back link */}
      <div className="border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-8 py-3">
          <Link href="/" className="text-xs text-neutral-600 hover:text-neutral-900">
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="border-b border-neutral-200 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex gap-3">
          <div className="flex-1 border border-neutral-900">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 text-sm bg-white focus:outline-none"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-3 border border-neutral-900 bg-white text-xs tracking-wider hover:bg-neutral-50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            FILTERS
          </button>
          <button 
            onClick={() => fetchListings()}
            className="px-6 py-3 bg-neutral-900 text-white text-xs tracking-wider hover:bg-neutral-800"
          >
            SEARCH
          </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-6">
        <div className="flex gap-6">
        {/* Filters Sidebar */}
        <aside className="w-64 flex-shrink-0 border border-neutral-900 p-5">
          <h3 className="text-base mb-5">Filters</h3>
          
          {/* Price Range */}
          <div className="mb-6 pb-6 border-b border-neutral-200">
            <label className="block text-xs text-neutral-500 tracking-wider mb-3">PRICE RANGE</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minRent || ''}
                onChange={(e) => updateFilter('minRent', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 text-sm border border-neutral-900 focus:outline-none"
              />
              <span className="text-neutral-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxRent || ''}
                onChange={(e) => updateFilter('maxRent', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 text-sm border border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Bedrooms */}
          <div className="mb-6 pb-6 border-b border-neutral-200">
            <label className="block text-xs text-neutral-500 tracking-wider mb-3">BEDROOMS</label>
            <div className="flex flex-wrap gap-2">
              {BEDROOMS.map((bed, idx) => (
                <button
                  key={bed}
                  onClick={() => updateFilter('bedrooms', filters.bedrooms === idx ? undefined : idx)}
                  className={`px-4 py-2 text-xs border transition-colors ${
                    filters.bedrooms === idx
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  {bed}
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="mb-6 pb-6 border-b border-neutral-200">
            <label className="block text-xs text-neutral-500 tracking-wider mb-3">AVAILABILITY</label>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="mm/dd/yyyy"
                value={filters.moveInStart || ''}
                onChange={(e) => updateFilter('moveInStart', e.target.value || undefined)}
                className="w-full px-3 py-2 text-sm border border-neutral-900 focus:outline-none"
              />
              <input
                type="text"
                placeholder="mm/dd/yyyy"
                value={filters.moveInEnd || ''}
                onChange={(e) => updateFilter('moveInEnd', e.target.value || undefined)}
                className="w-full px-3 py-2 text-sm border border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Amenities */}
          <div className="mb-6">
            <label className="block text-xs text-neutral-500 tracking-wider mb-3">AMENITIES</label>
            <div className="space-y-3">
              {['Furnished', 'Pet Friendly', 'Parking', 'Laundry'].map((amenity) => (
                <label key={amenity} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 border-neutral-900 accent-neutral-900" />
                  <span className="text-sm">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          <button 
            onClick={() => fetchListings()}
            className="w-full py-3 bg-neutral-900 text-white text-xs tracking-wider hover:bg-neutral-800"
          >
            APPLY
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl">{searchQuery}</h1>
              <p className="text-xs text-neutral-500 mt-1">{pagination.total} results found</p>
            </div>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 text-xs border border-neutral-900 focus:outline-none bg-white"
            >
              <option value="newest">Sort by: Newest</option>
              <option value="price_low">Sort by: Price Low</option>
              <option value="price_high">Sort by: Price High</option>
            </select>
          </div>

          {/* Interactive Map */}
          <div className="aspect-[2.5/1] border border-neutral-900 mb-6 overflow-hidden">
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

          {/* Listings */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4 border border-neutral-200 p-4 animate-pulse">
                  <div className="w-40 h-28 bg-neutral-100 flex-shrink-0" />
                  <div className="flex-1 py-1">
                    <div className="h-5 bg-neutral-100 w-3/4 mb-2" />
                    <div className="h-4 bg-neutral-100 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="space-y-4">
              {listings.map((listing) => (
                <ListingRow key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-neutral-300">
              <p className="text-neutral-500 text-sm mb-4">No listings found</p>
              <button onClick={clearFilters} className="text-xs text-neutral-900 underline">
                Clear filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-4">
              <button
                onClick={() => fetchListings(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 text-xs border border-neutral-900 disabled:opacity-50"
              >
                ← Previous
              </button>
              <span className="text-xs text-neutral-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchListings(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 text-xs border border-neutral-900 disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          )}
        </main>
        </div>
      </div>
    </div>
  )
}

function ListingRow({ listing }: { listing: ListingWithUser }) {
  const images = listing.images ? JSON.parse(listing.images) : []
  
  return (
    <div className="flex border border-neutral-900 bg-white">
      {/* Image */}
      <div className="w-44 bg-neutral-100 border-r border-neutral-900 flex-shrink-0 overflow-hidden">
        {images.length > 0 ? (
          <img src={images[0]} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full min-h-[140px] flex items-center justify-center text-neutral-400 text-xs tracking-wider">
            [IMAGE]
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base mb-1">{listing.title}</h3>
            <p className="text-xs text-neutral-500">
              {[listing.neighborhood || listing.city, listing.state].filter(Boolean).join(', ') || 'Location not specified'}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            {listing.rent ? (
              <>
                <p className="text-lg">{formatCurrency(listing.rent)}</p>
                <p className="text-xs text-neutral-500">per month</p>
              </>
            ) : (
              <p className="text-sm text-neutral-400">Contact for price</p>
            )}
          </div>
        </div>
        
        {/* Tags */}
        <div className="flex gap-2 mt-3">
          {listing.bedrooms != null && (
            <span className="px-2 py-1 text-xs border border-neutral-900">
              {listing.bedrooms} BR
            </span>
          )}
          {listing.bathrooms != null && (
            <span className="px-2 py-1 text-xs border border-neutral-900">
              {listing.bathrooms} BA
            </span>
          )}
          {listing.sqft && (
            <span className="px-2 py-1 text-xs border border-neutral-900">
              {listing.sqft} sqft
            </span>
          )}
        </div>
        
        {/* Description */}
        {listing.description && (
          <p className="text-xs text-neutral-600 mt-2 line-clamp-2">{listing.description}</p>
        )}
        
        {/* Footer */}
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-neutral-400">
            {listing.moveInDate ? `Available: ${formatDate(listing.moveInDate)}` : ''}
            {listing.moveInDate && listing.leaseEndDate ? ' – ' : ''}
            {listing.leaseEndDate ? formatDate(listing.leaseEndDate) : ''}
          </p>
          <Link 
            href={`/listings/${listing.id}`}
            className="px-4 py-2 text-xs border border-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
          >
            VIEW DETAILS
          </Link>
        </div>
      </div>
    </div>
  )
}
