'use client';

import { useState, useEffect } from 'react';
import { getMarketStats } from '@/hooks/useMarketStats';
import { formatMoney } from '@/utils/formatters';
import { ArrowUpIcon, ArrowDownIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface MarketStats {
  businessType: string;
  avgMultiple: number;
  avgMonthlyRevenue: number;
  avgAskingPrice: number;
  avgProfitMargin: number;
}

type SortField = 'businessType' | 'avgMultiple' | 'avgMonthlyRevenue' | 'avgAskingPrice' | 'avgProfitMargin';
type SortDirection = 'asc' | 'desc';

interface TooltipProps {
  content: string;
}

function Tooltip({ content }: TooltipProps) {
  return (
    <div className="group relative inline-block">
      <InformationCircleIcon className="h-3 w-3 inline ml-1 text-gray-400" />
      <div className="hidden group-hover:block absolute z-10 w-48 p-2 mt-1 text-xs text-white bg-gray-900 rounded-md -left-20 top-full">
        {content}
        <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -top-1 left-24"></div>
      </div>
    </div>
  );
}

function getColorClass(value: number, type: 'multiple' | 'margin'): string {
  if (type === 'multiple') {
    if (value >= 5) return 'text-green-600';
    if (value >= 3) return 'text-blue-600';
    return 'text-gray-600';
  } else {
    if (value >= 0.3) return 'text-green-600';
    if (value >= 0.15) return 'text-blue-600';
    return 'text-gray-600';
  }
}

export default function MarketSnapshot() {
  const [sortField, setSortField] = useState<SortField>('avgMultiple');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [marketStats, setMarketStats] = useState<MarketStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const stats = await getMarketStats();
      setMarketStats(stats);
      setIsLoading(false);
    }
    loadStats();
  }, []);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedStats = [...marketStats].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string') {
      return multiplier * aValue.localeCompare(bValue as string);
    }
    return multiplier * (Number(aValue) - Number(bValue));
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium text-gray-900">Market Snapshot</h2>
          <div className="text-xs text-gray-500">Loading...</div>
        </div>
        <div className="animate-pulse space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!marketStats || marketStats.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium text-gray-900">Market Snapshot</h2>
          <div className="text-xs text-gray-500">No data available</div>
        </div>
      </div>
    );
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? 
      <ArrowUpIcon className="h-3 w-3 inline ml-1" /> : 
      <ArrowDownIcon className="h-3 w-3 inline ml-1" />;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium text-gray-900">Market Snapshot</h2>
        <div className="text-xs text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
      <div className="overflow-x-auto -mx-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                onClick={() => handleSort('businessType')}
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Business Type
                <SortIcon field="businessType" />
              </th>
              <th 
                onClick={() => handleSort('avgAskingPrice')}
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Avg Price
                <Tooltip content="Average asking price for businesses in this category" />
                <SortIcon field="avgAskingPrice" />
              </th>
              <th 
                onClick={() => handleSort('avgMonthlyRevenue')}
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Revenue
                <Tooltip content="Average monthly revenue" />
                <SortIcon field="avgMonthlyRevenue" />
              </th>
              <th 
                onClick={() => handleSort('avgMultiple')}
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Multiple
                <Tooltip content="EBITDA Multiple (Total Price / Annual Profit)" />
                <SortIcon field="avgMultiple" />
              </th>
              <th 
                onClick={() => handleSort('avgProfitMargin')}
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Margin
                <Tooltip content="Profit Margin (Profit / Revenue)" />
                <SortIcon field="avgProfitMargin" />
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {sortedStats.map((stat, index) => (
              <tr 
                key={index} 
                className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                onClick={() => window.location.href = `/dealflow?type=${encodeURIComponent(stat.businessType)}`}
              >
                <td className="px-4 py-2 text-sm font-medium text-gray-900">
                  {stat.businessType}
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">
                  {formatMoney(stat.avgAskingPrice)}
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">
                  {formatMoney(stat.avgMonthlyRevenue)}/mo
                </td>
                <td className={`px-4 py-2 text-sm font-medium ${getColorClass(stat.avgMultiple, 'multiple')}`}>
                  {stat.avgMultiple.toFixed(1)}x
                </td>
                <td className={`px-4 py-2 text-sm font-medium ${getColorClass(stat.avgProfitMargin, 'margin')}`}>
                  {Math.round(stat.avgProfitMargin)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 