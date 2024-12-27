import { auth } from "@clerk/nextjs/server";
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { 
  BanknotesIcon, 
  BuildingOfficeIcon, 
  BellIcon,
  AdjustmentsHorizontalIcon,
  UsersIcon,
  ChartBarIcon,
  ClockIcon,
  CubeIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon
} from "@heroicons/react/24/outline";

// Helper function to format currency
const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return 'Any';
  return `$${amount.toLocaleString()}`;
};

// Helper function to format percentage
const formatPercentage = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'Any';
  return `${value}%`;
};

// Helper function to format multiple
const formatMultiple = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'Any';
  return `${value}x`;
};

// Helper function to check if any advanced filters are set
const hasAdvancedFilters = (alert: any) => {
  if (!alert) return false;
  return alert.min_business_age !== null ||
    alert.max_business_age !== null ||
    alert.min_employees !== null ||
    alert.max_employees !== null ||
    alert.min_profit_margin !== null ||
    alert.max_profit_margin !== null ||
    alert.min_selling_multiple !== null ||
    alert.max_selling_multiple !== null ||
    alert.min_ebitda !== null ||
    alert.max_ebitda !== null ||
    alert.min_annual_revenue !== null ||
    alert.max_annual_revenue !== null ||
    (alert.preferred_business_models && alert.preferred_business_models.length > 0);
};

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Please sign in</h1>
            <p className="mt-2 text-gray-600">You need to be signed in to view your dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: alerts, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', userId);

  // If no alerts exist yet, show the empty state
  if (!alerts || alerts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No alerts set</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first deal alert
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard/preferences"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Alert
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If there's any error, show the error state
  if (error) {
    console.error('Error fetching alerts:', error);
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">Error loading alerts. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Deal Alerts</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your deal alerts and preferences
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/dashboard/preferences?action=create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Create New Alert
            </Link>
          </div>
        </div>
        
        <div className="space-y-6">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">{alert.name}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Receiving {alert.newsletter_frequency} updates
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Link
                    href={`/dashboard/preferences?id=${alert.id}`}
                    className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PencilSquareIcon className="h-5 w-5" aria-hidden="true" />
                  </Link>
                  <button
                    className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <TrashIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
              
              <div className="px-6 py-6 divide-y divide-gray-200">
                {/* Basic Criteria */}
                <div className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center">
                    <BanknotesIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Investment Range</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {formatCurrency(alert.min_price)} - {formatCurrency(alert.max_price)} USD
                      </p>
                    </div>
                  </div>
                </div>

                {/* Industries */}
                {alert.industries && alert.industries.length > 0 && (
                  <div className="py-4">
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Target Industries</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {alert.industries.map((industry: string) => (
                            <span
                              key={industry}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                            >
                              {industry}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Advanced Filters */}
                {hasAdvancedFilters(alert) && (
                  <>
                    {/* Business Age */}
                    {(alert.min_business_age !== null || alert.max_business_age !== null) && (
                      <div className="py-4">
                        <div className="flex items-center">
                          <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">Business Age</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {alert.min_business_age || '0'} - {alert.max_business_age || 'Any'} Years
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Number of Employees */}
                    {(alert.min_employees !== null || alert.max_employees !== null) && (
                      <div className="py-4">
                        <div className="flex items-center">
                          <UsersIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">Team Size</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {alert.min_employees || '0'} - {alert.max_employees || 'Any'} Employees
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Business Models */}
                    {alert.preferred_business_models && alert.preferred_business_models.length > 0 && (
                      <div className="py-4">
                        <div className="flex items-center">
                          <CubeIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">Business Models</h3>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {alert.preferred_business_models.map((model: string) => (
                                <span
                                  key={model}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                                >
                                  {model}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Financial Metrics */}
                    {(alert.min_annual_revenue !== null || alert.max_annual_revenue !== null ||
                      alert.min_ebitda !== null || alert.max_ebitda !== null) && (
                      <div className="py-4">
                        <div className="flex items-center">
                          <ChartBarIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">Financial Criteria</h3>
                            <div className="mt-1 space-y-1">
                              {(alert.min_annual_revenue !== null || alert.max_annual_revenue !== null) && (
                                <p className="text-sm text-gray-500">
                                  Revenue: {formatCurrency(alert.min_annual_revenue)} - {formatCurrency(alert.max_annual_revenue)}
                                </p>
                              )}
                              {(alert.min_ebitda !== null || alert.max_ebitda !== null) && (
                                <p className="text-sm text-gray-500">
                                  EBITDA: {formatCurrency(alert.min_ebitda)} - {formatCurrency(alert.max_ebitda)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Performance Metrics */}
                    {(alert.min_profit_margin !== null || alert.max_profit_margin !== null ||
                      alert.min_selling_multiple !== null || alert.max_selling_multiple !== null) && (
                      <div className="py-4">
                        <div className="flex items-center">
                          <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">Performance Metrics</h3>
                            <div className="mt-1 space-y-1">
                              {(alert.min_profit_margin !== null || alert.max_profit_margin !== null) && (
                                <p className="text-sm text-gray-500">
                                  Profit Margin: {formatPercentage(alert.min_profit_margin)} - {formatPercentage(alert.max_profit_margin)}
                                </p>
                              )}
                              {(alert.min_selling_multiple !== null || alert.max_selling_multiple !== null) && (
                                <p className="text-sm text-gray-500">
                                  Selling Multiple: {formatMultiple(alert.min_selling_multiple)} - {formatMultiple(alert.max_selling_multiple)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="bg-gray-50 px-6 py-4 text-sm text-gray-500">
                Last updated: {alert.updated_at ? new Date(alert.updated_at).toLocaleDateString() : 'Never'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 