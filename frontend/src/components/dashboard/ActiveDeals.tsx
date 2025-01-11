'use client';

import { getActiveDealStats } from '@/hooks/useActiveDealStats';
import { 
  BookmarkIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ClockIcon,
  BuildingOfficeIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { formatMoney } from '@/utils/formatters';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface SectionProps {
  title: string;
  isCollapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const Section = ({ title, isCollapsed, onToggle, children }: SectionProps) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100">
    <div 
      className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
      onClick={onToggle}
    >
      <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      {isCollapsed ? (
        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
      ) : (
        <ChevronUpIcon className="h-5 w-5 text-gray-400" />
      )}
    </div>
    <AnimatePresence>
      {!isCollapsed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const LoadingCard = () => (
  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 animate-pulse">
    <div className="flex items-center">
      <div className="p-2 bg-gray-100 rounded-lg">
        <div className="h-6 w-6 bg-gray-200 rounded" />
      </div>
      <div className="ml-4 space-y-2 flex-1">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-6 bg-gray-200 rounded w-32" />
      </div>
    </div>
  </div>
);

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="bg-red-50 rounded-lg p-6 text-center">
    <ExclamationCircleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-red-800 mb-2">Unable to load deals</h3>
    <p className="text-sm text-red-600 mb-4">There was an error loading your active deals. Please try again.</p>
    <button
      onClick={onRetry}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
    >
      <ArrowPathIcon className="h-4 w-4 mr-2" />
      Retry
    </button>
  </div>
);

export function ActiveDeals({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const [dealStats, setDealStats] = useState<Awaited<ReturnType<typeof getActiveDealStats>> | null>(null);

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const refreshData = () => {
    startTransition(async () => {
      try {
        const stats = await getActiveDealStats(userId);
        setDealStats(stats);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        setError(err as Error);
      }
    });
  };

  if (error) {
    return <ErrorState onRetry={refreshData} />;
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Active Deals</h2>
          <p className="text-sm text-gray-500 mt-1">
            Last updated {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={refreshData}
            disabled={isPending}
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
              isPending ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <ArrowPathIcon className={`h-5 w-5 text-gray-600 ${
              isPending ? 'animate-spin' : ''
            }`} />
          </button>
          <a
            href="/dealtracker"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View All
          </a>
        </div>
      </div>

      {/* Quick Jump Navigation */}
      <nav className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {['Metrics', 'Stages', 'Types', 'Activity'].map(section => (
          <button
            key={section}
            onClick={() => document.getElementById(section.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })}
            className="text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap px-3 py-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            {section}
          </button>
        ))}
      </nav>

      {isPending ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* Key Metrics Grid */}
          <div id="metrics" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Saved */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 cursor-pointer hover:border-blue-200 transition-colors"
              onClick={() => router.push('/dealtracker?filter=all')}
            >
              <div className="flex items-center">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <BookmarkIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Saved</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dealStats?.totalSaved}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Average Deal Size */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 cursor-pointer hover:border-green-200 transition-colors"
              onClick={() => router.push('/dealtracker?sort=price')}
            >
              <div className="flex items-center">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Deal Size</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatMoney(dealStats?.averageDealSize || 0)}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Recently Added */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 cursor-pointer hover:border-purple-200 transition-colors"
              onClick={() => router.push('/dealtracker?sort=recent')}
            >
              <div className="flex items-center">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <ArrowPathIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recently Added</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dealStats?.recentlyAdded}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Top Business Type */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 cursor-pointer hover:border-orange-200 transition-colors"
              onClick={() => router.push('/dealtracker?filter=type')}
            >
              <div className="flex items-center">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <BuildingOfficeIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Top Business Type</p>
                  <p className="text-lg font-semibold text-gray-900 truncate">
                    {dealStats?.topBusinessTypes[0]?.type || 'N/A'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Deals by Stage */}
          {dealStats?.dealsByStage.length > 0 && (
            <Section
              title="Deals by Stage"
              isCollapsed={collapsedSections['stages']}
              onToggle={() => toggleSection('stages')}
            >
              <div id="stages" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-y lg:divide-y-0 divide-gray-200">
                {dealStats.dealsByStage.map((stage) => (
                  <motion.div
                    key={stage.stage}
                    whileHover={{ backgroundColor: '#F9FAFB' }}
                    className="p-4 cursor-pointer"
                    onClick={() => router.push(`/dealtracker?stage=${stage.stage}`)}
                  >
                    <p className={`text-sm font-medium ${stage.color}`}>
                      {stage.stage}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">
                      {stage.count}
                    </p>
                  </motion.div>
                ))}
              </div>
            </Section>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Business Types */}
            {dealStats?.topBusinessTypes.length > 0 && (
              <Section
                title="Top Business Types"
                isCollapsed={collapsedSections['types']}
                onToggle={() => toggleSection('types')}
              >
                <div id="types" className="divide-y divide-gray-200">
                  {dealStats.topBusinessTypes.map((type) => (
                    <motion.div
                      key={type.type}
                      whileHover={{ backgroundColor: '#F9FAFB' }}
                      className="px-6 py-3 flex justify-between items-center cursor-pointer"
                      onClick={() => router.push(`/dealtracker?type=${type.type}`)}
                    >
                      <span className="text-sm text-gray-900">{type.type}</span>
                      <span className="text-sm font-medium text-gray-600">{type.count} deals</span>
                    </motion.div>
                  ))}
                </div>
              </Section>
            )}

            {/* Recent Activity */}
            {dealStats?.recentActivity.length > 0 && (
              <Section
                title="Recent Activity"
                isCollapsed={collapsedSections['activity']}
                onToggle={() => toggleSection('activity')}
              >
                <div id="activity" className="divide-y divide-gray-200">
                  {dealStats.recentActivity.map((activity) => (
                    <motion.div
                      key={`${activity.id}-${activity.timestamp}`}
                      whileHover={{ backgroundColor: '#F9FAFB' }}
                      className="px-6 py-3 flex items-center space-x-4 cursor-pointer"
                      onClick={() => router.push(`/listings/${activity.id}`)}
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
                    </motion.div>
                  ))}
                </div>
              </Section>
            )}
          </div>
        </>
      )}
    </div>
  );
} 