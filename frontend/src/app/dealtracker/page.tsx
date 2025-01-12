'use client';

import { useState, useEffect, useMemo } from 'react';
import { FunnelIcon, ArrowsUpDownIcon, ArrowDownTrayIcon, CheckIcon } from '@heroicons/react/24/outline';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import DealRow from '@/components/dealtracker/DealRow';
import FilterControls from '@/components/dealtracker/controls/FilterControls';
import { useUser, useAuth } from "@clerk/nextjs";
import { createClient } from '@supabase/supabase-js';
import { SearchBar, SearchScope } from '@/components/dealflow/search/SearchBar';
import SelectField from '@/components/dealtracker/SelectField';

type SortField = 'business_name' | 'asking_price' | 'business_type' | 'status' | 'next_steps' | 'priority' | 'last_updated';
type SortDirection = 'asc' | 'desc';

interface Filters {
  status?: string[];
  priority?: string[];
  type?: string[];
  next_steps?: string[];
}

interface SavedListing {
  id: string;
  user_email: string;
  listing_id: string;
  listings: {
    id: string;
    title: string;
    asking_price: number;
    business_model: string;
    source_platform: string;
  };
  deal_tracker?: {
    id: string;
    status: string;
    next_steps: string;
    priority: string;
    notes: string;
    last_updated: string;
    created_at: string;
  } | null;
  selected?: boolean;
}

