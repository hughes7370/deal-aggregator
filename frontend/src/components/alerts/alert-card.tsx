"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  BanknotesIcon, 
  BuildingOfficeIcon, 
  UsersIcon,
  ClockIcon,
  CubeIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  CalculatorIcon
} from "@heroicons/react/24/outline";

// Helper function to format currency
const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return 'Any';
  return `$${amount.toLocaleString()}`;
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

export default function AlertCard({ alert, userId }: { alert: any; userId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this alert?')) return;

    setIsDeleting(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', alert.id)
        .eq('user_id', userId);

      if (error) throw error;
      
      // Refresh the page to show updated list
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {error && (
        <div className="px-6 py-4 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">{alert.name}</h2>
          <p className="mt-1 text-sm text-gray-500">
            Receiving {alert.newsletter_frequency} updates
          </p>
        </div>
        <div className="flex space-x-2">
          <Link
            href={`/alert-management/edit?id=${alert.id}`}
            className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PencilSquareIcon className="h-5 w-5" aria-hidden="true" />
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
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

        {/* Search Criteria */}
        {alert.search_keywords && alert.search_keywords.length > 0 && (
          <div className="py-4">
            <div className="flex items-center">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">Search Criteria</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    Keywords: {alert.search_keywords.join(', ')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Match Type: {alert.search_match_type}
                  </p>
                  <p className="text-sm text-gray-600">
                    Search In: {alert.search_in.join(', ')}
                  </p>
                  {alert.exclude_keywords && alert.exclude_keywords.length > 0 && (
                    <p className="text-sm text-gray-600">
                      Excluded: {alert.exclude_keywords.join(', ')}
                    </p>
                  )}
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
                      {alert.min_business_age || '0'} - {alert.max_business_age ? `${alert.max_business_age} years` : '50+ years'}
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
                      {alert.min_employees || '0'} - {alert.max_employees ? `${alert.max_employees} employees` : '1000+ employees'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Annual Revenue */}
            {(alert.min_annual_revenue !== null || alert.max_annual_revenue !== null) && (
              <div className="py-4">
                <div className="flex items-center">
                  <BanknotesIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Annual Revenue</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      ${(alert.min_annual_revenue || 0).toLocaleString()} - {alert.max_annual_revenue ? `$${alert.max_annual_revenue.toLocaleString()}` : '$10M+'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Annual EBITDA */}
            {(alert.min_ebitda !== null || alert.max_ebitda !== null) && (
              <div className="py-4">
                <div className="flex items-center">
                  <BanknotesIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Annual EBITDA</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      ${(alert.min_ebitda || 0).toLocaleString()} - {alert.max_ebitda ? `$${alert.max_ebitda.toLocaleString()}` : '$5M+'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Profit Margin */}
            {(alert.min_profit_margin !== null || alert.max_profit_margin !== null) && (
              <div className="py-4">
                <div className="flex items-center">
                  <ChartBarIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Profit Margin</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {alert.min_profit_margin || '0'}% - {alert.max_profit_margin ? `${alert.max_profit_margin}%` : '100%+'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Selling Multiple */}
            {(alert.min_selling_multiple !== null || alert.max_selling_multiple !== null) && (
              <div className="py-4">
                <div className="flex items-center">
                  <CalculatorIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Selling Multiple</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {alert.min_selling_multiple || '0'}x - {alert.max_selling_multiple ? `${alert.max_selling_multiple}x` : '20x+'}
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
          </>
        )}
      </div>
    </div>
  );
} 