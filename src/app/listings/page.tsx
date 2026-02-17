'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import ListingCard from '@/components/ListingCard'
import SearchFilters, { EmptyListingsState } from '@/components/SearchFilters'
import { ListingWithUser, SearchFilters as SearchFiltersType } from '@/lib/types'

// Dynamically import the map component to avoid SSR issues
const ListingsMap = dynamic(() => import('@/components/ListingsMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-neutral-100 rounded-lg flex items-center justify-center">
      <div className="flex items-center gap-2 text-neutral-500">
        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading map...
      </div>
    </div>
  )
})

export default function ListingsPage() {
  const [listings, setListings] = useState<ListingWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<SearchFiltersType>({})
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  
  useEffect(() => {
    fetchListings()
  }, [filters])
  
  const fetchListings = async (page = 1) => {
    setLoading(true)
    
    const params = new URLSearchParams()
    params.set('page', page.toString())
    params.set('limit', '12')
    
    if (filters.type) params.set('type', filters.type)
    if (filters.termTags?.length) params.set('termTags', filters.termTags.join(','))
    if (filters.minRent) params.set('minRent', filters.minRent.toString())
    if (filters.maxRent) params.set('maxRent', filters.maxRent.toString())
    if (filters.bedrooms !== undefined) params.set('bedrooms', filters.bedrooms.toString())
    if (filters.bathrooms) params.set('bathrooms', filters.bathrooms.toString())
    if (filters.propertyType) params.set('propertyType', filters.propertyType)
    if (filters.moveInStart) params.set('moveInStart', filters.moveInStart)
    if (filters.moveInEnd) params.set('moveInEnd', filters.moveInEnd)
    if (filters.neighborhood) params.set('neighborhood', filters.neighborhood)
    if (filters.verifiedOnly) params.set('verifiedOnly', 'true')
    
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
  
  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '' && (Array.isArray(v) ? v.length > 0 : true))
  
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Browse Listings</h1>
              <p className="mt-1 text-neutral-500">
                Find verified subleases and rentals in Ann Arbor
              </p>
            </div>
            <Link href="/listings/create" className="btn btn-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Post Listing
            </Link>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="mb-6">
          <SearchFilters filters={filters} onFilterChange={setFilters} />
        </div>
        
        {/* Results Count & View Toggle */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-neutral-600">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading...
              </span>
            ) : (
              <span>
                <span className="font-medium">{pagination.total}</span> listing{pagination.total !== 1 ? 's' : ''} found
                {hasActiveFilters && <span className="text-neutral-400 ml-1">(filtered)</span>}
              </span>
            )}
          </p>
          
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex border border-neutral-300 rounded-lg overflow-hidden">
              <button 
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-[#FFCB05] text-[#00274C]' 
                    : 'bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                Grid
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === 'map' 
                    ? 'bg-[#FFCB05] text-[#00274C]' 
                    : 'bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                Map
              </button>
            </div>
            
            {/* Sort */}
            <select className="input w-auto">
              <option>Newest first</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>
        
        {/* Map View */}
        {viewMode === 'map' && !loading && listings.length > 0 && (
          <div className="mb-6">
            <ListingsMap 
              listings={listings.map(l => ({
                id: l.id,
                title: l.title,
                address: l.address,
                city: l.city || 'Ann Arbor',
                rent: l.rent,
                beds: l.bedrooms
              }))}
            />
          </div>
        )}
        
        {/* Listings Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="h-44 bg-neutral-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-neutral-200 rounded w-3/4" />
                  <div className="h-4 bg-neutral-200 rounded w-1/2" />
                  <div className="h-4 bg-neutral-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-10 flex justify-center items-center gap-4">
                <button
                  onClick={() => fetchListings(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="btn btn-outline"
                >
                  ← Previous
                </button>
                <span className="text-sm text-neutral-600">
                  Page <span className="font-semibold">{pagination.page}</span> of <span className="font-semibold">{pagination.totalPages}</span>
                </span>
                <button
                  onClick={() => fetchListings(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="btn btn-outline"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyListingsState 
            onClearFilters={() => setFilters({})} 
            hasFilters={hasActiveFilters}
          />
        )}
      </div>
    </div>
  )
}