// Initialize Supabase client with auth configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function DealTracker() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: SortDirection }>({
    field: 'last_updated',
    direction: 'desc'
  });
  const [filters, setFilters] = useState<Filters>({
    status: [],
    priority: [],
    type: [],
    next_steps: []
  });
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchScope, setSearchScope] = useState<SearchScope>('all');
  const [supabaseClient, setSupabaseClient] = useState(() => 
    createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false
      }
    })
  );

  // Set up authenticated Supabase client
  useEffect(() => {
    const setupSupabase = async () => {
      if (!user) {
        console.log('No user found, using anonymous Supabase client')
        return
      }

      try {
        const token = await getToken({ template: "supabase" })
        if (!token) {
          console.error('Failed to get Clerk JWT token')
          return
        }

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

        setSupabaseClient(authenticatedClient)
      } catch (error) {
        console.error('Error in Supabase auth setup:', error)
      }
    }

    setupSupabase()
  }, [user, getToken])

  // Load filters when user is available
  useEffect(() => {
    const loadFilters = async () => {
      if (!user) {
        console.log('No user found');
        return;
      }

      const userEmail = user.primaryEmailAddress?.emailAddress;
      if (!userEmail) {
        console.log('No user email found');
        return;
      }

      try {
        // Get fresh token
        const token = await getToken({ template: "supabase" });
        if (!token) {
          throw new Error('Failed to get authentication token');
        }

        // Create fresh client
        const client = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: false
          },
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        });

        console.log('Loading filters for user:', userEmail);

        const { data, error } = await client
          .from('user_filters')
          .select('filters')
          .eq('user_email', userEmail)
          .eq('page', 'deal_tracker')
          .single();

        if (error) {
          console.error('Error loading filters:', error);
          return;
        }

        if (data?.filters) {
          console.log('Loaded filters from DB:', data.filters);
          setFilters(data.filters);
        }
      } catch (error) {
        console.error('Error loading filters:', error);
      }
    };

    loadFilters();
  }, [user, getToken]);

  // Save filters when they change and user is available
  const saveFilters = async (filtersToSave: Filters) => {
    if (!user) {
      console.log('No user found');
      return;
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;
    if (!userEmail) {
      console.log('No user email found');
      return;
    }

    try {
      // Get fresh token
      const token = await getToken({ template: "supabase" });
      if (!token) {
        throw new Error('Failed to get authentication token');
      }

      // Create fresh client
      const client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      });

      console.log('Saving filters for user:', userEmail);

      const { error: upsertError } = await client
        .from('user_filters')
        .upsert({
          user_email: userEmail,
          page: 'deal_tracker',
          filters: filtersToSave,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_email,page'
        });

      if (upsertError) {
        console.error('Error saving filters:', upsertError);
      } else {
        console.log('Successfully saved filters:', filtersToSave);
      }
    } catch (error) {
      console.error('Error saving filters:', error);
    }
  };

  // Handle filter changes
  const handleApplyFilters = (newFilters: Filters) => {
    console.log('Applying new filters:', newFilters);
    try {
      // Ensure we maintain the filter structure and validate arrays
      const updatedFilters = {
        status: Array.isArray(newFilters.status) ? newFilters.status : [],
        priority: Array.isArray(newFilters.priority) ? newFilters.priority : [],
        type: Array.isArray(newFilters.type) ? newFilters.type : [],
        next_steps: Array.isArray(newFilters.next_steps) ? newFilters.next_steps : []
      };
      console.log('Structured filters to apply:', updatedFilters);
      setFilters(updatedFilters);
      
      // Only save if there are actual filters to save
      if (Object.values(updatedFilters).some(arr => arr.length > 0)) {
        saveFilters(updatedFilters);
      }
      
      setIsFilterModalOpen(false);
    } catch (e) {
      console.error('Error applying filters:', e);
    }
  };

  useEffect(() => {
    fetchSavedListings();
  }, [user]);

  const fetchSavedListings = async () => {
    try {
      if (!user?.emailAddresses?.[0]?.emailAddress) {
        console.log('No user email found');
        return;
      }

      // Get fresh token and client for this operation
      const token = await getToken({ template: "supabase" });
      if (!token) {
        throw new Error('Failed to get authentication token');
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
      });

      const userEmail = user.emailAddresses[0].emailAddress;
      console.log('Fetching listings for email:', userEmail);

      // First check if we have any saved listings
      const { data: savedListingsCheck, error: checkError } = await client
        .from('user_saved_listings')
        .select('id, user_email')
        .eq('user_email', userEmail);

      if (checkError) {
        console.error('Error checking saved listings:', checkError);
        return;
      }

      console.log('Saved listings check:', savedListingsCheck);

      if (!savedListingsCheck || savedListingsCheck.length === 0) {
        console.log('No saved listings found for user');
        return;
      }

      // Now fetch full data with joins
      const { data, error } = await client
        .from('user_saved_listings')
        .select(`
          id,
          user_email,
          listing_id,
          listings!inner(
            id,
            title,
            asking_price,
            business_model,
            source_platform
          ),
          deal_tracker(
            id,
            status,
            next_steps,
            priority,
            notes,
            last_updated,
            created_at
          )
        `)
        .eq('user_email', userEmail)
        .order('saved_at', { ascending: false })
        .returns<SavedListing[]>();

      console.log('Full data fetch result:', { data, error });

      if (error) {
        console.error('Error fetching full data:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('No data returned from full fetch');
      } else {
        console.log('Number of listings found:', data.length);
        console.log('First listing:', data[0]);
      }

      setSavedListings(data || []);
    } catch (error) {
      console.error('Error in fetchSavedListings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add effect to refetch data when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchSavedListings();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchSavedListings();
    }
  }, [user]);

  const handleUpdateDeal = async (listingId: string, field: string, value: string | number) => {
    console.log('Updating deal:', { listingId, field, value })
    try {
      if (!user?.emailAddresses?.[0]?.emailAddress) {
        console.error('No user email found for update')
        return
      }
      const userEmail = user.emailAddresses[0].emailAddress

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

      // Update local state first for optimistic UI
      const updatedListings = savedListings.map(sl => {
        if (sl.listings.id !== listingId) return sl
        
        const updatedDealTracker = {
          ...(sl.deal_tracker || {
            status: 'Interested',
            next_steps: 'Review Listing',
            priority: 'Medium',
            notes: '',
            created_at: new Date().toISOString()
          }),
          id: sl.deal_tracker?.id || sl.listing_id,
          [field]: String(value),
          last_updated: new Date().toISOString()
        }
        
        return {
          ...sl,
          deal_tracker: updatedDealTracker
        }
      })

      setSavedListings(updatedListings as SavedListing[])

      // Then update the database
      if (!savedListings.find(sl => sl.listings.id === listingId)?.deal_tracker) {
        // Create new deal tracker entry
        const { error: createError } = await client
          .from('deal_tracker')
          .insert({
            user_email: userEmail,
            listing_id: listingId,
            status: field === 'status' ? String(value) : 'Interested',
            next_steps: field === 'next_steps' ? String(value) : 'Review Listing',
            priority: field === 'priority' ? String(value) : 'Medium',
            notes: field === 'notes' ? String(value) : '',
            last_updated: new Date().toISOString(),
          })

        if (createError) throw createError
      } else {
        // Update existing deal tracker entry
        const { error: updateError } = await client
          .from('deal_tracker')
          .update({
            [field]: String(value),
            last_updated: new Date().toISOString(),
          })
          .eq('listing_id', listingId)
          .eq('user_email', userEmail)

        if (updateError) throw updateError
      }
    } catch (error) {
      console.error('Error in handleUpdateDeal:', error)
      // Revert the optimistic update on error
      await fetchSavedListings()
    }
  }

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilter = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handleBulkAction = async (action: string) => {
    if (selectedItems.size === 0) return;
    if (!user?.emailAddresses?.[0]?.emailAddress) return;
    const userEmail = user.emailAddresses[0].emailAddress;

    try {
      // Get fresh token and client for this operation
      const token = await getToken({ template: "supabase" });
      if (!token) {
        throw new Error('Failed to get authentication token');
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
      });

      // Get the selected listings with their listing_ids
      const selectedListings = savedListings.filter(sl => selectedItems.has(sl.listings.id));
      
      for (const listing of selectedListings) {
        if (!listing.deal_tracker) {
          // Create new deal tracker entry
          await client
            .from('deal_tracker')
            .insert({
              user_email: userEmail,
              listing_id: listing.listing_id,
              status: action,
              next_steps: 'Review Listing',
              priority: 'Medium',
              last_updated: new Date().toISOString(),
            });
        } else {
          // Update existing deal tracker entry
          await client
            .from('deal_tracker')
            .update({
              status: action,
              last_updated: new Date().toISOString(),
            })
            .eq('listing_id', listing.listing_id)
            .eq('user_email', userEmail);
        }
      }

      await fetchSavedListings();
    } catch (error) {
      console.error('Error in bulk action:', error);
      await fetchSavedListings();
    }
  };

  const handleExportCSV = () => {
    const headers = ['Business Name', 'Price', 'Type', 'Status', 'Next Steps', 'Priority', 'Notes', 'Last Updated'];
    const rows = filteredListings.map(sl => [
      sl.listings.title,
      sl.listings.asking_price,
      sl.listings.business_model,
      sl.deal_tracker?.status || 'Interested',
      sl.deal_tracker?.next_steps || 'Review Listing',
      sl.deal_tracker?.priority || 'Medium',
      sl.deal_tracker?.notes || '',
      sl.deal_tracker?.last_updated ? new Date(sl.deal_tracker.last_updated).toLocaleDateString() : '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `deal-tracker-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Interested':
        return 'bg-blue-100 text-blue-800';
      case 'Contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'Due Diligence':
        return 'bg-purple-100 text-purple-800';
      case 'Offer Made':
        return 'bg-orange-100 text-orange-800';
      case 'Not Interested':
        return 'bg-gray-100 text-gray-800';
      case 'Closed':
        return 'bg-green-100 text-green-800';
      case 'Lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSearch = (searchQuery: string, scope: SearchScope) => {
    setQuery(searchQuery);
    setSearchScope(scope);
  };

  // Filter the listings based on current filters
  const filteredListings = useMemo(() => {
    console.log('Filtering listings with filters:', filters);
    console.log('Total listings before filter:', savedListings.length);
    
    const filtered = savedListings.filter(listing => {
      // If no filters are set, show all listings
      if (!filters.status?.length && !filters.priority?.length && !filters.type?.length && !filters.next_steps?.length) {
        return true;
      }

      const matchesStatus = !filters.status?.length || 
        filters.status.includes(listing.deal_tracker?.status || 'Interested');
      
      const matchesPriority = !filters.priority?.length || 
        filters.priority.includes(listing.deal_tracker?.priority || 'Medium');
      
      const matchesType = !filters.type?.length || 
        filters.type.includes(listing.listings.business_model);
      
      const matchesNextSteps = !filters.next_steps?.length || 
        filters.next_steps.includes(listing.deal_tracker?.next_steps || 'Review Listing');

      // Log individual filter matches for debugging
      if (!matchesStatus || !matchesPriority || !matchesType || !matchesNextSteps) {
        console.log('Filter miss for listing:', {
          listingId: listing.listings.id,
          status: { matches: matchesStatus, value: listing.deal_tracker?.status || 'Interested', filter: filters.status },
          priority: { matches: matchesPriority, value: listing.deal_tracker?.priority || 'Medium', filter: filters.priority },
          type: { matches: matchesType, value: listing.listings.business_model, filter: filters.type },
          nextSteps: { matches: matchesNextSteps, value: listing.deal_tracker?.next_steps || 'Review Listing', filter: filters.next_steps }
        });
      }

      return matchesStatus && matchesPriority && matchesType && matchesNextSteps;
    });

    console.log('Filtered listings count:', filtered.length);
    return filtered;
  }, [savedListings, filters]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Deal Tracker</h1>
          <p className="mt-2 text-sm text-gray-700">
            Track and manage your deals in one place
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-2">
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filter
          </button>
        </div>
      </div>

      <FilterControls
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
      />

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="w-8 px-2 py-3.5">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedItems.size > 0 && selectedItems.size === savedListings.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(new Set(savedListings.map(l => l.listings.id)));
                        } else {
                          setSelectedItems(new Set());
                        }
                      }}
                    />
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Business
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Asking Price
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Next Steps
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Priority
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Notes
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Last Updated
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Source
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Added
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredListings.map((listing) => (
                  <DealRow
                    key={listing.listings.id}
                    listing={listing.listings}
                    dealTracker={listing.deal_tracker}
                    onUpdate={handleUpdateDeal}
                    isSelected={selectedItems.has(listing.listings.id)}
                    onSelect={(checked) => {
                      const newSelected = new Set(selectedItems);
                      if (checked) {
                        newSelected.add(listing.listings.id);
                      } else {
                        newSelected.delete(listing.listings.id);
                      }
                      setSelectedItems(newSelected);
                    }}
                    statusColor={getStatusColor(listing.deal_tracker?.status || 'Interested')}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
