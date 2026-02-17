'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import ListingCard from '@/components/ListingCard'
import SearchFilters, { EmptyListingsState } from '@/components/SearchFilters'
import { ListingWithUser, SearchFilters as SearchFiltersType } from '@/lib/types'

// Dynamically import the map component
const ListingsMap = dynamic(() => import('@/components/ListingsMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-100 rounded-2xl flex items-center justify-center">
      <div className="flex items-center gap-2 text-gray-500">
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
  const [sortBy, setSortBy] = useState<string>('newest')
  
  useEffect(() => {
    fetchListings()
  }, [filters, sortBy])
  
  const fetchListings = async (page = 1) => {
    setLoading(true)
    
    const params = new URLSearchParams()
    params.set('page', page.toString())
    params.set('limit', '12')
    params.set('sort', sortBy)
    
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[#00274C] to-[#1E3A5F] py-16">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-white mb-4">Browse Listings</h1>
            <p className="text-xl text-white/70">
              Find verified subleases and rentals in Ann Arbor. Filter by term, budget, and more.
            </p>
          </div>
        </div>
      </div>
      
      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block lg:w-80 flex-shrink-0">
            <div className="sticky top-24">
              <SearchFilters filters={filters} onFilterChange={setFilters} />
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <button 
                  className="lg:hidden btn btn-outline flex items-center gap-2"
                  onClick={() => {/* Could open a modal */}}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </button>
                
                {/* Results Count */}
                <p className="text-gray-600">
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
                      <span className="font-semibold text-[#00274C]">{pagination.total}</span> listing{pagination.total !== 1 ? 's' : ''} found
                      {hasActiveFilters && <span className="text-gray-400 ml-1">(filtered)</span>}
                    </span>
                  )}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* View Toggle */}
                <div className="flex bg-white border border-gray-200 rounded-xl p-1">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      viewMode === 'grid' 
                        ? 'bg-[#00274C] text-white' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => setViewMode('map')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      viewMode === 'map' 
                        ? 'bg-[#00274C] text-white' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </button>
                </div>
                
                {/* Sort */}
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input w-auto"
                >
                  <option value="newest">Newest first</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
                
                {/* Post Button */}
                <Link href="/listings/create" className="btn btn-primary hidden sm:inline-flex">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Post Listing
                </Link>
              </div>
            </div>
            
            {/* Map View */}
            {viewMode === 'map' && !loading && listings.length > 0 && (
              <div className="mb-8">
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
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card overflow-hidden animate-pulse">
                    <div className="aspect-[4/3] bg-gray-200" />
                    <div className="p-5 space-y-4">
                      <div className="flex gap-2">
                        <div className="h-6 w-16 bg-gray-200 rounded" />
                        <div className="h-6 w-16 bg-gray-200 rounded" />
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : listings.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 stagger-children">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
                
                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center gap-4">
                    <button
                      onClick={() => fetchListings(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="btn btn-outline"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>
                    <span className="text-gray-600">
                      Page <span className="font-semibold text-[#00274C]">{pagination.page}</span> of <span className="font-semibold text-[#00274C]">{pagination.totalPages}</span>
                    </span>
                    <button
                      onClick={() => fetchListings(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="btn btn-outline"
                    >
                      Next
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
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
      </div>
      
      {/* Mobile Post Button */}
      <div className="fixed bottom-6 right-6 sm:hidden z-40">
        <Link 
          href="/listings/create" 
          className="w-14 h-14 bg-[#FFCB05] rounded-full shadow-lg flex items-center justify-center text-[#00274C]"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
