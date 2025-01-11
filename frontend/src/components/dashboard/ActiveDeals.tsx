import { getActiveDealStats } from '@/hooks/useActiveDealStats';
import { 
  BookmarkIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ClockIcon,
  BuildingOfficeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { formatMoney } from '@/utils/formatters';

export async function ActiveDeals({ userId }: { userId: string }) {
  const dealStats = await getActiveDealStats(userId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Active Deals</h2>
        <a
          href="/dealtracker"
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          View All
        </a>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Saved */}
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

        {/* Average Deal Size */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Deal Size</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatMoney(dealStats.averageDealSize)}
              </p>
            </div>
          </div>
        </div>

        {/* Recently Added */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg">
              <ArrowPathIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recently Added</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dealStats.recentlyAdded}
              </p>
            </div>
          </div>
        </div>

        {/* Top Business Type */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-orange-50 rounded-lg">
              <BuildingOfficeIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Top Business Type</p>
              <p className="text-lg font-semibold text-gray-900 truncate">
                {dealStats.topBusinessTypes[0]?.type || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Deals by Stage */}
      {dealStats.dealsByStage.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Deals by Stage</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-y lg:divide-y-0 divide-gray-200">
            {dealStats.dealsByStage.map((stage) => (
              <div
                key={stage.stage}
                className="p-4 hover:bg-gray-50 transition-colors duration-200"
              >
                <p className={`text-sm font-medium ${stage.color}`}>
                  {stage.stage}
                </p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {stage.count}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Business Types */}
        {dealStats.topBusinessTypes.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Top Business Types</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {dealStats.topBusinessTypes.map((type) => (
                <div
                  key={type.type}
                  className="px-6 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                >
                  <span className="text-sm text-gray-900">{type.type}</span>
                  <span className="text-sm font-medium text-gray-600">{type.count} deals</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {dealStats.recentActivity.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Recent Activity</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {dealStats.recentActivity.map((activity) => (
                <div
                  key={`${activity.id}-${activity.timestamp}`}
                  className="px-6 py-3 flex items-center space-x-4 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      Status changed to {activity.action}
                    </p>
                  </div>
                  <time className="text-sm text-gray-500 whitespace-nowrap">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </time>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 