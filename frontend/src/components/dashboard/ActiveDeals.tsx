import Link from 'next/link';
import { BookmarkIcon, ChartBarIcon, ArrowRightIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { getActiveDealStats } from '@/hooks/useActiveDealStats';
import { auth } from '@clerk/nextjs/server';

interface DealStats {
  totalSaved: number;
  recentlyAdded: number;
  byStatus: {
    status: string;
    count: number;
    color: string;
  }[];
}

export async function ActiveDeals() {
  const { userId } = await auth();
  if (!userId) return null;

  const dealStats = await getActiveDealStats(userId);

  if (dealStats.totalSaved === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Your Deal Pipeline</h3>
          <Link
            href="/dealtracker"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            View Deal Tracker
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FunnelIcon className="mx-auto h-8 w-8 text-gray-400 mb-3" />
          <p className="text-gray-600 mb-4">No saved deals in your pipeline</p>
          <Link
            href="/dealflow"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            Browse Listings
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Your Deal Pipeline</h3>
        <Link
          href="/dealtracker"
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200"
        >
          View Deal Tracker
          <ArrowRightIcon className="ml-1 h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookmarkIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">{dealStats.totalSaved}</p>
              <p className="text-sm text-gray-600">Total Saved</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ChartBarIcon className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">{dealStats.recentlyAdded}</p>
              <p className="text-sm text-gray-600">Added This Month</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg">
        <div className="px-4 py-3 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">Pipeline Status</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-200">
          {dealStats.byStatus.map((status) => (
            <div
              key={status.status}
              className="p-4 hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex flex-col items-center justify-center text-center">
                <div className={`${status.color.replace('text-', 'bg-')} bg-opacity-20 rounded-lg p-3 mb-3`}>
                  <span className={`text-2xl font-bold ${status.color}`}>{status.count}</span>
                </div>
                <span className="text-sm font-medium text-gray-700">{status.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 