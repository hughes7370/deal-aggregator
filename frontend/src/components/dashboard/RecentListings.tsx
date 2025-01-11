import Link from 'next/link';
import { BuildingOfficeIcon, ArrowTrendingUpIcon, CurrencyDollarIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { getRecentListings } from '@/hooks/useRecentListings';
import { auth } from '@clerk/nextjs/server';

interface Listing {
  id: string;
  title: string;
  businessType: string;
  askingPrice: number;
  monthlyRevenue: number;
  multiple: number;
}

export async function RecentListings() {
  const { userId } = await auth();
  if (!userId) return null;

  const listings = await getRecentListings(userId);

  if (!listings.length) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Latest Deals Matching Your Filters
          </h3>
          <Link
            href="/dealflow"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            View All
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <BuildingOfficeIcon className="mx-auto h-8 w-8 text-gray-400 mb-3" />
          <p className="text-gray-600 mb-4">No matching listings found</p>
          <Link
            href="/alert-management"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            Adjust Your Filters
          </Link>
        </div>
      </div>
    );
  }

  const formatMoney = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Latest Deals Matching Your Filters
        </h3>
        <Link
          href="/dealflow"
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200"
        >
          View All
          <ArrowRightIcon className="ml-1 h-4 w-4" />
        </Link>
      </div>
      <div className="space-y-4">
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={`/listings/${listing.id}`}
            className="block bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:shadow-md"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-white rounded">
                    <BuildingOfficeIcon className="h-4 w-4 text-gray-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {listing.businessType}
                  </span>
                </div>
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {listing.multiple.toFixed(1)}x EBITDA
                </span>
              </div>
              <h4 className="text-base font-medium text-gray-900 mb-3 line-clamp-1">
                {listing.title}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 bg-white rounded">
                    <CurrencyDollarIcon className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Asking Price</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatMoney(listing.askingPrice)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 bg-white rounded">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Monthly Revenue</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatMoney(listing.monthlyRevenue)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 