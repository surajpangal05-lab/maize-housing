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
  const [isExpanded, setIsExpanded] = useState(false)
  
  const updateFilter = (key: keyof SearchFiltersType, value: unknown) => {
    onFilterChange({ ...filters, [key]: value })
  }
  
  const toggleTermTag = (tag: TermTag) => {
    const currentTags = filters.termTags || []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]
    updateFilter('termTags', newTags.length > 0 ? newTags : undefined)
  }
  
  const setOnlyTermTag = (tag: TermTag | null) => {
    updateFilter('termTags', tag ? [tag] : undefined)
  }
  
  const clearFilters = () => {
    onFilterChange({})
  }
  
  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '' && (Array.isArray(v) ? v.length > 0 : true))

  return (
    <div className="card">
      {/* Term Tags - Segmented Control (Always Visible) */}
      <div className="p-4 border-b border-neutral-100">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-neutral-500 mr-2">Term:</span>
          <div className="inline-flex rounded-lg bg-neutral-100 p-1">
            <button
              onClick={() => setOnlyTermTag(null)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                !filters.termTags?.length
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              All
            </button>
            {TERM_TAGS.filter(t => t !== 'FULL_YEAR').map(tag => (
              <button
                key={tag}
                onClick={() => setOnlyTermTag(tag)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  filters.termTags?.length === 1 && filters.termTags.includes(tag)
                    ? 'bg-[#FFCB05] text-[#00274C] shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {getTermTagLabel(tag)}
              </button>
            ))}
          </div>
          
          {/* Full Year toggle */}
          <label className="flex items-center gap-2 ml-4 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.termTags?.includes('FULL_YEAR') || false}
              onChange={(e) => {
                if (e.target.checked) {
                  toggleTermTag('FULL_YEAR')
                } else {
                  updateFilter('termTags', filters.termTags?.filter(t => t !== 'FULL_YEAR'))
                }
              }}
              className="rounded border-neutral-300 text-[#00274C] focus:ring-[#FFCB05]"
            />
            <span className="text-sm text-neutral-600">Full Year</span>
          </label>
        </div>
      </div>
      
      {/* Main Filters Row */}
      <div className="p-4 flex flex-wrap items-center gap-3">
        {/* Listing Type */}
        <select
          value={filters.type || ''}
          onChange={(e) => updateFilter('type', e.target.value || undefined)}
          className="input w-auto min-w-[8rem]"
        >
          <option value="">All Types</option>
          {LISTING_TYPES.map(type => (
            <option key={type} value={type}>
              {type === 'SUBLEASE' ? 'Sublease' : 'Rental'}
            </option>
          ))}
        </select>
        
        {/* Price Range */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min $"
            value={filters.minRent || ''}
            onChange={(e) => updateFilter('minRent', e.target.value ? Number(e.target.value) : undefined)}
            className="input w-24"
          />
          <span className="text-neutral-400 text-sm">–</span>
          <input
            type="number"
            placeholder="Max $"
            value={filters.maxRent || ''}
            onChange={(e) => updateFilter('maxRent', e.target.value ? Number(e.target.value) : undefined)}
            className="input w-24"
          />
        </div>
        
        {/* Bedrooms */}
        <select
          value={filters.bedrooms ?? ''}
          onChange={(e) => updateFilter('bedrooms', e.target.value ? Number(e.target.value) : undefined)}
          className="input w-auto min-w-[7rem]"
        >
          <option value="">Beds</option>
          <option value="0">Studio</option>
          <option value="1">1 Bed</option>
          <option value="2">2 Beds</option>
          <option value="3">3 Beds</option>
          <option value="4">4+ Beds</option>
        </select>
        
        {/* Property Type */}
        <select
          value={filters.propertyType || ''}
          onChange={(e) => updateFilter('propertyType', e.target.value as PropertyType || undefined)}
          className="input w-auto min-w-[8rem]"
        >
          <option value="">Property</option>
          {PROPERTY_TYPES.map(type => (
            <option key={type} value={type}>{getPropertyTypeLabel(type)}</option>
          ))}
        </select>
        
        {/* Verified Only */}
        <label className="flex items-center gap-2 px-3 h-11 bg-white border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors">
          <input
            type="checkbox"
            checked={filters.verifiedOnly || false}
            onChange={(e) => updateFilter('verifiedOnly', e.target.checked || undefined)}
            className="rounded border-neutral-300 text-[#00274C] focus:ring-[#FFCB05]"
          />
          <span className="text-sm text-neutral-700 font-medium whitespace-nowrap">Verified Only</span>
        </label>
        
        {/* Expand/Collapse */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="btn btn-ghost"
        >
          {isExpanded ? 'Less' : 'More'}
          <svg 
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm font-medium text-red-600 hover:text-red-700 px-3 py-2 hover:bg-red-50 rounded-lg transition-colors"
          >
            Clear all
          </button>
        )}
      </div>
      
      {/* Expanded Filters */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-neutral-100 animate-fade-in">
          <div className="pt-4 space-y-5">
            {/* Multi-select Term Tags */}
            <div>
              <label className="label">Select Multiple Terms</label>
              <div className="flex flex-wrap gap-2">
                {TERM_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTermTag(tag)}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      filters.termTags?.includes(tag)
                        ? 'bg-[#FFCB05] text-[#00274C]'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {getTermTagLabel(tag)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Move-in Date Range */}
            <div>
              <label className="label">Move-in Window</label>
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="date"
                  value={filters.moveInStart || ''}
                  onChange={(e) => updateFilter('moveInStart', e.target.value || undefined)}
                  className="input w-auto"
                />
                <span className="text-neutral-400 text-sm">to</span>
                <input
                  type="date"
                  value={filters.moveInEnd || ''}
                  onChange={(e) => updateFilter('moveInEnd', e.target.value || undefined)}
                  className="input w-auto"
                />
              </div>
            </div>
            
            {/* Neighborhood */}
            <div>
              <label className="label">Neighborhood</label>
              <input
                type="text"
                placeholder="e.g., Central Campus, Kerrytown..."
                value={filters.neighborhood || ''}
                onChange={(e) => updateFilter('neighborhood', e.target.value || undefined)}
                className="input max-w-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Empty State Component
export function EmptyListingsState({ 
  onClearFilters, 
  hasFilters 
}: { 
  onClearFilters: () => void
  hasFilters: boolean 
}) {
  return (
    <div className="card p-16 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">No listings found</h3>
      <p className="text-neutral-500 mb-6 max-w-md mx-auto">
        {hasFilters ? (
          <>
            Try adjusting your filters. You might find more results by:
            <span className="block mt-2 text-sm">
              • Selecting a different term or "All" terms<br />
              • Expanding your price range<br />
              • Removing the "Verified Only" filter
            </span>
          </>
        ) : (
          "There are no listings available right now. Check back soon or be the first to post!"
        )}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {hasFilters && (
          <button 
            onClick={onClearFilters} 
            className="btn btn-outline"
          >
            Clear Filters
          </button>
        )}
        <Link href="/listings/create" className="btn btn-primary">
          Post a Listing
        </Link>
      </div>
    </div>
  )
}
