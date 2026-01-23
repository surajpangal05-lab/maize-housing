'use client'

import { useState } from 'react'
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
  
  const clearFilters = () => {
    onFilterChange({})
  }
  
  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '' && (Array.isArray(v) ? v.length > 0 : true))

  return (
    <div className="card">
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
            {/* Term Tags */}
            <div>
              <label className="label">Academic Term</label>
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
