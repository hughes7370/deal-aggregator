import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Alert {
  id: string;
  user_id: string;
  min_price?: number | null;
  max_price?: number | null;
  min_revenue?: number | null;
  max_revenue?: number | null;
  business_types?: string[] | null;
  search_keywords?: string[] | null;
  created_at: string;
}

export async function getUserAlerts(userId: string): Promise<Alert[]> {
  try {
    const supabase = createClientComponentClient();
    
    const { data: alerts, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user alerts:', error);
      return [];
    }

    return alerts || [];
  } catch (error) {
    console.error('Error in getUserAlerts:', error);
    return [];
  }
} 