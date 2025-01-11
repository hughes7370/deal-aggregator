import { getActiveDealStats } from '@/hooks/useActiveDealStats';
import { BookmarkIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export async function ActiveDeals({ userId }: { userId: string }) {
  const dealStats = await getActiveDealStats(userId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Active Deals</h2>
        <a
          href="/dealflow/saved"
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          View All
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BookmarkIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Saved</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dealStats.totalSaved}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recently Added</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dealStats.recentlyAdded}
              </p>
            </div>
          </div>
        </div>
      </div>

      {dealStats.statusCounts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">By Status</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-200">
            {dealStats.statusCounts.map((status) => (
              <div
                key={status.status}
                className="p-4 hover:bg-gray-100 transition-colors duration-200"
              >
                <p className={`text-sm font-medium ${status.color}`}>
                  {status.status}
                </p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {status.count}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 