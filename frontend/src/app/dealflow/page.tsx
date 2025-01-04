'use client'

import { SortDropdown, type SortOption } from '@/components/dealflow/header/SortDropdown'
import { ResultsCount } from '@/components/dealflow/header/ResultsCount'
import { ActionButtons } from '@/components/dealflow/header/ActionButtons'
import { PriceRangeFilter } from '@/components/dealflow/filters/PriceRangeFilter'
import { RevenueFilter } from '@/components/dealflow/filters/RevenueFilter'
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
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000])
  const [revenueRange, setRevenueRange] = useState<[number, number]>([0, 12000000])
  const [isAnnualRevenue, setIsAnnualRevenue] = useState(true)
  const [multipleRange, setMultipleRange] = useState<[number, number]>([1, 10])
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([])
  const [sources, setSources] = useState<Source[]>([])

  // Advanced filters state
  const [profitMargin, setProfitMargin] = useState<[number, number]>([0, 100])
  const [growthRate, setGrowthRate] = useState<[number, number]>([-50, 200])
  const [teamSize, setTeamSize] = useState<[number, number]>([0, 100])
  const [location, setLocation] = useState('')

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
          daysListed: Math.max(0, Math.floor((Date.now() - new Date(listing.first_seen_at).getTime()) / (1000 * 60 * 60 * 24))),
          profitMargin: listing.profit_margin || 0,
          growthRate: 0, // Placeholder for growth rate
          teamSize: listing.number_of_employees || 0,
          location: cleanLocation,
          originalListingUrl: listing.original_listing_url || '',
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
      multipleRange,
      businessTypes,
      sources,
      profitMargin,
      growthRate,
      teamSize,
      location,
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

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold text-gray-900">Deal Flow</h1>
              <SortDropdown value={sortBy} onChange={setSortBy} />
              <ResultsCount showing={filteredListings.length} total={listings.length} />
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <PageSizeSelector pageSize={pageSize} onPageSizeChange={setPageSize} />
                <div className="h-6 w-px bg-gray-200" />
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">View:</span>
                  <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm ${
                        viewMode === 'grid'
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm ${
                        viewMode === 'list'
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      List
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSaveSearch}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Save Search
                </button>
                <button
                  onClick={handleRefreshData}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <aside className="w-72 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-[84px]">
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                
                <PriceRangeFilter
                  value={priceRange}
                  onChange={setPriceRange}
                />

                <RevenueFilter
                  value={revenueRange}
                  onChange={setRevenueRange}
                  isAnnual={isAnnualRevenue}
                  onIsAnnualChange={handleRevenueToggle}
                />

                <BusinessTypeFilter
                  selected={businessTypes}
                  onChange={setBusinessTypes}
                />

                <MultipleFilter
                  value={multipleRange}
                  onChange={setMultipleRange}
                />

                <SourceFilter
                  selected={sources}
                  onChange={setSources}
                />

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
          <div className="flex-1">
            {/* Listings Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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