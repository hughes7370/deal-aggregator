import { auth } from "@clerk/nextjs/server";
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { 
  BellIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import AlertCard from "@/components/alerts/alert-card";

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
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
                href="/dashboard/preferences?action=create"
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
            <AlertCard key={alert.id} alert={alert} userId={userId} />
          ))}
        </div>
      </div>
    </div>
  );
} 