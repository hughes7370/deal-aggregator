'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface DealStats {
  totalSaved: number;
  recentlyAdded: number;
  statusCounts: {
    status: string;
    count: number;
    color: string;
  }[];
  dealsByStage: {
    stage: string;
    count: number;
    color: string;
  }[];
  averageDealSize: number;
  recentActivity: {
    id: string;
    title: string;
    action: string;
    timestamp: string;
  }[];
}

interface Listing {
  id: string;
  title: string;
  asking_price: number;
}

interface DealTracker {
  id: string;
  status: string;
  stage: string;
  last_updated: string;
}

interface SavedListing {
  id: string;
  listing_id: string;
  saved_at: string;
  listings: Listing;
  deal_tracker: DealTracker | null;
}

const STATUS_COLORS = {
  'Watching': 'text-blue-500',
  'Contacted': 'text-yellow-500',
  'In Discussion': 'text-purple-500',
  'Due Diligence': 'text-orange-500',
  'Offer Made': 'text-green-500',
  'Closed': 'text-gray-500'
};

const STAGE_COLORS = {
  'Initial Review': 'text-blue-500',
  'Research': 'text-purple-500',
  'Contact': 'text-yellow-500',
  'Negotiation': 'text-orange-500',
  'Due Diligence': 'text-green-500',
  'Closed': 'text-gray-500'
};

export async function getActiveDealStats(userId: string): Promise<DealStats> {
  try {
    const supabase = createClientComponentClient();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get deals with their status and stages
    const { data: dealsData } = await supabase
      .from('user_saved_listings')
      .select(`
        id,
        listing_id,
        saved_at,
        listings!inner(
          id,
          title,
          asking_price
        ),
        deal_tracker(
          id,
          status,
          stage,
          last_updated
        )
      `)
      .eq('user_id', userId)
      .order('saved_at', { ascending: false })
      .returns<SavedListing[]>();

    if (!dealsData) {
      throw new Error('No deals data found');
    }

    // Count deals by status and stage
    const statusCounts = new Map<string, number>();
    const stagesCounts = new Map<string, number>();
    let totalAskingPrice = 0;
    const recentActivityList: Array<{
      id: string;
      title: string;
      action: string;
      timestamp: string;
    }> = [];

    dealsData.forEach((deal) => {
      // Status counts
      const status = deal.deal_tracker?.status || 'Watching';
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);

      // Stage counts
      const stage = deal.deal_tracker?.stage || 'Initial Review';
      stagesCounts.set(stage, (stagesCounts.get(stage) || 0) + 1);

      // Sum asking prices for average
      totalAskingPrice += deal.listings.asking_price || 0;

      // Recent activity
      if (deal.deal_tracker?.last_updated) {
        recentActivityList.push({
          id: deal.listing_id,
          title: deal.listings.title,
          action: deal.deal_tracker.status,
          timestamp: deal.deal_tracker.last_updated
        });
      }
    });

    // Calculate recently added count
    const recentlyAdded = dealsData.filter(deal => 
      new Date(deal.saved_at) > thirtyDaysAgo
    ).length;

    // Format status counts with colors
    const formattedStatusCounts = Array.from(statusCounts.entries())
      .map(([status, count]) => ({
        status,
        count,
        color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'text-gray-500'
      }))
      .sort((a, b) => b.count - a.count);

    // Format stages counts with colors
    const formattedStagesCounts = Array.from(stagesCounts.entries())
      .map(([stage, count]) => ({
        stage,
        count,
        color: STAGE_COLORS[stage as keyof typeof STAGE_COLORS] || 'text-gray-500'
      }))
      .sort((a, b) => b.count - a.count);

    // Sort recent activity by timestamp
    const sortedRecentActivity = recentActivityList
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5); // Last 5 activities

    return {
      totalSaved: dealsData.length,
      recentlyAdded,
      statusCounts: formattedStatusCounts,
      dealsByStage: formattedStagesCounts,
      averageDealSize: dealsData.length > 0 ? Math.round(totalAskingPrice / dealsData.length) : 0,
      recentActivity: sortedRecentActivity
    };
  } catch (error) {
    console.error('Error fetching active deal stats:', error);
    return {
      totalSaved: 0,
      recentlyAdded: 0,
      statusCounts: [],
      dealsByStage: [],
      averageDealSize: 0,
      recentActivity: []
    };
  }
} 