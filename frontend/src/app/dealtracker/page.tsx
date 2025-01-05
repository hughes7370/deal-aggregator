'use client';

import { useState, useEffect, useMemo } from 'react';
import { FunnelIcon, ArrowsUpDownIcon, ArrowDownTrayIcon, CheckIcon } from '@heroicons/react/24/outline';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import DealRow from '@/components/dealtracker/DealRow';
import FilterControls from '@/components/dealtracker/controls/FilterControls';
import { useUser, useAuth } from "@clerk/nextjs";
import { createClient } from '@supabase/supabase-js';

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
  };
  deal_tracker?: {
    id: string;
    status: string;
    next_steps: string;
    priority: string;
    notes: string;
    last_updated: string;
  } | null;
  selected?: boolean;
}

// Initialize Supabase client with auth configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function DealTracker() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [supabaseClient, setSupabaseClient] = useState(() => 
    createClient(supabaseUrl, supabaseAnonKey)
  );
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: SortDirection }>({
    field: 'last_updated',
    direction: 'desc'
  });
  const [filters, setFilters] = useState<Filters>({});
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Set up authenticated Supabase client
  useEffect(() => {
    const setupSupabase = async () => {
      if (!user) {
        console.log('No user found, using anonymous Supabase client');
        return;
      }

      try {
        // Get token with specific template
        const token = await getToken({ template: "supabase" });
        
        if (!token) {
          console.error('Failed to get Clerk JWT token');
          return;
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
        });

        console.log('Created authenticated Supabase client');
        setSupabaseClient(authenticatedClient);

      } catch (error) {
        console.error('Error in Supabase auth setup:', error);
      }
    };

    setupSupabase();
  }, [user, getToken]);

  useEffect(() => {
    fetchSavedListings();
  }, [supabaseClient]);

  const fetchSavedListings = async () => {
    try {
      if (!user?.emailAddresses?.[0]?.emailAddress) {
        console.log('No user email found');
        return;
      }

      const userEmail = user.emailAddresses[0].emailAddress;
      console.log('Fetching listings for email:', userEmail);

      // First check if we have any saved listings
      const { data: savedListingsCheck, error: checkError } = await supabaseClient
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
      const { data, error } = await supabaseClient
        .from('user_saved_listings')
        .select(`
          id,
          user_email,
          listing_id,
          listings!inner(
            id,
            title,
            asking_price,
            business_model
          ),
          deal_tracker(
            id,
            status,
            next_steps,
            priority,
            notes,
            last_updated
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

  const handleUpdateDeal = async (listingId: string, field: string, value: string | number) => {
    try {
      if (!user?.emailAddresses?.[0]?.emailAddress) return;
      const userEmail = user.emailAddresses[0].emailAddress;

      // Find the saved listing that matches this listing ID
      const savedListing = savedListings.find(sl => sl.listings.id === listingId);
      if (!savedListing) {
        console.error('Could not find saved listing with ID:', listingId);
        return;
      }

      if (!savedListing?.deal_tracker) {
        // Create new deal tracker entry
        const { data: newDealTracker, error: createError } = await supabaseClient
          .from('deal_tracker')
          .insert({
            user_email: userEmail,
            listing_id: savedListing.listing_id, // Use the listing_id from user_saved_listings
            [field]: value,
            status: 'Interested',
            next_steps: 'Review Listing',
            priority: 'Medium',
            last_updated: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating deal tracker:', createError);
          throw createError;
        }
        
        setSavedListings(prev => prev.map(sl => 
          sl.listings.id === listingId 
            ? { ...sl, deal_tracker: newDealTracker }
            : sl
        ));
      } else {
        // Update existing deal tracker entry
        const { error: updateError } = await supabaseClient
          .from('deal_tracker')
          .update({
            [field]: value,
            last_updated: new Date().toISOString(),
          })
          .eq('listing_id', savedListing.listing_id) // Use listing_id instead of id
          .eq('user_email', userEmail);

        if (updateError) {
          console.error('Error updating deal tracker:', updateError);
          throw updateError;
        }

        setSavedListings(prev => prev.map(sl => 
          sl.listings.id === listingId 
            ? { 
                ...sl, 
                deal_tracker: {
                  ...sl.deal_tracker!,
                  [field]: value,
                  last_updated: new Date().toISOString(),
                }
              }
            : sl
        ));
      }
    } catch (error) {
      console.error('Error updating deal:', error);
    }
  };

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
      // Get the selected listings with their listing_ids
      const selectedListings = savedListings.filter(sl => selectedItems.has(sl.listings.id));
      
      for (const listing of selectedListings) {
        if (!listing.deal_tracker) {
          // Create new deal tracker entry
          await supabaseClient
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
          await supabaseClient
            .from('deal_tracker')
            .update({
              status: action,
              last_updated: new Date().toISOString(),
            })
            .eq('listing_id', listing.listing_id)
            .eq('user_email', userEmail);
        }
      }

      // Update local state
      setSavedListings(prev => prev.map(sl => 
        selectedItems.has(sl.listings.id)
          ? { 
              ...sl, 
              deal_tracker: {
                id: sl.deal_tracker?.id || sl.listing_id, // Use listing_id as fallback for id
                status: action,
                next_steps: sl.deal_tracker?.next_steps || 'Review Listing',
                priority: sl.deal_tracker?.priority || 'Medium',
                notes: sl.deal_tracker?.notes || '',
                last_updated: new Date().toISOString(),
              }
            }
          : sl
      ));

      // Clear selection
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Error performing bulk action:', error);
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

  const filteredListings = useMemo(() => {
    let result = [...savedListings];

    // Apply filters
    if (filters.status?.length) {
      result = result.filter(sl => filters.status?.includes(sl.deal_tracker?.status || 'Interested'));
    }
    if (filters.priority?.length) {
      result = result.filter(sl => filters.priority?.includes(sl.deal_tracker?.priority || 'Medium'));
    }
    if (filters.type?.length) {
      result = result.filter(sl => filters.type?.includes(sl.listings.business_model));
    }
    if (filters.next_steps?.length) {
      result = result.filter(sl => filters.next_steps?.includes(sl.deal_tracker?.next_steps || 'Review Listing'));
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortConfig.field) {
        case 'business_name':
          aValue = a.listings.title;
          bValue = b.listings.title;
          break;
        case 'asking_price':
          aValue = a.listings.asking_price;
          bValue = b.listings.asking_price;
          break;
        case 'business_type':
          aValue = a.listings.business_model;
          bValue = b.listings.business_model;
          break;
        case 'status':
          aValue = a.deal_tracker?.status || 'Interested';
          bValue = b.deal_tracker?.status || 'Interested';
          break;
        case 'next_steps':
          aValue = a.deal_tracker?.next_steps || 'Review Listing';
          bValue = b.deal_tracker?.next_steps || 'Review Listing';
          break;
        case 'priority':
          aValue = a.deal_tracker?.priority || 'Medium';
          bValue = b.deal_tracker?.priority || 'Medium';
          break;
        case 'last_updated':
          aValue = a.deal_tracker?.last_updated || '';
          bValue = b.deal_tracker?.last_updated || '';
          break;
        default:
          return 0;
      }

      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return result;
  }, [savedListings, filters, sortConfig]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(filteredListings.map(sl => sl.listings.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Deal Tracker</h1>
          <div className="flex items-center space-x-3">
            {selectedItems.size > 0 && (
              <div className="flex items-center space-x-2 mr-4">
                <span className="text-sm text-gray-600">{selectedItems.size} selected</span>
                <button
                  onClick={() => handleBulkAction('Not Interested')}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Mark Not Interested
                </button>
                <button
                  onClick={() => handleBulkAction('Contacted')}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Mark Contacted
                </button>
              </div>
            )}
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filter View
              {Object.values(filters).some(arr => arr?.length > 0) && (
                <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {Object.values(filters).reduce((acc, arr) => acc + (arr?.length || 0), 0)}
                </span>
              )}
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50">
                <input
                  type="checkbox"
                  checked={selectedItems.size === filteredListings.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              {[
                { key: 'business_name', label: 'Business Name' },
                { key: 'asking_price', label: 'Price' },
                { key: 'business_type', label: 'Type' },
                { key: 'status', label: 'Status' },
                { key: 'next_steps', label: 'Next Steps' },
                { key: 'priority', label: 'Priority' },
                { key: 'notes', label: 'Notes' },
                { key: 'last_updated', label: 'Last Updated' },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key as SortField)}
                  className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <span>{label}</span>
                    {sortConfig.field === key && (
                      <ArrowsUpDownIcon
                        className={`h-4 w-4 ${
                          sortConfig.direction === 'asc' ? 'transform rotate-180' : ''
                        }`}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filteredListings.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                  No saved listings found. Save listings from the Deal Flow page to track them here.
                </td>
              </tr>
            ) : (
              filteredListings.map((savedListing) => (
                <DealRow
                  key={savedListing.listings.id}
                  listing={savedListing.listings}
                  dealTracker={savedListing.deal_tracker}
                  onUpdate={handleUpdateDeal}
                  isSelected={selectedItems.has(savedListing.listings.id)}
                  onSelect={(checked) => handleSelectItem(savedListing.listings.id, checked)}
                  statusColor={getStatusColor(savedListing.deal_tracker?.status)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <FilterControls
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={handleFilter}
      />
    </div>
  );
}
