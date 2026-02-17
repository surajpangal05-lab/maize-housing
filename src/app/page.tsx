'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ListingWithUser } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function Home() {
  const [listings, setListings] = useState<ListingWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState('')
  const [dates, setDates] = useState('')

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      const response = await fetch('/api/listings?limit=6')
      const data = await response.json()
      if (data.success) {
        setListings(data.listings)
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-8 py-12">
          <p className="text-xs text-neutral-400 tracking-widest mb-2">[HERO SECTION]</p>
          <h1 className="text-4xl mb-10">
            Find Your Perfect Sublease
          </h1>

          {/* Search Bar */}
          <div className="flex gap-0">
          <div className="flex-1 border border-neutral-900">
            <label className="block px-4 pt-2 text-xs text-neutral-500 tracking-widest">
              LOCATION
            </label>
            <input
              type="text"
              placeholder="Enter city or neighborhood"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 pb-3 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none bg-transparent"
            />
          </div>
          <div className="w-48 border border-neutral-900 border-l-0">
            <label className="block px-4 pt-2 text-xs text-neutral-500 tracking-widest">
              DATES
            </label>
            <input
              type="text"
              placeholder="Select dates"
              value={dates}
              onChange={(e) => setDates(e.target.value)}
              className="w-full px-4 pb-3 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none bg-transparent"
            />
          </div>
          <Link
            href="/listings"
            className="flex items-center justify-center gap-2 px-8 bg-neutral-900 text-white text-xs tracking-widest hover:bg-neutral-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            SEARCH
          </Link>
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl">Recent Listings</h2>
          <span className="text-xs text-neutral-500">{listings.length} results</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-0">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border border-neutral-900 animate-pulse" style={{ marginRight: i % 3 !== 2 ? '-1px' : 0, marginBottom: i < 3 ? '-1px' : 0 }}>
                <div className="aspect-[4/3] bg-neutral-100" />
                <div className="p-4">
                  <div className="h-4 bg-neutral-100 w-1/4 mb-2" />
                  <div className="h-4 bg-neutral-100 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-3">
            {listings.map((listing, i) => (
              <div 
                key={listing.id} 
                style={{ 
                  marginRight: i % 3 !== 2 ? '-1px' : 0, 
                  marginBottom: i < 3 ? '-1px' : 0 
                }}
              >
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i} 
                style={{ 
                  marginRight: i % 3 !== 0 ? '-1px' : 0, 
                  marginBottom: i <= 3 ? '-1px' : 0 
                }}
              >
                <PlaceholderCard index={i} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link 
            href="/listings"
            className="inline-flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-900 tracking-wider"
          >
            View all listings →
          </Link>
        </div>
      </section>
    </div>
  )
}

function ListingCard({ listing }: { listing: ListingWithUser }) {
  const images = listing.images ? JSON.parse(listing.images) : []
  
  return (
    <Link href={`/listings/${listing.id}`} className="block border border-neutral-900 bg-white group">
      {/* Image */}
      <div className="aspect-[4/3] bg-neutral-100 border-b border-neutral-900">
        {images.length > 0 ? (
          <img 
            src={images[0]} 
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs tracking-wider">
            [IMAGE]
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="px-2 py-1 text-xs border border-neutral-900">
            {listing.bedrooms} BR
          </span>
          <span className="text-sm">
            {formatCurrency(listing.rent)}/mo
          </span>
        </div>
        <h3 className="text-sm group-hover:text-neutral-600 transition-colors truncate">
          {listing.title}
        </h3>
        <p className="text-xs text-neutral-500 truncate">{listing.neighborhood || listing.city}</p>
        <p className="text-xs text-neutral-400 mt-2">
          Available: {formatDate(listing.moveInDate)} – {formatDate(listing.leaseEndDate)}
        </p>
      </div>
    </Link>
  )
}

function PlaceholderCard({ index }: { index: number }) {
  return (
    <div className="border border-neutral-900 bg-white">
      {/* Image */}
      <div className="aspect-[4/3] bg-neutral-100 border-b border-neutral-900 flex items-center justify-center">
        <span className="text-neutral-400 text-xs tracking-wider">[IMAGE {index}]</span>
      </div>
      
      {/* Info */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="px-2 py-1 text-xs border border-neutral-900">
            1 BR
          </span>
          <span className="text-sm">
            $1,200/mo
          </span>
        </div>
        <h3 className="text-sm">Apartment Title {index}</h3>
        <p className="text-xs text-neutral-500">Neighborhood Name</p>
        <p className="text-xs text-neutral-400 mt-2">
          Available: Mar – Jun 2026
        </p>
      </div>
    </div>
  )
}
