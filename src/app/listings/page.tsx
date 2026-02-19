'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useSession } from 'next-auth/react'
import ListingCard from '@/components/ListingCard'
import SearchFilters, { EmptyListingsState } from '@/components/SearchFilters'
import { ListingWithUser, SearchFilters as SearchFiltersType } from '@/lib/types'

const FREE_PREVIEW_COUNT = 3

const ListingsMap = dynamic(() => import('@/components/ListingsMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="flex items-center gap-2 text-gray-500">
        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading map...
      </div>
    </div>
  ),
})

export default function ListingsPage() {
  const { data: session, status: authStatus } = useSession()
  const [listings, setListings] = useState<ListingWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<SearchFiltersType>({})
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [sortBy, setSortBy] = useState<string>('newest')

  const isSignedIn = !!session
  const isAuthLoading = authStatus === 'loading'

  useEffect(() => { fetchListings() }, [filters, sortBy])

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
      const res = await fetch(`/api/listings?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setListings(data.listings)
        setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages, total: data.pagination.total })
      }
    } catch (err) {
      console.error('Error fetching listings:', err)
    } finally {
      setLoading(false)
    }
  }

  const hasActive = Object.values(filters).some(v => v !== undefined && v !== '' && (Array.isArray(v) ? v.length > 0 : true))

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#00274C] to-[#003D6E] text-white py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Browse Listings</h1>
          <p className="text-white/70 text-lg">Find your perfect Michigan home from verified students and landlords</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <SearchFilters filters={filters} onFilterChange={setFilters} />

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 text-lg">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading...
              </span>
            ) : (
              <>Showing <span className="font-semibold text-[#00274C]">{pagination.total}</span> listing{pagination.total !== 1 ? 's' : ''}{hasActive && <span className="text-gray-400 ml-1">(filtered)</span>}</>
            )}
          </p>

          <div className="flex items-center gap-3">
            <div className="flex bg-white border border-gray-200 rounded-lg p-1">
              {(['grid', 'map'] as const).map(mode => (
                <button key={mode} onClick={() => setViewMode(mode)} className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${viewMode === mode ? 'bg-[#00274C] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                  {mode === 'grid' ? 'Grid' : 'Map'}
                </button>
              ))}
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input w-auto">
              <option value="newest">Newest first</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Map */}
        {viewMode === 'map' && !loading && listings.length > 0 && (
          <div className="mb-8">
            <ListingsMap listings={listings.map(l => ({ id: l.id, title: l.title, street: l.address, city: l.city || 'Ann Arbor', rent: l.rent, beds: l.bedrooms }))} />
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(isSignedIn || isAuthLoading ? listings : listings.slice(0, FREE_PREVIEW_COUNT)).map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            {/* Sign-in wall for unauthenticated users */}
            {!isSignedIn && !isAuthLoading && listings.length > FREE_PREVIEW_COUNT && (
              <div className="relative mt-2">
                <div className="absolute inset-x-0 -top-32 h-32 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none z-10" />
                <div className="relative z-20 py-16 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-[#FFCB05] rounded-2xl flex items-center justify-center mx-auto mb-5">
                      <svg className="w-8 h-8 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-[#00274C] mb-2">Sign in to see all listings</h2>
                    <p className="text-gray-500 mb-6">
                      Create a free account to browse {pagination.total - FREE_PREVIEW_COUNT}+ more listings, save favorites, and contact landlords directly.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link href="/login?callbackUrl=/listings" className="btn btn-lg bg-[#FFCB05] text-[#00274C] hover:bg-[#FFD42E] px-8">
                        Sign In
                      </Link>
                      <Link href="/register?callbackUrl=/listings" className="btn btn-lg btn-outline px-8">
                        Create Account
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isSignedIn && pagination.totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-4">
                <button onClick={() => fetchListings(pagination.page - 1)} disabled={pagination.page === 1} className="btn btn-outline btn-sm">Previous</button>
                <span className="text-gray-600">Page <span className="font-semibold text-[#00274C]">{pagination.page}</span> of {pagination.totalPages}</span>
                <button onClick={() => fetchListings(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="btn btn-outline btn-sm">Next</button>
              </div>
            )}
          </>
        ) : (
          <EmptyListingsState onClearFilters={() => setFilters({})} hasFilters={hasActive} />
        )}
      </div>
    </div>
  )
}
