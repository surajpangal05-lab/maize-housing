'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ListingWithUser } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'

const NEIGHBORHOODS = [
  'Central Campus',
  'North Campus', 
  'Kerrytown',
  'South U',
  'Old West Side',
]

const LEASE_TERMS = ['Fall', 'Winter', 'Spring', 'Summer']

export default function Home() {
  const [listings, setListings] = useState<ListingWithUser[]>([])
  const [loading, setLoading] = useState(true)

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
      {/* Hero Section - Minimal, Typography-Driven */}
      <section className="border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl md:text-5xl mb-4 text-neutral-900">
            Find Your Next Ann Arbor Sublease
          </h1>
          <p className="text-lg text-neutral-500 mb-10 max-w-xl mx-auto">
            Off-campus housing. Built for Michigan students.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/listings"
              className="px-8 py-3 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
            >
              Browse Listings
            </Link>
            <Link
              href="/listings/create"
              className="px-8 py-3 border border-neutral-900 text-neutral-900 text-sm font-medium hover:bg-neutral-50 transition-colors"
            >
              Post a Sublease
            </Link>
          </div>
        </div>
      </section>

      {/* Filters - Above the Fold */}
      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Price Range */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 uppercase tracking-wide">Price</span>
              <select className="px-3 py-2 text-sm border border-neutral-300 bg-white focus:outline-none focus:border-neutral-900">
                <option>Any</option>
                <option>Under $1,000</option>
                <option>$1,000 - $1,500</option>
                <option>$1,500 - $2,000</option>
                <option>$2,000+</option>
              </select>
            </div>

            {/* Bedrooms */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 uppercase tracking-wide">Beds</span>
              <select className="px-3 py-2 text-sm border border-neutral-300 bg-white focus:outline-none focus:border-neutral-900">
                <option>Any</option>
                <option>Studio</option>
                <option>1 BR</option>
                <option>2 BR</option>
                <option>3+ BR</option>
              </select>
            </div>

            {/* Lease Term */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 uppercase tracking-wide">Term</span>
              <div className="flex gap-1">
                {LEASE_TERMS.map((term) => (
                  <button
                    key={term}
                    className="px-3 py-2 text-xs border border-neutral-300 bg-white hover:border-neutral-900 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Neighborhood Buttons */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wide mr-2">Neighborhood</span>
            {NEIGHBORHOODS.map((hood) => (
              <button
                key={hood}
                className="px-3 py-1.5 text-xs border border-neutral-300 bg-white hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
              >
                {hood}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">Ann Arbor Subleases</p>
            <h2 className="text-2xl text-neutral-900">Recent Listings</h2>
          </div>
          <span className="text-sm text-neutral-500">{listings.length} available</span>
        </div>

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
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-neutral-300">
            <p className="text-neutral-500 mb-4">No listings available yet</p>
            <Link href="/listings/create" className="text-sm text-neutral-900 underline">
              Be the first to post
            </Link>
          </div>
        )}

        <div className="mt-10 text-center">
          <Link 
            href="/listings"
            className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-900 text-sm font-medium hover:bg-neutral-900 hover:text-white transition-colors"
          >
            View All Listings
          </Link>
        </div>
      </section>

      {/* How It Works - Simple */}
      <section className="border-t border-neutral-200 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="text-2xl text-neutral-900 text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full border border-neutral-900 flex items-center justify-center mx-auto mb-4 text-sm font-medium">
                1
              </div>
              <h3 className="font-medium mb-2">Browse</h3>
              <p className="text-sm text-neutral-500">Find subleases near campus with verified details</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full border border-neutral-900 flex items-center justify-center mx-auto mb-4 text-sm font-medium">
                2
              </div>
              <h3 className="font-medium mb-2">Connect</h3>
              <p className="text-sm text-neutral-500">Message the subleasor directly through the platform</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full border border-neutral-900 flex items-center justify-center mx-auto mb-4 text-sm font-medium">
                3
              </div>
              <h3 className="font-medium mb-2">Move In</h3>
              <p className="text-sm text-neutral-500">Finalize the agreement and get your keys</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="border-t border-neutral-200">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl text-neutral-900 mb-4">
            Have a place to sublease?
          </h2>
          <p className="text-neutral-500 mb-8 max-w-md mx-auto">
            Post your listing for free and reach thousands of Michigan students looking for housing.
          </p>
          <Link
            href="/listings/create"
            className="inline-flex px-8 py-3 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            Post Your Sublease
          </Link>
        </div>
      </section>
    </div>
  )
}

function ListingCard({ listing }: { listing: ListingWithUser }) {
  const images = listing.images ? JSON.parse(listing.images) : []
  
  // Calculate approximate walk time to Diag (mock based on neighborhood)
  const getWalkTime = () => {
    const hood = (listing.neighborhood || listing.address || '').toLowerCase()
    if (hood.includes('central') || hood.includes('state') || hood.includes('south u')) return '5'
    if (hood.includes('kerrytown') || hood.includes('liberty')) return '10'
    if (hood.includes('north')) return '15'
    return '12'
  }
  
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
          {formatCurrency(listing.rent)}
          <span className="text-sm font-normal text-neutral-500">/mo</span>
        </span>
        <span className="text-xs text-neutral-500">
          {getWalkTime()} min to Diag
        </span>
      </div>
      
      {/* Address */}
      <h3 className="text-sm text-neutral-900 group-hover:text-neutral-600 transition-colors truncate mb-1">
        {listing.address}
      </h3>
      
      {/* Tags */}
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        <span>{listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms} bed`}</span>
        <span>·</span>
        <span>{listing.neighborhood || listing.city}</span>
      </div>
      
      {/* Posted date */}
      <p className="text-xs text-neutral-400 mt-2">
        Posted {formatDate(listing.createdAt)}
      </p>
    </Link>
  )
}
