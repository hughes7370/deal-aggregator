import { useMemo } from 'react'
import { Listing } from '../listings/types'
import { SortOption } from '../header/SortDropdown'
import { BusinessType } from '../filters/BusinessTypeFilter'
import { Source } from '../filters/SourceFilter'
import { SearchScope } from '../search/SearchBar'

interface FilterState {
  sortBy: SortOption
  priceRange: [number, number]
  revenueRange: [number, number]
  isAnnualRevenue: boolean
  profitRange: [number, number]
  isAnnualProfit: boolean
  multipleRange: [number, number]
  businessTypes: BusinessType[]
  sources: Source[]
  profitMargin: [number, number]
  growthRate: [number, number]
  teamSize: [number, number]
  location: string
  searchQuery: string
  searchScope: SearchScope
}

export function useListingsFilter(listings: Listing[], filters: FilterState) {
  return useMemo(() => {
    let filteredListings = [...listings]
    const totalListings = filteredListings.length
    let filterCounts = {
      price: 0,
      revenue: 0,
      profit: 0,
      multiple: 0,
      businessType: 0,
      source: 0,
      profitMargin: 0,
      growthRate: 0,
      teamSize: 0,
      location: 0,
      search: 0
    }

    // Apply search filter first
    if (filters.searchQuery.length >= 2) {
      filteredListings = filteredListings.filter((listing) => {
        const query = filters.searchQuery.toLowerCase()
        switch (filters.searchScope) {
          case 'title':
            return listing.title.toLowerCase().includes(query)
          case 'description':
            return listing.description.toLowerCase().includes(query)
          case 'location':
            return listing.location?.toLowerCase().includes(query)
          case 'all':
          default:
            return (
              listing.title.toLowerCase().includes(query) ||
              listing.description.toLowerCase().includes(query) ||
              listing.location?.toLowerCase().includes(query)
            )
        }
      })
      filterCounts.search = totalListings - filteredListings.length
    }

    // Threshold values that indicate "greater than"
    const PRICE_THRESHOLD = 10000000 // > $10M
    const REVENUE_THRESHOLD = 5000000 // > $5M
    const PROFIT_THRESHOLD = 5000000 // > $5M
    const MULTIPLE_THRESHOLD = 10 // > 10.0x

    // Apply other filters
    filteredListings = filteredListings.filter((listing) => {
      let shouldInclude = true

      // Price filter
      if (listing.price !== undefined && listing.price !== null) {
        if (filters.priceRange[0] === 0) {
          if (listing.price !== 0 && listing.price > filters.priceRange[1] && filters.priceRange[1] !== PRICE_THRESHOLD) {
            filterCounts.price++;
            shouldInclude = false;
          }
        } else {
          if (listing.price < filters.priceRange[0] || (listing.price > filters.priceRange[1] && filters.priceRange[1] !== PRICE_THRESHOLD)) {
            filterCounts.price++;
            shouldInclude = false;
          }
        }
      }

      // Revenue filter - compare in monthly terms
      const monthlyRevenue = listing.monthlyRevenue
      if (monthlyRevenue !== undefined && monthlyRevenue !== null) {
        const filterMin = filters.isAnnualRevenue ? filters.revenueRange[0] / 12 : filters.revenueRange[0]
        const filterMax = filters.isAnnualRevenue ? filters.revenueRange[1] / 12 : filters.revenueRange[1]
        const thresholdMonthly = filters.isAnnualRevenue ? REVENUE_THRESHOLD / 12 : REVENUE_THRESHOLD

        if (monthlyRevenue < filterMin || (monthlyRevenue > filterMax && filterMax !== thresholdMonthly)) {
          filterCounts.revenue++;
          shouldInclude = false;
        }
      }

      // Profit filter - compare in monthly terms
      const monthlyProfit = listing.monthlyProfit
      if (monthlyProfit !== undefined && monthlyProfit !== null) {
        const filterMin = filters.isAnnualProfit ? filters.profitRange[0] / 12 : filters.profitRange[0]
        const filterMax = filters.isAnnualProfit ? filters.profitRange[1] / 12 : filters.profitRange[1]
        const thresholdMonthly = filters.isAnnualProfit ? PROFIT_THRESHOLD / 12 : PROFIT_THRESHOLD

        if (monthlyProfit < filterMin || (monthlyProfit > filterMax && filterMax !== thresholdMonthly)) {
          filterCounts.profit++;
          shouldInclude = false;
        }
      }

      // Multiple filter
      if (listing.multiple !== undefined && listing.multiple !== null) {
        if (listing.multiple < filters.multipleRange[0] || (listing.multiple > filters.multipleRange[1] && filters.multipleRange[1] !== MULTIPLE_THRESHOLD)) {
          filterCounts.multiple++;
          shouldInclude = false;
        }
      }

      // Business type filter
      if (filters.businessTypes.length > 0 && listing.businessType) {
        const isOtherSelected = filters.businessTypes.includes('other' as BusinessType);
        const isKnownType = ['ecommerce', 'software', 'service'].includes(listing.businessType);
        
        if (!filters.businessTypes.includes(listing.businessType) && !(isOtherSelected && !isKnownType)) {
          filterCounts.businessType++;
          shouldInclude = false;
        }
      }

      // Source filter
      if (filters.sources.length > 0 && listing.source) {
        if (!filters.sources.includes(listing.source)) {
          filterCounts.source++;
          shouldInclude = false;
        }
      }

      // Profit margin filter
      if (listing.profitMargin !== undefined && listing.profitMargin !== null) {
        if (listing.profitMargin < filters.profitMargin[0] || (listing.profitMargin > filters.profitMargin[1] && filters.profitMargin[1] !== 100)) {
          filterCounts.profitMargin++;
          shouldInclude = false;
        }
      }

      // Growth rate filter
      if (listing.growthRate !== undefined && listing.growthRate !== null) {
        if (listing.growthRate < filters.growthRate[0] || listing.growthRate > filters.growthRate[1]) {
          filterCounts.growthRate++;
          shouldInclude = false;
        }
      }

      // Team size filter
      if (listing.teamSize !== undefined && listing.teamSize !== null) {
        if (listing.teamSize < filters.teamSize[0] || listing.teamSize > filters.teamSize[1]) {
          filterCounts.teamSize++;
          shouldInclude = false;
        }
      }

      // Location filter
      if (filters.location && listing.location) {
        if (!listing.location.toLowerCase().includes(filters.location.toLowerCase())) {
          filterCounts.location++;
          shouldInclude = false;
        }
      }

      return shouldInclude;
    })

    // Log filter statistics
    console.log('Filter Statistics:', {
      totalListings,
      remainingListings: filteredListings.length,
      filterCounts
    });

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