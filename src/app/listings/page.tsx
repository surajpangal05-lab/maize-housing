'use client'

import { useState, useEffect } from 'react'
import ListingCard from '@/components/ListingCard'
import SearchFilters from '@/components/SearchFilters'
import { ListingWithUser, SearchFilters as SearchFiltersType } from '@/lib/types'

export default function ListingsPage() {
  const [listings, setListings] = useState<ListingWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<SearchFiltersType>({})
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  
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
  
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-neutral-900">Browse Listings</h1>
          <p className="mt-1 text-neutral-500">
            Find verified subleases and rentals in Ann Arbor
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="mb-6">
          <SearchFilters filters={filters} onFilterChange={setFilters} />
        </div>
        
        {/* Results Count */}
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
              <span className="font-medium">{pagination.total} listing{pagination.total !== 1 ? 's' : ''}</span>
            )}
          </p>
          
          {/* Sort */}
          <select className="input w-auto">
            <option>Newest first</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>
        
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
          <div className="card p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No listings found</h3>
            <p className="text-neutral-500 mb-6">Try adjusting your filters or check back later.</p>
            <button 
              onClick={() => setFilters({})} 
              className="btn btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
