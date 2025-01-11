import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import KeyMetrics from '@/components/dashboard/KeyMetrics';
import { RecentListings } from '@/components/dashboard/RecentListings';
import { MarketSnapshot } from '@/components/dashboard/MarketSnapshot';
import { ActiveDeals } from '@/components/dashboard/ActiveDeals';
import { getUserAlerts } from '@/hooks/useUserAlerts';
import { ChartBarIcon } from '@heroicons/react/24/outline';

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const alerts = await getUserAlerts(userId);
  const hasAlerts = alerts.length > 0;

  if (!hasAlerts) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="mb-6 p-4 bg-blue-50 rounded-full inline-block">
            <ChartBarIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Your Dashboard</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Create your first alert to start tracking deals that match your investment criteria.
          </p>
          <a
            href="/alert-management"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            Create Your First Alert
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-sm text-gray-600">Market overview and deal activity from the last 30 days</p>
      </div>

      {/* Main Grid Layout */}
      <div className="space-y-8">
        {/* Key Metrics Section */}
        <section>
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          }>
            <KeyMetrics userId={userId} />
          </Suspense>
        </section>

        {/* Recent Listings and Market Snapshot Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-gray-200 transition-colors duration-200">
            <Suspense fallback={
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            }>
              <RecentListings userId={userId} />
            </Suspense>
          </section>

          <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-gray-200 transition-colors duration-200">
            <Suspense fallback={
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="animate-pulse bg-gray-100 rounded-lg p-4">
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="grid grid-cols-3 gap-4">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            }>
              <MarketSnapshot />
            </Suspense>
          </section>
        </div>

        {/* Active Deals Section */}
        <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-gray-200 transition-colors duration-200">
          <Suspense fallback={
            <div className="space-y-6">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-4">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            </div>
          }>
            <ActiveDeals userId={userId} />
          </Suspense>
        </section>
      </div>
    </div>
  );
} 