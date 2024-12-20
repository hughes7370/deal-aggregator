import { auth } from "@clerk/nextjs/server";
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { 
  BanknotesIcon, 
  BuildingOfficeIcon, 
  BellIcon 
} from "@heroicons/react/24/outline";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

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
        
        {preferences ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Your Alert Preferences</h2>
              <p className="mt-1 text-sm text-gray-500">
                We'll notify you when deals match these criteria
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
                      ${preferences.min_price.toLocaleString()} - ${preferences.max_price.toLocaleString()} USD
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
                      {preferences.industries.map((industry: string) => (
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
                      Receiving {preferences.newsletter_frequency} updates
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleDateString()}
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
        ) : (
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
        )}
      </div>
    </div>
  );
} 