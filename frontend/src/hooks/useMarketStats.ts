import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface MarketStats {
  businessType: string;
  avgMultiple: number;
  avgMonthlyRevenue: number;
  avgAskingPrice: number;
  avgProfitMargin: number;
}

interface MarketStatsRow {
  business_type: string;
  avg_multiple: number;
  avg_monthly_revenue: number;
  avg_asking_price: number;
  avg_profit_margin: number;
}

export async function getMarketStats(): Promise<MarketStats[]> {
  try {
    const supabase = createClientComponentClient();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from('market_statistics')
      .select('business_type, avg_multiple, avg_monthly_revenue, avg_asking_price, avg_profit_margin')
      .eq('time_period', 'last_30_days')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching market statistics:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Format the statistics and remove duplicates by business type
    const uniqueStats = new Map();
    (data as MarketStatsRow[]).forEach(stat => {
      if (!uniqueStats.has(stat.business_type)) {
        uniqueStats.set(stat.business_type, {
          businessType: stat.business_type || 'Unknown',
          avgMultiple: stat.avg_multiple || 0,
          avgMonthlyRevenue: stat.avg_monthly_revenue || 0,
          avgAskingPrice: stat.avg_asking_price || 0,
          avgProfitMargin: stat.avg_profit_margin || 0
        });
      }
    });

    return Array.from(uniqueStats.values());
  } catch (error) {
    console.error('Error in getMarketStats:', error);
    return [];
  }
} 