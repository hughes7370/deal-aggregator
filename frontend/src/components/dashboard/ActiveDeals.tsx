'use client';

import { useEffect, useState } from 'react';
import { useActiveDealStats } from '@/hooks/useActiveDealStats';
import { DealStage } from '@/types/dealMetrics';
import { formatMoney } from '../../lib/utils';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface ActiveDealsProps {
  userId: string;
}

export default function ActiveDeals({ userId }: ActiveDealsProps) {
  const { getActiveDealStats } = useActiveDealStats();
  const [stats, setStats] = useState<{
    totalDeals: number;
    recentDeals: number;
    stages: DealStage[];
    avgDealSize: number;
    lastUpdated: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true);
        const data = await getActiveDealStats(userId);
        setStats(data);
        setError(null);
      } catch (err) {
        setError('Failed to load deal statistics');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [getActiveDealStats, userId]);

  if (isLoading) {
    return <div className="animate-pulse">Loading deal statistics...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!stats) {
    return <div>No active deals found.</div>;
  }

  return (
    <div className="rounded-lg bg-white shadow">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Active Deals</h2>
          <a
            href="/dealtracker"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View all
          </a>
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Total Active Deals */}
          <div className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6">
            <dt>
              <div className="absolute rounded-md bg-blue-500 p-3">
                <ChartBarIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                Total Active Deals
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalDeals}
              </p>
            </dd>
          </div>

          {/* Average Deal Size */}
          <div className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6">
            <dt>
              <div className="absolute rounded-md bg-green-500 p-3">
                <ArrowTrendingUpIcon
                  className="h-6 w-6 text-white"
                  aria-hidden="true"
                />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                Average Deal Size
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">
                {formatMoney(stats.avgDealSize)}
              </p>
            </dd>
          </div>

          {/* Recently Added */}
          <div className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6">
            <dt>
              <div className="absolute rounded-md bg-purple-500 p-3">
                <ClockIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                Recently Added (30d)
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">
                {stats.recentDeals}
              </p>
            </dd>
          </div>
        </dl>

        {/* Deals by Stage */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500">Deals by Stage</h3>
          <div className="mt-2 space-y-2">
            {stats.stages.map((stage) => (
              <div
                key={stage.stage}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <span className="text-sm text-gray-900">{stage.stage}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    ({stage.count})
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatMoney(stage.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-4 text-right text-xs text-gray-500">
          Last updated: {new Date(stats.lastUpdated).toLocaleString()}
        </div>
      </div>
    </div>
  );
} 