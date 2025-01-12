'use client'

import { SortDropdown, type SortOption } from '@/components/dealflow/header/SortDropdown'
import { ResultsCount } from '@/components/dealflow/header/ResultsCount'
import { ActionButtons } from '@/components/dealflow/header/ActionButtons'
import { PriceRangeFilter } from '@/components/dealflow/filters/PriceRangeFilter'
import { RevenueFilter } from '@/components/dealflow/filters/RevenueFilter'
import { ProfitFilter } from '@/components/dealflow/filters/ProfitFilter'
import { BusinessTypeFilter, type BusinessType } from '@/components/dealflow/filters/BusinessTypeFilter'
import { MultipleFilter } from '@/components/dealflow/filters/MultipleFilter'
import { SourceFilter, type Source } from '@/components/dealflow/filters/SourceFilter'
import { AdvancedFilters } from '@/components/dealflow/filters/AdvancedFilters'
import { ListingsGrid } from '@/components/dealflow/listings/ListingsGrid'
import { PageSizeSelector } from '@/components/dealflow/listings/PageSizeSelector'
import { useListingsFilter } from '@/components/dealflow/hooks/useListingsFilter'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useUser, useAuth } from "@clerk/nextjs"
import { SearchBar, type SearchScope } from '@/components/dealflow/search/SearchBar'

