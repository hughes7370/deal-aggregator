import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface MarketStats {
  businessType: string;
  avgMultiple: number;
  avgMonthlyRevenue: number;
}

interface MarketStatsRow {
  business_type: string;
  avg_multiple: number;
  avg_monthly_revenue: number;
}

export async function getMarketStats(): Promise<MarketStats[]> {
  try {
    const supabase = createClientComponentClient();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from('market_statistics')
      .select('business_type, avg_multiple, avg_monthly_revenue')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching market statistics:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Format the statistics
    return (data as MarketStatsRow[]).map(stat => ({
      businessType: stat.business_type || 'Unknown',
      avgMultiple: stat.avg_multiple || 0,
      avgMonthlyRevenue: stat.avg_monthly_revenue || 0
    }));
  } catch (error) {
    console.error('Error in getMarketStats:', error);
    return [];
  }
} 