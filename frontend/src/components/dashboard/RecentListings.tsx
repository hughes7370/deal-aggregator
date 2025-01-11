'use client';

import { useState, useEffect } from 'react';
import { getRecentListings } from '@/hooks/useRecentListings';
import { formatMoney } from '@/utils/formatters';
import { 
  ArrowTrendingUpIcon, 
  CurrencyDollarIcon,
  BookmarkIcon,
  EyeSlashIcon,
  ClockIcon,
  BuildingStorefrontIcon,
  ComputerDesktopIcon,
  BriefcaseIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface RecentListingsProps {
  userId: string;
}

const getBusinessTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'ecommerce':
      return BuildingStorefrontIcon;
    case 'software':
      return ComputerDesktopIcon;
    case 'service':
      return BriefcaseIcon;
    default:
      return QuestionMarkCircleIcon;
  }
};

const getBusinessTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'ecommerce':
      return 'text-blue-600 bg-blue-50';
    case 'software':
      return 'text-purple-600 bg-purple-50';
    case 'service':
      return 'text-green-600 bg-green-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export function RecentListings({ userId }: RecentListingsProps) {
  const [listings, setListings] = useState<any[]>([]);
  const [savedListings, setSavedListings] = useState<Set<string>>(new Set());
  const [hiddenListings, setHiddenListings] = useState<Set<string>>(new Set());
  const [savingListings, setSavingListings] = useState<Set<string>>(new Set());
  const [hidingListings, setHidingListings] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await getRecentListings(userId);
      setListings(data);
      setIsLoading(false);
    };
    loadData();
  }, [userId]);

  const handleSave = async (id: string) => {
    try {
      setSavingListings(prev => new Set([...prev, id]));
      const supabase = createClientComponentClient();

      if (savedListings.has(id)) {
        await supabase
          .from('user_saved_listings')
          .delete()
          .eq('listing_id', id)
          .eq('user_id', userId);
        setSavedListings(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        await supabase
          .from('user_saved_listings')
          .insert([{
            listing_id: id,
            user_id: userId,
            saved_at: new Date().toISOString(),
          }]);
        setSavedListings(prev => new Set([...prev, id]));
      }
    } catch (error) {
      console.error('Error saving listing:', error);
    } finally {
      setSavingListings(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleHide = async (id: string) => {
    try {
      setHidingListings(prev => new Set([...prev, id]));
      const supabase = createClientComponentClient();

      await supabase
        .from('user_hidden_listings')
        .insert([{
          listing_id: id,
          user_id: userId,
          hidden_at: new Date().toISOString(),
        }]);

      setHiddenListings(prev => new Set([...prev, id]));
      setListings(prev => prev.filter(listing => listing.id !== id));
    } catch (error) {
      console.error('Error hiding listing:', error);
    } finally {
      setHidingListings(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Latest Deals Matching Your Filters</h2>
          <a href="/dealflow" className="text-sm font-medium text-blue-600 hover:text-blue-500">View All</a>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg p-4 border border-gray-100">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Latest Deals Matching Your Filters</h2>
          <a href="/dealflow" className="text-sm font-medium text-blue-600 hover:text-blue-500">View All</a>
        </div>
        <div className="text-center py-6 text-gray-500">
          No matching listings found
        </div>
      </div>
    );
  }

  const filteredListings = listings.filter(listing => !hiddenListings.has(listing.id));

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-gray-900">Latest Deals Matching Your Filters</h2>
            <span className="text-sm text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
              {filteredListings.length}
            </span>
          </div>
          <a href="/dealflow" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center">
            View All
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
        <div className="space-y-3">
          {filteredListings.map((listing) => {
            const BusinessTypeIcon = getBusinessTypeIcon(listing.businessType);
            const typeColor = getBusinessTypeColor(listing.businessType);
            const isNew = listing.daysListed <= 2;

            return (
              <div
                key={listing.id}
                className="group bg-white rounded-lg shadow-sm hover:shadow-md p-4 border border-gray-100 hover:border-gray-200 transition-all duration-200 relative"
              >
                {/* Quick Actions - Visible on hover */}
                <div className="absolute top-3 right-3 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleSave(listing.id)}
                    disabled={savingListings.has(listing.id)}
                    className={`p-1.5 rounded-lg hover:bg-gray-50 transition-colors ${
                      savedListings.has(listing.id) 
                        ? 'text-blue-600 bg-blue-50 hover:bg-blue-50' 
                        : 'text-gray-400 hover:text-blue-600'
                    }`}
                    title={savedListings.has(listing.id) ? "Remove from saved" : "Save listing"}
                  >
                    <BookmarkIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleHide(listing.id)}
                    disabled={hidingListings.has(listing.id)}
                    className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Hide listing"
                  >
                    <EyeSlashIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between pr-20">
                    <div className="flex items-center space-x-2">
                      <BusinessTypeIcon className="h-4 w-4 text-gray-400" />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColor}`}>
                        {listing.businessType}
                      </span>
                      {isNew && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-50 animate-pulse">
                          New
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-gray-500 whitespace-nowrap">
                      <ClockIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                      <span className="text-xs font-medium">
                        {listing.daysListed > 0 
                          ? `${listing.daysListed}d ago`
                          : `${listing.hoursListed}h ago`}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-medium text-gray-900 line-clamp-2 leading-snug hover:text-blue-600 cursor-pointer transition-colors">
                      {listing.title}
                    </h3>

                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {listing.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 text-sm">
                    <div className="flex items-center text-gray-900 font-medium">
                      <CurrencyDollarIcon className="h-4 w-4 text-gray-500 mr-1 flex-shrink-0" />
                      {formatMoney(listing.askingPrice)}
                    </div>
                    <span className="text-gray-300">•</span>
                    <div className="text-gray-600">
                      {formatMoney(listing.monthlyRevenue)}/mo
                    </div>
                    <span className="text-gray-300">•</span>
                    <div className="text-gray-500 text-xs capitalize bg-gray-50 px-2 py-1 rounded-md">
                      {listing.source.replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 