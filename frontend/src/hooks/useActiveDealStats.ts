import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface DealStats {
  totalSaved: number;
  recentlyAdded: number;
  statusCounts: {
    status: string;
    count: number;
    color: string;
  }[];
}

const STATUS_COLORS = {
  'Watching': 'text-blue-500',
  'Contacted': 'text-yellow-500',
  'In Discussion': 'text-purple-500',
  'Due Diligence': 'text-orange-500',
  'Offer Made': 'text-green-500',
  'Closed': 'text-gray-500'
};

export async function getActiveDealStats(userId: string): Promise<DealStats> {
  try {
    const supabase = createClientComponentClient();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get total saved deals
    const { count: totalSaved } = await supabase
      .from('saved_deals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get recently added deals
    const { count: recentlyAdded } = await supabase
      .from('saved_deals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gt('created_at', thirtyDaysAgo.toISOString());

    // Get deals by status
    const { data: statusData } = await supabase
      .from('saved_deals')
      .select('status')
      .eq('user_id', userId);

    // Count deals by status
    const statusCounts = new Map<string, number>();
    statusData?.forEach(({ status }) => {
      if (status) {
        statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
      }
    });

    // Format status counts with colors
    const formattedStatusCounts = Array.from(statusCounts.entries())
      .map(([status, count]) => ({
        status,
        count,
        color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'text-gray-500'
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalSaved: totalSaved || 0,
      recentlyAdded: recentlyAdded || 0,
      statusCounts: formattedStatusCounts
    };
  } catch (error) {
    console.error('Error fetching active deal stats:', error);
    return {
      totalSaved: 0,
      recentlyAdded: 0,
      statusCounts: []
    };
  }
} 