import { getMarketStats } from '@/hooks/useMarketStats';

interface MarketStats {
  businessType: string;
  avgMultiple: number;
  avgMonthlyRevenue: number;
}

export async function MarketSnapshot() {
  const marketStats = await getMarketStats();

  if (!marketStats || marketStats.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Market Snapshot</h2>
        <div className="text-center py-6 text-gray-500">
          No market data available
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Market Snapshot</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Business Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                EBITDA Multiple
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Monthly Revenue
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {marketStats.map((stat, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">
                  {stat.businessType}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {stat.avgMultiple.toFixed(1)}x
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  ${(stat.avgMonthlyRevenue / 1000).toFixed(0)}k
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 