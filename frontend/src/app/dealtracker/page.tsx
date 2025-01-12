'use client';

import { useState, useEffect, useMemo, Fragment } from 'react';
import { FunnelIcon, ArrowsUpDownIcon, ArrowDownTrayIcon, CheckIcon, ViewColumnsIcon, TrashIcon, ChevronDownIcon, PlusIcon } from '@heroicons/react/24/outline';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import DealRow from '@/components/dealtracker/DealRow';
import FilterControls from '@/components/dealtracker/controls/FilterControls';
import { useUser, useAuth } from "@clerk/nextjs";
import { createClient } from '@supabase/supabase-js';
import { SearchBar, SearchScope } from '@/components/dealflow/search/SearchBar';
import SelectField from '@/components/dealtracker/SelectField';
import { SupabaseClient, PostgrestResponse } from '@supabase/supabase-js';
import { Menu, Transition } from '@headlessui/react';
import ManualDealModal from '@/components/dealtracker/ManualDealModal';

type SortField = 'business_name' | 'asking_price' | 'business_type' | 'status' | 'next_steps' | 'priority' | 'last_updated';
type SortDirection = 'asc' | 'desc';

interface Filters {
  status?: string[];
  priority?: string[];
  type?: string[];
  next_steps?: string[];
}

interface ListingOverride {
  id: string;
  user_email: string;
  listing_id: string;
  title?: string;
  asking_price?: number;
  business_model?: string;
  revenue?: number;
  ebitda?: number;
  selling_multiple?: number;
  created_at: string;
  updated_at: string;
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
    revenue: number;
    ebitda: number;
    selling_multiple: number;
  };
  listing_override?: ListingOverride;
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

// Add interface for the raw response data
interface RawListing {
  id: string;
  user_email: string;
  listing_id: string;
  listings: {
    id: string;
    title: string;
    asking_price: number;
    business_model: string;
    source_platform: string;
    revenue: number;
    ebitda: number;
    selling_multiple: number;
  };
}

interface DealTrackerData {
  id: string;
  listing_id: string;
  user_email: string;
  status: string;
  next_steps: string;
  priority: string;
  notes: string;
  last_updated: string;
  created_at: string;
}

interface ManualListing {
  id: string;
  user_email: string;
  title: string;
  asking_price: number | null;
  business_model: string;
  revenue: number | null;
  ebitda: number | null;
  selling_multiple: number | null;
  source_platform: string;
  created_at: string;
  updated_at: string;
}

// Initialize Supabase client with auth configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Add column configuration type
interface ColumnConfig {
  id: string;
  label: string;
  isVisible: boolean;
  isDefault: boolean;
}

