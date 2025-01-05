import { useMemo } from 'react'
import { Listing } from '../listings/types'
import { SortOption } from '../header/SortDropdown'
import { BusinessType } from '../filters/BusinessTypeFilter'
import { Source } from '../filters/SourceFilter'

interface FilterState {
  sortBy: SortOption
  priceRange: [number, number]
  revenueRange: [number, number]
  isAnnualRevenue: boolean
  multipleRange: [number, number]
  businessTypes: BusinessType[]
  sources: Source[]
  profitMargin: [number, number]
  growthRate: [number, number]
  teamSize: [number, number]
  location: string
}

export function useListingsFilter(listings: Listing[], filters: FilterState) {
  return useMemo(() => {
    let filteredListings = [...listings]

    // Apply filters
    filteredListings = filteredListings.filter((listing) => {
      // Price filter - include 0 if the range starts at 0
      if (filters.priceRange[0] === 0) {
        if (listing.price === 0) return true;
        if (listing.price > filters.priceRange[1]) return false;
      } else {
        if (listing.price < filters.priceRange[0] || listing.price > filters.priceRange[1]) return false;
      }

      // Revenue filter - compare in monthly terms and include 0 if the range starts at 0
      const monthlyRevenue = listing.monthlyRevenue
      const filterMin = filters.isAnnualRevenue ? filters.revenueRange[0] / 12 : filters.revenueRange[0]
      const filterMax = filters.isAnnualRevenue ? filters.revenueRange[1] / 12 : filters.revenueRange[1]
      
      if (filterMin === 0) {
        if (monthlyRevenue > filterMax) return false;
      } else {
        if (monthlyRevenue < filterMin || monthlyRevenue > filterMax) return false;
      }

      // Multiple filter - include 0 if the range starts at 0
      if (filters.multipleRange[0] === 0) {
        if (listing.multiple === 0) return true;
        if (listing.multiple > filters.multipleRange[1]) return false;
      } else {
        if (listing.multiple < filters.multipleRange[0] || listing.multiple > filters.multipleRange[1]) return false;
      }

      // Business type filter
      if (filters.businessTypes.length > 0 && !filters.businessTypes.includes(listing.businessType)) {
        console.log('Filtering out listing due to business type:', {
          listingType: listing.businessType,
          allowedTypes: filters.businessTypes
        });
        return false
      }

      // Source filter
      if (filters.sources.length > 0 && !filters.sources.includes(listing.source)) {
        console.log('Filtering out listing due to source:', {
          listingSource: listing.source,
          allowedSources: filters.sources
        });
        return false
      }

      // Profit margin filter
      if (listing.profitMargin !== undefined) {
        if (listing.profitMargin < filters.profitMargin[0] || listing.profitMargin > filters.profitMargin[1]) {
          return false
        }
      }

      // Growth rate filter
      if (listing.growthRate !== undefined) {
        if (listing.growthRate < filters.growthRate[0] || listing.growthRate > filters.growthRate[1]) {
          return false
        }
      }

      // Team size filter
      if (listing.teamSize !== undefined) {
        if (listing.teamSize < filters.teamSize[0] || listing.teamSize > filters.teamSize[1]) {
          return false
        }
      }

      // Location filter
      if (filters.location && listing.location) {
        if (!listing.location.toLowerCase().includes(filters.location.toLowerCase())) {
          return false
        }
      }

      return true
    })

    // Apply sorting
    filteredListings.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'price_high_low':
          return b.price - a.price
        case 'price_low_high':
          return a.price - b.price
        case 'revenue_high_low':
          return b.monthlyRevenue - a.monthlyRevenue
        case 'revenue_low_high':
          return a.monthlyRevenue - b.monthlyRevenue
        default:
          return 0
      }
    })

    return filteredListings
  }, [listings, filters])
} 