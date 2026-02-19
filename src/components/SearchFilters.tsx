'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SearchFilters as SearchFiltersType, TermTag, PropertyType, ListingType } from '@/lib/types'
import { getTermTagLabel, getPropertyTypeLabel } from '@/lib/utils'

interface SearchFiltersProps {
  filters: SearchFiltersType
  onFilterChange: (filters: SearchFiltersType) => void
}

const TERM_TAGS: TermTag[] = ['FALL', 'WINTER', 'SPRING', 'SUMMER', 'FULL_YEAR']
const PROPERTY_TYPES: PropertyType[] = ['APARTMENT', 'HOUSE', 'ROOM', 'STUDIO', 'TOWNHOUSE']
const LISTING_TYPES: ListingType[] = ['SUBLEASE', 'RENTAL']

export default function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  const [expanded, setExpanded] = useState(false)

  const update = (key: keyof SearchFiltersType, value: unknown) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const toggleTerm = (tag: TermTag) => {
    const cur = filters.termTags || []
    const next = cur.includes(tag) ? cur.filter(t => t !== tag) : [...cur, tag]
    update('termTags', next.length > 0 ? next : undefined)
  }

  const clear = () => onFilterChange({})
  const hasActive = Object.values(filters).some(v => v !== undefined && v !== '' && (Array.isArray(v) ? v.length > 0 : true))

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      {/* Main filter row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search / Neighborhood */}
        <div className="lg:col-span-2">
          <label className="label">Search</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Search by location or keywords..."
              value={filters.neighborhood || ''}
              onChange={(e) => update('neighborhood', e.target.value || undefined)}
              className="input pl-10"
            />
          </div>
        </div>

        {/* Listing Type */}
        <div>
          <label className="label">Listing Type</label>
          <select value={filters.type || ''} onChange={(e) => update('type', e.target.value || undefined)} className="input">
            <option value="">All Types</option>
            {LISTING_TYPES.map(type => (
              <option key={type} value={type}>{type === 'SUBLEASE' ? 'Sublease' : 'Rental'}</option>
            ))}
          </select>
        </div>

        {/* Bedrooms */}
        <div>
          <label className="label">Bedrooms</label>
          <select value={filters.bedrooms ?? ''} onChange={(e) => update('bedrooms', e.target.value ? Number(e.target.value) : undefined)} className="input">
            <option value="">Any</option>
            <option value="0">Studio</option>
            <option value="1">1 Bed</option>
            <option value="2">2 Beds</option>
            <option value="3">3 Beds</option>
            <option value="4">4+ Beds</option>
          </select>
        </div>
      </div>

      {/* Price range row */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="label">Price Range</label>
          <div className="flex items-center gap-2">
            <input type="number" placeholder="Min $" value={filters.minRent || ''} onChange={(e) => update('minRent', e.target.value ? Number(e.target.value) : undefined)} className="input" />
            <span className="text-gray-400">–</span>
            <input type="number" placeholder="Max $" value={filters.maxRent || ''} onChange={(e) => update('maxRent', e.target.value ? Number(e.target.value) : undefined)} className="input" />
          </div>
        </div>

        <div>
          <label className="label">Property Type</label>
          <select value={filters.propertyType || ''} onChange={(e) => update('propertyType', e.target.value as PropertyType || undefined)} className="input">
            <option value="">Any</option>
            {PROPERTY_TYPES.map(type => (
              <option key={type} value={type}>{getPropertyTypeLabel(type)}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-3">
          <label className="flex items-center gap-2 h-[2.75rem] px-4 bg-white border border-gray-300 rounded-[var(--radius)] cursor-pointer hover:bg-gray-50 transition-colors">
            <input type="checkbox" checked={filters.verifiedOnly || false} onChange={(e) => update('verifiedOnly', e.target.checked || undefined)} />
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Verified Only</span>
          </label>

          <button onClick={() => setExpanded(!expanded)} className="h-[2.75rem] px-4 border border-gray-300 rounded-[var(--radius)] text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            {expanded ? 'Less' : 'More'}
          </button>

          {hasActive && (
            <button onClick={clear} className="h-[2.75rem] px-4 text-sm font-medium text-red-600 hover:bg-red-50 rounded-[var(--radius)] transition-colors">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Expanded: term tags + dates */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 animate-fade-in">
          <div>
            <label className="label">Academic Term</label>
            <div className="flex flex-wrap gap-2">
              {TERM_TAGS.map(tag => (
                <button key={tag} onClick={() => toggleTerm(tag)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                  filters.termTags?.includes(tag)
                    ? 'border-[#FFCB05] bg-[#FFCB05] text-[#00274C]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                  {getTermTagLabel(tag)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Move-in Window</label>
            <div className="flex items-center gap-2 flex-wrap">
              <input type="date" value={filters.moveInStart || ''} onChange={(e) => update('moveInStart', e.target.value || undefined)} className="input w-auto" />
              <span className="text-gray-400 text-sm">to</span>
              <input type="date" value={filters.moveInEnd || ''} onChange={(e) => update('moveInEnd', e.target.value || undefined)} className="input w-auto" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function EmptyListingsState({ onClearFilters, hasFilters }: { onClearFilters: () => void; hasFilters: boolean }) {
  return (
    <div className="text-center py-16 bg-white rounded-lg shadow-sm">
      <p className="text-gray-500 text-xl mb-2">No listings found matching your criteria.</p>
      <p className="text-gray-400 mb-6">Try adjusting your filters or search terms.</p>
      <div className="flex gap-3 justify-center">
        {hasFilters && <button onClick={onClearFilters} className="btn btn-outline">Clear Filters</button>}
        <Link href="/listings/create" className="btn btn-primary">Post a Listing</Link>
      </div>
    </div>
  )
}