// Initialize Supabase client with auth configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export default function DealFlowPage() {
  const { user } = useUser()
  const { getToken } = useAuth()
  const [supabaseClient, setSupabaseClient] = useState(() => 
    createClient(supabaseUrl, supabaseAnonKey)
  )

  // Set up authenticated Supabase client
  useEffect(() => {
    const setupSupabase = async () => {
      if (!user) {
        console.log('No user found, using anonymous Supabase client')
        return
      }

      try {
        // Get token with specific template
        const token = await getToken({ template: "supabase" })
        
        if (!token) {
          console.error('Failed to get Clerk JWT token')
          return
        }

        // Create a new Supabase client with the token
        const authenticatedClient = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: false
          },
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        })

        console.log('Created authenticated Supabase client')
        setSupabaseClient(authenticatedClient)

        // Test the authenticated client
        const { data: testData, error: testError } = await authenticatedClient
          .from('user_saved_listings')
          .select('count')
          .single()

        if (testError) {
          console.error('Authentication test failed:', testError)
          throw testError
        }

        console.log('Authentication test successful:', testData)

      } catch (error) {
        console.error('Error in Supabase auth setup:', error)
      }
    }

    setupSupabase()
  }, [user, getToken])

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | undefined>()
  const [listings, setListings] = useState<any[]>([])
  const [savedListings, setSavedListings] = useState<Set<string>>(new Set())
  const [savingListings, setSavingListings] = useState<Set<string>>(new Set())
  const [hiddenListings, setHiddenListings] = useState<Set<string>>(new Set())
  const [hidingListings, setHidingListings] = useState<Set<string>>(new Set())

  // View state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [pageSize, setPageSize] = useState(9)

  // State for filters
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]) // $10M
  const [revenueRange, setRevenueRange] = useState<[number, number]>([0, 5000000]) // $5M
  const [isAnnualRevenue, setIsAnnualRevenue] = useState(true)
  const [multipleRange, setMultipleRange] = useState<[number, number]>([0, 10]) // 10.0x
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([])
  const [sources, setSources] = useState<Source[]>([])

  // Advanced filters state
  const [profitMargin, setProfitMargin] = useState<[number, number]>([-100, 100]) // -100% to 100%
  const [growthRate, setGrowthRate] = useState<[number, number]>([-100, 1000]) // -100% to >1000%
  const [teamSize, setTeamSize] = useState<[number, number]>([0, 1000]) // 0 to >1000 people
  const [location, setLocation] = useState('')

  // Profit filter state
  const [profitRange, setProfitRange] = useState<[number, number]>([0, 5000000])
  const [isAnnualProfit, setIsAnnualProfit] = useState(true)

  // Add search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchScope, setSearchScope] = useState<SearchScope>('all')

  // Add state for mobile filter visibility
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  // Function to fetch listings from Supabase
  const fetchListings = async () => {
    try {
      setIsLoading(true)
      const { data, error: supabaseError } = await supabaseClient
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })

      if (supabaseError) {
        throw supabaseError
      }

      // Transform the data to match our expected format
      const transformedListings = data.map(listing => {
        // Debug log
        console.log('Raw listing data:', {
          industry: listing.industry,
          source_platform: listing.source_platform
        });

        // Clean up location data - completely remove "00" values
        let cleanLocation = ''
        if (listing.location && listing.location !== '00') {
          cleanLocation = listing.location.trim()
          if (cleanLocation === '00') cleanLocation = ''
        }

        // Calculate time listed
        const timeDiff = Date.now() - new Date(listing.created_at).getTime();
        const hoursListed = Math.floor(timeDiff / (1000 * 60 * 60));
        const daysListed = Math.floor(hoursListed / 24);

        // Normalize source platform
        const normalizeSource = (source: string): Source => {
          const sourceMap: { [key: string]: Source } = {
            'BusinessExits': 'business_exits',
            'EmpireFlippers': 'empire_flippers',
            'Flippa': 'flippa',
            'Acquire': 'acquire',
            'WebsiteClosers': 'website_closers',
            'VikingMergers': 'viking_mergers',
            'Latonas': 'latonas',
            'BizBuySell': 'bizbuysell',
            'QuietLight': 'quietlight',
            'TransWorld': 'transworld',
            'Sunbelt': 'sunbelt'
          }
          return sourceMap[source] || source.toLowerCase() as Source
        }

        // Normalize business type
        const normalizeBusinessType = (type: string): BusinessType => {
          const typeMap: { [key: string]: BusinessType } = {
            'Ecommerce': 'ecommerce',
            'E-commerce': 'ecommerce',
            'SaaS': 'software',
            'Software': 'software',
            'Service': 'service',
            'Services': 'service'
          }
          return typeMap[type] || 'other' as BusinessType
        }

        return {
          id: listing.id,
          title: listing.title,
          description: listing.description || '',
          price: listing.asking_price || 0,
          monthlyRevenue: listing.revenue ? Math.round(listing.revenue / 12) : 0,
          monthlyProfit: listing.ebitda ? Math.round(listing.ebitda / 12) : 0,
          multiple: listing.selling_multiple || 0,
          ageYears: listing.business_age || 0,
          businessType: normalizeBusinessType(listing.industry),
          source: normalizeSource(listing.source_platform),
          daysListed,
          hoursListed,
          profitMargin: listing.profit_margin || 0,
          growthRate: 0, // Placeholder for growth rate
          teamSize: listing.number_of_employees || 0,
          location: cleanLocation,
          originalListingUrl: listing.original_listing_url || '',
          created_at: listing.created_at,
        }
      })

      setListings(transformedListings)
      setError(undefined)
    } catch (err) {
      console.error('Error fetching listings:', err)
      setError('Failed to load listings. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Function to fetch saved listings
  const fetchSavedListings = async () => {
    try {
      if (!user) {
        console.error('User not authenticated')
        return
      }

      // Get fresh token and client for this operation
      const token = await getToken({ template: "supabase" })
      if (!token) {
        throw new Error('Failed to get authentication token')
      }

      const client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      })

      // Log user info for debugging
      console.log('Clerk User ID:', user.id)
      console.log('Clerk User:', {
        id: user.id,
        primaryEmailAddress: user.primaryEmailAddress,
        publicMetadata: user.publicMetadata
      })

      // Use the email as the user identifier instead of Clerk's ID
      const userEmail = user.primaryEmailAddress?.emailAddress
      if (!userEmail) {
        throw new Error('No email address found for user')
      }

      const { data: savedData, error: savedError } = await client
        .from('user_saved_listings')
        .select('listing_id')
        .eq('user_id', user.id)
        .eq('user_email', userEmail)

      if (savedError) {
        console.error('Error fetching saved listings:', savedError)
        throw savedError
      }

      const savedIds = new Set(savedData.map(item => item.listing_id))
      setSavedListings(savedIds)
    } catch (err) {
      console.error('Error fetching saved listings:', err)
    }
  }

  // Function to fetch hidden listings
  const fetchHiddenListings = async () => {
    try {
      if (!user) {
        console.error('User not authenticated')
        return
      }

      // Get fresh token and client for this operation
      const token = await getToken({ template: "supabase" })
      if (!token) {
        throw new Error('Failed to get authentication token')
      }

      const client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      })

      const userEmail = user.primaryEmailAddress?.emailAddress
      if (!userEmail) {
        throw new Error('No email address found for user')
      }

      const { data: hiddenData, error: hiddenError } = await client
        .from('user_hidden_listings')
        .select('listing_id')
        .eq('user_email', userEmail)

      if (hiddenError) {
        console.error('Error fetching hidden listings:', hiddenError)
        throw hiddenError
      }

      const hiddenIds = new Set(hiddenData.map(item => item.listing_id))
      setHiddenListings(hiddenIds)
    } catch (err) {
      console.error('Error fetching hidden listings:', err)
    }
  }

  // Initial data loading
  useEffect(() => {
    fetchListings()
    if (user) {
      fetchSavedListings()
      fetchHiddenListings()
    }
  }, [user])

  // Apply filters and exclude hidden listings
  const filteredListings = useListingsFilter(
    listings.filter(listing => !hiddenListings.has(listing.id)),
    {
      sortBy,
      priceRange,
      revenueRange,
      isAnnualRevenue,
      profitRange,
      isAnnualProfit,
      multipleRange,
      businessTypes,
      sources,
      profitMargin,
      growthRate,
      teamSize,
      location,
      searchQuery,
      searchScope,
    }
  )

  const handleSaveSearch = () => {
    const searchConfig = {
      sortBy,
      priceRange,
      revenueRange,
      multipleRange,
      businessTypes,
      sources,
      profitMargin,
      growthRate,
      teamSize,
      location,
    }
    console.log('Save search config:', searchConfig)
  }

  const handleRefreshData = async () => {
    await fetchListings()
  }

  const handleSaveListing = async (id: string) => {
    try {
      if (!user) {
        console.error('Error: User not authenticated')
        return
      }

      // Set saving state immediately
      setSavingListings(prev => new Set([...prev, id]))

      // Get fresh token
      const token = await getToken({ template: "supabase" })
      if (!token) {
        throw new Error('Failed to get authentication token')
      }

      // Get user email
      const userEmail = user.primaryEmailAddress?.emailAddress
      if (!userEmail) {
        throw new Error('No email address found for user')
      }

      // Create fresh client
      const freshClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      })

      if (savedListings.has(id)) {
        console.log('Removing listing from saved...')
        const { error: deleteError } = await freshClient
          .from('user_saved_listings')
          .delete()
          .eq('listing_id', id)
          .eq('user_id', user.id)
          .eq('user_email', userEmail)

        if (deleteError) {
          console.error('Failed to delete saved listing:', deleteError)
          throw deleteError
        }

        setSavedListings(prev => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      } else {
        console.log('Adding listing to saved...')
        const { error: insertError } = await freshClient
          .from('user_saved_listings')
          .insert([
            {
              listing_id: id,
              user_id: user.id,
              user_email: userEmail,
              saved_at: new Date().toISOString(),
            }
          ])

        if (insertError) {
          console.error('Failed to save listing:', insertError)
          throw insertError
        }

        setSavedListings(prev => new Set([...prev, id]))
      }
    } catch (error) {
      console.error('Save listing operation failed:', error)
      // Revert UI state on error
      setSavedListings(prev => {
        const next = new Set(prev)
        if (next.has(id)) {
          next.delete(id)
        } else {
          next.add(id)
        }
        return next
      })
    } finally {
      setSavingListings(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const handleHideListing = async (id: string) => {
    try {
      if (!user) {
        console.error('Error: User not authenticated')
        return
      }

      // Set hiding state immediately
      setHidingListings(prev => new Set([...prev, id]))

      // Get fresh token
      const token = await getToken({ template: "supabase" })
      if (!token) {
        throw new Error('Failed to get authentication token')
      }

      // Get user email
      const userEmail = user.primaryEmailAddress?.emailAddress
      if (!userEmail) {
        throw new Error('No email address found for user')
      }

      // Create fresh client
      const freshClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      })

      if (hiddenListings.has(id)) {
        console.log('Unhiding listing...')
        const { error: deleteError } = await freshClient
          .from('user_hidden_listings')
          .delete()
          .eq('listing_id', id)
          .eq('user_email', userEmail)

        if (deleteError) {
          console.error('Failed to unhide listing:', deleteError)
          throw deleteError
        }

        setHiddenListings(prev => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      } else {
        console.log('Hiding listing...')
        const { error: insertError } = await freshClient
          .from('user_hidden_listings')
          .insert([
            {
              listing_id: id,
              user_email: userEmail,
              hidden_at: new Date().toISOString(),
            }
          ])

        if (insertError) {
          console.error('Failed to hide listing:', insertError)
          throw insertError
        }

        setHiddenListings(prev => new Set([...prev, id]))
      }
    } catch (error) {
      console.error('Hide listing operation failed:', error)
      // Revert UI state on error
      setHiddenListings(prev => {
        const next = new Set(prev)
        if (next.has(id)) {
          next.delete(id)
        } else {
          next.add(id)
        }
        return next
      })
    } finally {
      setHidingListings(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const handleRevenueToggle = (newIsAnnual: boolean) => {
    setIsAnnualRevenue(newIsAnnual)
    // Convert the values between annual and monthly
    const multiplier = isAnnualRevenue ? 1/12 : 12
    setRevenueRange([revenueRange[0] * multiplier, revenueRange[1] * multiplier])
  }

  const handleProfitToggle = (newIsAnnual: boolean) => {
    setIsAnnualProfit(newIsAnnual)
    // Convert the values between annual and monthly
    const multiplier = isAnnualProfit ? 1/12 : 12
    setProfitRange([profitRange[0] * multiplier, profitRange[1] * multiplier])
  }

  // Add search handler
  const handleSearch = (query: string, scope: SearchScope) => {
    setSearchQuery(query)
    setSearchScope(scope)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <h1 className="text-2xl font-semibold text-gray-900">Deal Flow</h1>
              <button
                onClick={() => setIsMobileFiltersOpen(true)}
                className="sm:hidden ml-auto inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 7a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 7a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                <span className="ml-1">Filters</span>
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="w-full sm:w-96">
                <SearchBar
                  onSearch={setSearchQuery}
                  onScopeChange={setSearchScope}
                  placeholder="Search listings..."
                />
              </div>
              <div className="flex items-center gap-2">
                <SortDropdown value={sortBy} onChange={setSortBy} />
                <ResultsCount count={filteredListings.length} />
                <ActionButtons
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  onRefresh={handleRefreshData}
                  onSaveSearch={handleSaveSearch}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile filter dialog */}
      <div className={`fixed inset-0 z-40 sm:hidden ${isMobileFiltersOpen ? 'block' : 'hidden'}`}>
        {/* Overlay */}
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsMobileFiltersOpen(false)} />
        
        {/* Slide-out panel */}
        <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-xl">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="space-y-8">
                <PriceRangeFilter value={priceRange} onChange={setPriceRange} />
                <RevenueFilter
                  value={revenueRange}
                  onChange={setRevenueRange}
                  isAnnual={isAnnualRevenue}
                  onIsAnnualChange={handleRevenueToggle}
                />
                <ProfitFilter
                  value={profitRange}
                  onChange={setProfitRange}
                  isAnnual={isAnnualProfit}
                  onIsAnnualChange={handleProfitToggle}
                />
                <BusinessTypeFilter selected={businessTypes} onChange={setBusinessTypes} />
                <MultipleFilter value={multipleRange} onChange={setMultipleRange} />
                <SourceFilter selected={sources} onChange={setSources} />
                <AdvancedFilters
                  profitMargin={profitMargin}
                  onProfitMarginChange={setProfitMargin}
                  growthRate={growthRate}
                  onGrowthRateChange={setGrowthRate}
                  teamSize={teamSize}
                  onTeamSizeChange={setTeamSize}
                  location={location}
                  onLocationChange={setLocation}
                />
              </div>
            </div>
            <div className="border-t border-gray-200 px-4 py-3">
              <button
                onClick={() => {
                  setPriceRange([0, 10000000])
                  setRevenueRange([0, 5000000])
                  setProfitRange([0, 5000000])
                  setMultipleRange([0, 10])
                  setBusinessTypes([])
                  setSources([])
                  setProfitMargin([-100, 100])
                  setGrowthRate([-100, 1000])
                  setTeamSize([0, 1000])
                  setLocation('')
                  setSearchQuery('')
                  setIsMobileFiltersOpen(false)
                }}
                className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
          {/* Left Sidebar - Hidden on mobile */}
          <aside className="hidden sm:block w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-[140px] transition-shadow hover:shadow-md">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                  <button 
                    onClick={() => {
                      setPriceRange([0, 10000000])
                      setRevenueRange([0, 5000000])
                      setProfitRange([0, 5000000])
                      setMultipleRange([0, 10])
                      setBusinessTypes([])
                      setSources([])
                      setProfitMargin([-100, 100])
                      setGrowthRate([-100, 1000])
                      setTeamSize([0, 1000])
                      setLocation('')
                      setSearchQuery('')
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Clear All
                  </button>
                </div>

                <PriceRangeFilter value={priceRange} onChange={setPriceRange} />
                <RevenueFilter
                  value={revenueRange}
                  onChange={setRevenueRange}
                  isAnnual={isAnnualRevenue}
                  onIsAnnualChange={handleRevenueToggle}
                />
                <ProfitFilter
                  value={profitRange}
                  onChange={setProfitRange}
                  isAnnual={isAnnualProfit}
                  onIsAnnualChange={handleProfitToggle}
                />
                <BusinessTypeFilter selected={businessTypes} onChange={setBusinessTypes} />
                <MultipleFilter value={multipleRange} onChange={setMultipleRange} />
                <SourceFilter selected={sources} onChange={setSources} />
                <AdvancedFilters
                  profitMargin={profitMargin}
                  onProfitMarginChange={setProfitMargin}
                  growthRate={growthRate}
                  onGrowthRateChange={setGrowthRate}
                  teamSize={teamSize}
                  onTeamSizeChange={setTeamSize}
                  location={location}
                  onLocationChange={setLocation}
                />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 transition-shadow hover:shadow-md">
              <ListingsGrid
                listings={filteredListings}
                isLoading={isLoading}
                error={error}
                onRetry={handleRefreshData}
                onSaveListing={handleSaveListing}
                onHideListing={handleHideListing}
                viewMode={viewMode}
                pageSize={pageSize}
                savedListings={savedListings}
                savingListings={savingListings}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 