'use client';

import { useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { DealMetrics } from '@/types/dealMetrics';

export function useActiveDealStats() {
  const getActiveDealStats = useCallback(async (userId: string) => {
    try {
      const supabase = createClientComponentClient();
      const { data: metrics, error } = await supabase
        .from('deal_metrics')
        .select('*')
        .eq('user_id', userId)
        .single();

      // If no data found, return default values
      if (error?.code === 'PGRST116') {
        return {
          totalDeals: 0,
          recentDeals: 0,
          stages: [],
          priorities: [],
          avgDealSize: 0,
          lastUpdated: new Date().toISOString(),
        };
      }

      if (error) throw error;

      return {
        totalDeals: metrics.total_deals,
        recentDeals: metrics.recent_deals,
        stages: metrics.stages || [],
        priorities: metrics.priorities || [],
        avgDealSize: metrics.avg_deal_size || 0,
        lastUpdated: metrics.last_updated,
      };
    } catch (error) {
      console.error('Error fetching active deal stats:', error);
      return null;
    }
  }, []);

  return { getActiveDealStats };
} 