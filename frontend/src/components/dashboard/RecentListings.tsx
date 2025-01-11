import { getRecentListings } from '@/hooks/useRecentListings';
import { formatMoney } from '@/utils/formatters';
import { ArrowTrendingUpIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export async function RecentListings({ userId }: { userId: string }) {
  const listings = await getRecentListings(userId);

  if (!listings || listings.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Latest Deals Matching Your Filters</h2>
          <a
            href="/dealflow/listings"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View All
          </a>
        </div>
        <div className="text-center py-6 text-gray-500">
          No matching listings found
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Latest Deals Matching Your Filters</h2>
        <a
          href="/dealflow/listings"
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          View All
        </a>
      </div>
      <div className="space-y-4">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:border-gray-200 transition-colors duration-200"
          >
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  {listing.businessType}
                </span>
                <div className="flex items-center space-x-1 text-gray-500">
                  <ArrowTrendingUpIcon className="h-4 w-4" />
                  <span className="text-sm">{listing.multiple.toFixed(1)}x</span>
                </div>
              </div>
              <h3 className="text-base font-medium text-gray-900">
                {listing.title}
              </h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-gray-900">
                  <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm font-medium">
                    {formatMoney(listing.askingPrice)}
                  </span>
                </div>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-500">
                  {formatMoney(listing.monthlyRevenue)}/mo
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 