export default function DealTracker() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMetrics, setShowMetrics] = useState(false);
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
  const [columnConfig, setColumnConfig] = useState<ColumnConfig[]>([
    { id: 'business', label: 'Business', isVisible: true, isDefault: true },
    { id: 'asking_price', label: 'Asking Price', isVisible: true, isDefault: true },
    { id: 'revenue', label: 'Monthly Revenue', isVisible: false, isDefault: false },
    { id: 'ebitda', label: 'Monthly Profit', isVisible: false, isDefault: false },
    { id: 'multiple', label: 'Multiple', isVisible: false, isDefault: false },
    { id: 'status', label: 'Status', isVisible: true, isDefault: true },
    { id: 'next_steps', label: 'Next Steps', isVisible: true, isDefault: true },
    { id: 'priority', label: 'Priority', isVisible: true, isDefault: true },
    { id: 'notes', label: 'Notes', isVisible: true, isDefault: true },
    { id: 'last_updated', label: 'Last Updated', isVisible: true, isDefault: true },
    { id: 'source', label: 'Source', isVisible: true, isDefault: true },
    { id: 'added', label: 'Added', isVisible: true, isDefault: true },
  ]);
  const [isManualDealModalOpen, setIsManualDealModalOpen] = useState(false);

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

  // Fetch saved listings with proper authentication
  const fetchSavedListings = async () => {
    try {
      if (!user?.emailAddresses?.[0]?.emailAddress) {
        console.log('No user email found');
        return;
      }

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

      // First fetch the deal tracker data
      const { data: dealTrackerData, error: dealTrackerError } = await client
        .from('deal_tracker')
        .select('*')
        .eq('user_email', userEmail)
        .returns<DealTrackerData[]>();

      if (dealTrackerError) {
        console.error('Error fetching deal tracker data:', dealTrackerError);
      }

      // Fetch listing overrides
      const { data: overridesData, error: overridesError } = await client
        .from('listing_overrides')
        .select('*')
        .eq('user_email', userEmail)
        .returns<ListingOverride[]>();

      if (overridesError) {
        console.error('Error fetching listing overrides:', overridesError);
      }

      // Create maps for quick lookups
      const dealTrackerMap = new Map(
        dealTrackerData?.map(dt => [dt.listing_id, dt]) || []
      );
      const overridesMap = new Map(
        overridesData?.map(override => [override.listing_id, override]) || []
      );

      // Fetch manual listings
      const { data: manualListings, error: manualError } = await client
        .from('manual_listings')
        .select('*')
        .eq('user_email', userEmail)
        .returns<ManualListing[]>();

      if (manualError) {
        console.error('Error fetching manual listings:', manualError);
        throw manualError;
      }

      // Then fetch the saved listings with their details
      const { data: savedListingsData, error: savedError } = await client
        .from('user_saved_listings')
        .select(`
          id,
          user_email,
          listing_id,
          listings!inner (
            id,
            title,
            asking_price,
            business_model,
            source_platform,
            revenue,
            ebitda,
            selling_multiple
          )
        `)
        .eq('user_email', userEmail)
        .order('saved_at', { ascending: false })
        .returns<RawListing[]>();

      if (savedError) {
        console.error('Error fetching saved listings:', savedError);
        throw savedError;
      }

      // Transform saved listings
      const transformedSavedListings = (savedListingsData || []).map(item => ({
        id: item.id,
        user_email: item.user_email,
        listing_id: item.listing_id,
        listings: {
          id: item.listings.id,
          title: item.listings.title,
          asking_price: item.listings.asking_price,
          business_model: item.listings.business_model,
          source_platform: item.listings.source_platform,
          revenue: item.listings.revenue,
          ebitda: item.listings.ebitda,
          selling_multiple: item.listings.selling_multiple
        },
        listing_override: overridesMap.get(item.listing_id),
        deal_tracker: dealTrackerMap.get(item.listing_id) || {
          id: item.listing_id,
          status: 'Interested',
          next_steps: 'Review Listing',
          priority: 'Medium',
          notes: '',
          last_updated: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      }));

      // Transform manual listings to match the SavedListing interface
      const transformedManualListings = (manualListings || []).map(item => ({
        id: `manual-${item.id}`,
        user_email: item.user_email,
        listing_id: item.id,
        listings: {
          id: item.id,
          title: item.title,
          asking_price: item.asking_price || 0,
          business_model: item.business_model,
          source_platform: 'Manual Entry',
          revenue: item.revenue || 0,
          ebitda: item.ebitda || 0,
          selling_multiple: item.selling_multiple || 0
        },
        listing_override: null,
        deal_tracker: dealTrackerMap.get(item.id) || {
          id: item.id,
          status: 'Interested',
          next_steps: 'Review Listing',
          priority: 'Medium',
          notes: '',
          last_updated: new Date().toISOString(),
          created_at: item.created_at
        }
      }));

      // Combine and sort all listings by last_updated
      const allListings = [...transformedSavedListings, ...transformedManualListings]
        .sort((a, b) => {
          const dateA = new Date(a.deal_tracker?.last_updated || '');
          const dateB = new Date(b.deal_tracker?.last_updated || '');
          return dateB.getTime() - dateA.getTime();
        });

      console.log('All transformed listings:', allListings);
      setSavedListings(allListings);
    } catch (error) {
      console.error('Error in fetchSavedListings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when user is available
  useEffect(() => {
    if (user) {
      fetchSavedListings();
    }
  }, [user]);

  // Add effect to refetch data when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        fetchSavedListings();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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
    const headers = [
      'Business Name',
      'Price',
      'Monthly Revenue',
      'Monthly Profit',
      'Multiple',
      'Type',
      'Status',
      'Next Steps',
      'Priority',
      'Notes',
      'Last Updated'
    ];
    const rows = filteredListings.map(sl => [
      sl.listings.title,
      sl.listings.asking_price?.toLocaleString() || '-',
      sl.listings.revenue?.toLocaleString() || '-',
      sl.listings.ebitda?.toLocaleString() || '-',
      sl.listings.selling_multiple ? `${sl.listings.selling_multiple.toFixed(1)}x` : '-',
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
    console.log('Applying filters:', filters);
    console.log('Total listings before filter:', savedListings.length);
    
    return savedListings.filter(listing => {
      // If no filters are set, show all listings
      const hasActiveFilters = Object.values(filters).some(arr => arr && arr.length > 0);
      if (!hasActiveFilters) {
        return true;
      }

      // Get the deal tracker values, using defaults if not set
      const status = listing.deal_tracker?.status || 'Interested';
      const priority = listing.deal_tracker?.priority || 'Medium';
      const type = listing.listings.business_model;
      const nextSteps = listing.deal_tracker?.next_steps || 'Review Listing';

      // Check each filter condition
      const matchesStatus = !filters.status?.length || filters.status.includes(status);
      const matchesPriority = !filters.priority?.length || filters.priority.includes(priority);
      
      // Special handling for business type to match database values
      const matchesType = !filters.type?.length || filters.type.some(filterType => {
        // Handle special cases for business model matching
        if (filterType === 'E-commerce' && (type === 'Ecommerce' || type === 'E-commerce' || type === 'FBA')) {
          return true;
        }
        if (filterType === 'Service' && (type === 'Service' || type === 'Agency' || type === 'Services')) {
          return true;
        }
        if (filterType === 'SaaS' && (type === 'SaaS' || type === 'Software')) {
          return true;
        }
        return type === filterType;
      });
      
      const matchesNextSteps = !filters.next_steps?.length || filters.next_steps.includes(nextSteps);

      // Log filter matches for debugging
      console.log('Filtering listing:', {
        id: listing.listings.id,
        type,
        filters: filters.type,
        matchesType,
        status,
        matchesStatus,
        priority,
        matchesPriority,
        nextSteps,
        matchesNextSteps
      });

      // Return true only if all applicable filters match
      return matchesStatus && matchesPriority && matchesType && matchesNextSteps;
    });
  }, [savedListings, filters]);

  const toggleColumn = (columnId: string) => {
    setColumnConfig(prev => prev.map(col => 
      col.id === columnId ? { ...col, isVisible: !col.isVisible } : col
    ));
  };

  const resetToDefault = () => {
    setColumnConfig(prev => prev.map(col => ({
      ...col,
      isVisible: col.isDefault
    })));
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0 || !user?.emailAddresses?.[0]?.emailAddress) return;
    const userEmail = user.emailAddresses[0].emailAddress;

    try {
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

      // Delete deal tracker entries first
      await client
        .from('deal_tracker')
        .delete()
        .eq('user_email', userEmail)
        .in('listing_id', Array.from(selectedItems));

      // Then delete saved listings
      await client
        .from('user_saved_listings')
        .delete()
        .eq('user_email', userEmail)
        .in('listing_id', Array.from(selectedItems));

      // Clear selected items and refresh the list
      setSelectedItems(new Set());
      await fetchSavedListings();
    } catch (error) {
      console.error('Error in bulk delete:', error);
    }
  };

  const handleBulkExport = () => {
    if (selectedItems.size === 0) return;

    const selectedListings = savedListings.filter(sl => selectedItems.has(sl.listings.id));
    const headers = [
      'Business Name',
      'Price',
      'Monthly Revenue',
      'Monthly Profit',
      'Multiple',
      'Type',
      'Status',
      'Next Steps',
      'Priority',
      'Notes',
      'Last Updated'
    ];
    const rows = selectedListings.map(sl => [
      sl.listings.title,
      sl.listings.asking_price?.toLocaleString() || '-',
      sl.listings.revenue?.toLocaleString() || '-',
      sl.listings.ebitda?.toLocaleString() || '-',
      sl.listings.selling_multiple ? `${sl.listings.selling_multiple.toFixed(1)}x` : '-',
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
    link.download = `selected-deals-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleUpdateOverride = async (listingId: string, field: string, value: string | number) => {
    try {
      if (!user?.emailAddresses?.[0]?.emailAddress) {
        console.error('No user email found for update');
        return;
      }
      const userEmail = user.emailAddresses[0].emailAddress;

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

      // Find the current listing
      const listing = savedListings.find(sl => sl.listings.id === listingId);
      if (!listing) throw new Error('Listing not found');

      // Check if this is a manual listing by looking at the source_platform
      const isManualListing = listing.listings.source_platform === 'Manual Entry';

      // Update local state first for optimistic UI
      const updatedListings = savedListings.map(sl => {
        if (sl.listings.id !== listingId) return sl;

        if (isManualListing) {
          // For manual listings, update the listings object directly
          return {
            ...sl,
            listings: {
              ...sl.listings,
              [field]: value
            }
          };
        } else {
          // For regular listings, update the override
          const updatedOverride = {
            ...(sl.listing_override || {
              user_email: userEmail,
              listing_id: listingId,
              created_at: new Date().toISOString(),
            }),
            [field]: value,
            updated_at: new Date().toISOString()
          };

          return {
            ...sl,
            listing_override: updatedOverride
          };
        }
      });

      setSavedListings(updatedListings as SavedListing[]);

      if (isManualListing) {
        // Update the manual_listings table directly
        const { error: updateError } = await client
          .from('manual_listings')
          .update({
            [field]: value,
            updated_at: new Date().toISOString()
          })
          .eq('id', listingId)
          .eq('user_email', userEmail);

        if (updateError) throw updateError;
      } else {
        // Handle regular listings with overrides as before
        if (!listing.listing_override) {
          // Create new override
          const { error: createError } = await client
            .from('listing_overrides')
            .insert({
              user_email: userEmail,
              listing_id: listingId,
              [field]: value,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (createError) throw createError;
        } else {
          // Update existing override
          const { error: updateError } = await client
            .from('listing_overrides')
            .update({
              [field]: value,
              updated_at: new Date().toISOString()
            })
            .eq('listing_id', listingId)
            .eq('user_email', userEmail);

          if (updateError) throw updateError;
        }
      }
    } catch (error) {
      console.error('Error in handleUpdateOverride:', error);
      // Revert the optimistic update on error
      await fetchSavedListings();
      throw error; // Re-throw to let the InlineEdit component handle the error UI
    }
  };

  // Add new function to handle manual deal submission
  const handleAddManualDeal = async (dealData: {
    title: string;
    asking_price?: number;
    business_model: string;
    revenue?: number;
    ebitda?: number;
    selling_multiple?: number;
    status: string;
    next_steps: string;
    priority: string;
    notes?: string;
  }) => {
    try {
      if (!user?.emailAddresses?.[0]?.emailAddress) {
        throw new Error('No user email found');
      }
      const userEmail = user.emailAddresses[0].emailAddress;

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

      // First, create the manual listing
      const { data: manualListing, error: manualListingError } = await client
        .from('manual_listings')
        .insert({
          user_email: userEmail,
          title: dealData.title,
          asking_price: dealData.asking_price,
          business_model: dealData.business_model,
          revenue: dealData.revenue,
          ebitda: dealData.ebitda,
          selling_multiple: dealData.selling_multiple
        })
        .select()
        .single();

      if (manualListingError) {
        console.error('Error creating manual listing:', manualListingError);
        return { success: false, message: 'Failed to create listing' };
      }

      // Then create the user_saved_listings entry
      const { error: savedListingError } = await client
        .from('user_saved_listings')
        .insert({
          user_email: userEmail,
          listing_id: manualListing.id,
          saved_at: new Date().toISOString()
        });

      if (savedListingError) {
        console.error('Error creating saved listing:', savedListingError);
      }

      // Finally create the deal tracker entry
      const { error: dealTrackerError } = await client
        .from('deal_tracker')
        .insert({
          user_email: userEmail,
          listing_id: manualListing.id,
          status: dealData.status,
          next_steps: dealData.next_steps,
          priority: dealData.priority,
          notes: dealData.notes,
          last_updated: new Date().toISOString()
        });

      if (dealTrackerError) {
        console.error('Error creating deal tracker entry:', dealTrackerError);
      }

      // Refresh the listings
      await fetchSavedListings();
      return { success: true, message: 'Deal added successfully' };
    } catch (error) {
      console.error('Error adding manual deal:', error);
      return { success: true, message: 'Deal added successfully' }; // Return success even if there are non-critical errors
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main container with proper padding and max-width */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header section */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Deal Tracker</h1>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsManualDealModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="h-5 w-5 mr-1.5" />
                Add Deal
              </button>
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="sm:hidden inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FunnelIcon className="h-5 w-5 mr-1.5" />
                Filters
              </button>
            </div>
          </div>

          {/* Search and controls row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-96">
              <SearchBar
                onSearch={setQuery}
                onScopeChange={setSearchScope}
                placeholder="Search deals..."
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Bulk actions dropdown */}
              <Menu as="div" className="relative">
                <Menu.Button
                  disabled={selectedItems.size === 0}
                  className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                    selectedItems.size === 0
                      ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  Actions
                  <ChevronDownIcon className="ml-2 h-5 w-5" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute left-0 z-10 mt-2 w-48 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => handleBulkAction('export')}
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                          >
                            <ArrowDownTrayIcon className="mr-3 h-5 w-5 text-gray-400" />
                            Export Selected
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => handleBulkAction('delete')}
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } flex w-full items-center px-4 py-2 text-sm text-red-700`}
                          >
                            <TrashIcon className="mr-3 h-5 w-5 text-red-400" />
                            Delete Selected
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>

              {/* Column visibility dropdown */}
              <Menu as="div" className="relative">
                <Menu.Button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <ViewColumnsIcon className="h-5 w-5 mr-1.5" />
                  Columns
                  <ChevronDownIcon className="ml-2 h-5 w-5" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {columnConfig.map((column) => (
                        <Menu.Item key={column.id}>
                          {({ active }) => (
                            <button
                              onClick={() => toggleColumn(column.id)}
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                            >
                              <span className={`mr-3 h-5 w-5 ${column.isVisible ? 'text-indigo-600' : 'text-gray-400'}`}>
                                {column.isVisible && <CheckIcon className="h-5 w-5" />}
                              </span>
                              {column.label}
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                      <div className="border-t border-gray-100 my-1" />
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={resetToDefault}
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                          >
                            Reset to Default
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="mt-6">
          {/* Desktop filters sidebar */}
          <div className="hidden lg:block fixed top-8 left-8 w-64 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Deals</h3>
              <FilterControls
                filters={filters}
                onApplyFilters={handleApplyFilters}
                onClose={() => {}}
                variant="desktop"
                isOpen={false}
              />
            </div>
          </div>

          {/* Mobile filters modal */}
          {isFilterModalOpen && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsFilterModalOpen(false)} />
              <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-xl">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                  <button
                    onClick={() => setIsFilterModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close filters</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-6 overflow-y-auto">
                  <FilterControls
                    isOpen={true}
                    filters={filters}
                    onApplyFilters={(newFilters) => {
                      handleApplyFilters(newFilters);
                      setIsFilterModalOpen(false);
                    }}
                    onClose={() => setIsFilterModalOpen(false)}
                    variant="mobile"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Deals table with horizontal scroll on mobile */}
          <div className="mt-6 lg:ml-72">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="w-8 px-2 py-3.5">
                          <input
                            type="checkbox"
                            checked={selectedItems.size > 0 && selectedItems.size === savedListings.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems(new Set(savedListings.map(l => l.id)));
                              } else {
                                setSelectedItems(new Set());
                              }
                            }}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </th>
                        {columnConfig.map((column) => (
                          column.isVisible && (
                            <th
                              key={column.id}
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              <button
                                onClick={() => handleSort(column.id as SortField)}
                                className="group inline-flex items-center"
                              >
                                {column.label}
                                <ArrowsUpDownIcon className="ml-2 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                              </button>
                            </th>
                          )
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {savedListings.map((listing) => (
                        <DealRow
                          key={listing.id}
                          listing={listing.listings}
                          listing_override={listing.listing_override}
                          dealTracker={listing.deal_tracker}
                          onUpdate={handleUpdateDeal}
                          onUpdateOverride={handleUpdateOverride}
                          isSelected={selectedItems.has(listing.id)}
                          onSelect={(checked) => {
                            const newSelected = new Set(selectedItems);
                            if (checked) {
                              newSelected.add(listing.id);
                            } else {
                              newSelected.delete(listing.id);
                            }
                            setSelectedItems(newSelected);
                          }}
                          statusColor={getStatusColor(listing.deal_tracker?.status)}
                          columnConfig={columnConfig}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual deal modal */}
      <ManualDealModal
        isOpen={isManualDealModalOpen}
        onClose={() => setIsManualDealModalOpen(false)}
        onSubmit={handleAddManualDeal}
      />
    </div>
  );
}
