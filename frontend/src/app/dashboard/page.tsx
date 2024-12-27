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
  CubeIcon
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
const hasAdvancedFilters = (preferences: any) => {
  if (!preferences) return false;
  return preferences.min_business_age !== null ||
    preferences.max_business_age !== null ||
    preferences.min_employees !== null ||
    preferences.max_employees !== null ||
    preferences.min_profit_margin !== null ||
    preferences.max_profit_margin !== null ||
    preferences.min_selling_multiple !== null ||
    preferences.max_selling_multiple !== null ||
    preferences.min_ebitda !== null ||
    preferences.max_ebitda !== null ||
    preferences.min_annual_revenue !== null ||
    preferences.max_annual_revenue !== null ||
    (preferences.preferred_business_models && preferences.preferred_business_models.length > 0);
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

  const { data: preferences, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  // If no preferences exist yet, show the empty state
  if (error?.code === 'PGRST116') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No preferences set</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by setting up your deal alert preferences
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard/preferences"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Set Preferences
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If there's any other error, show the error state
  if (error) {
    console.error('Error fetching preferences:', error);
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">Error loading preferences. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  // Set default values if preferences don't exist
  const defaultPreferences = {
    min_price: 0,
    max_price: 0,
    industries: [],
    newsletter_frequency: 'weekly',
    preferred_business_models: [],
    min_business_age: null,
    max_business_age: null,
    min_employees: null,
    max_employees: null,
    min_profit_margin: null,
    max_profit_margin: null,
    min_selling_multiple: null,
    max_selling_multiple: null,
    min_ebitda: null,
    max_ebitda: null,
    min_annual_revenue: null,
    max_annual_revenue: null,
  };

  const userPreferences = preferences || defaultPreferences;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your deal alerts and preferences
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/dashboard/preferences"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Update Preferences
            </Link>
          </div>
        </div>
        
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">Error loading preferences. Please try again later.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Basic Preferences Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Basic Preferences</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Your primary deal alert criteria
                </p>
              </div>
              
              <div className="px-6 py-6 divide-y divide-gray-200">
                {/* Price Range */}
                <div className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center">
                    <BanknotesIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Investment Range</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {formatCurrency(userPreferences?.min_price)} - {formatCurrency(userPreferences?.max_price)} USD
                      </p>
                    </div>
                  </div>
                </div>

                {/* Industries */}
                <div className="py-4">
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Target Industries</h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(userPreferences?.industries || []).map((industry: string) => (
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

                {/* Alert Frequency */}
                <div className="py-4">
                  <div className="flex items-center">
                    <BellIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Alert Frequency</h3>
                      <p className="mt-1 text-sm text-gray-500 capitalize">
                        Receiving {userPreferences?.newsletter_frequency || 'weekly'} updates
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Preferences Card */}
            {hasAdvancedFilters(userPreferences) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Advanced Filters</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Additional criteria for more specific matches
                  </p>
                </div>
                
                <div className="px-6 py-6 divide-y divide-gray-200">
                  {/* Business Age */}
                  {(userPreferences.min_business_age !== null || userPreferences.max_business_age !== null) && (
                    <div className="py-4 first:pt-0">
                      <div className="flex items-center">
                        <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Business Age</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {userPreferences.min_business_age || '0'} - {userPreferences.max_business_age || 'Any'} Years
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Number of Employees */}
                  {(userPreferences.min_employees !== null || userPreferences.max_employees !== null) && (
                    <div className="py-4">
                      <div className="flex items-center">
                        <UsersIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Team Size</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {userPreferences.min_employees || '0'} - {userPreferences.max_employees || 'Any'} Employees
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Business Models */}
                  {userPreferences.preferred_business_models && userPreferences.preferred_business_models.length > 0 && (
                    <div className="py-4">
                      <div className="flex items-center">
                        <CubeIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Business Models</h3>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {userPreferences.preferred_business_models.map((model: string) => (
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
                  {(userPreferences.min_annual_revenue !== null || userPreferences.max_annual_revenue !== null ||
                    userPreferences.min_ebitda !== null || userPreferences.max_ebitda !== null) && (
                    <div className="py-4">
                      <div className="flex items-center">
                        <ChartBarIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Financial Criteria</h3>
                          <div className="mt-1 space-y-1">
                            {(userPreferences.min_annual_revenue !== null || userPreferences.max_annual_revenue !== null) && (
                              <p className="text-sm text-gray-500">
                                Revenue: {formatCurrency(userPreferences.min_annual_revenue)} - {formatCurrency(userPreferences.max_annual_revenue)}
                              </p>
                            )}
                            {(userPreferences.min_ebitda !== null || userPreferences.max_ebitda !== null) && (
                              <p className="text-sm text-gray-500">
                                EBITDA: {formatCurrency(userPreferences.min_ebitda)} - {formatCurrency(userPreferences.max_ebitda)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Performance Metrics */}
                  {(userPreferences.min_profit_margin !== null || userPreferences.max_profit_margin !== null ||
                    userPreferences.min_selling_multiple !== null || userPreferences.max_selling_multiple !== null) && (
                    <div className="py-4">
                      <div className="flex items-center">
                        <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Performance Metrics</h3>
                          <div className="mt-1 space-y-1">
                            {(userPreferences.min_profit_margin !== null || userPreferences.max_profit_margin !== null) && (
                              <p className="text-sm text-gray-500">
                                Profit Margin: {formatPercentage(userPreferences.min_profit_margin)} - {formatPercentage(userPreferences.max_profit_margin)}
                              </p>
                            )}
                            {(userPreferences.min_selling_multiple !== null || userPreferences.max_selling_multiple !== null) && (
                              <p className="text-sm text-gray-500">
                                Selling Multiple: {formatMultiple(userPreferences.min_selling_multiple)} - {formatMultiple(userPreferences.max_selling_multiple)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Last updated: {userPreferences?.updated_at ? new Date(userPreferences.updated_at).toLocaleDateString() : 'Never'}
                </span>
                <Link
                  href="/dashboard/preferences"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Edit preferences →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 