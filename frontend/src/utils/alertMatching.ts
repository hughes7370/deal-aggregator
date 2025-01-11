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
}

interface Listing {
  id: string;
  title: string;
  description: string;
  asking_price: number | null;
  revenue: number | null;
  industry: string | null;
}

export async function getMatchingListings(userId: string, since?: Date): Promise<Listing[]> {
  try {
    const supabase = createClientComponentClient();

    // Get user's alerts
    const { data: alerts, error: alertsError } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', userId);

    if (alertsError) {
      console.error('Error fetching alerts:', alertsError);
      return [];
    }

    if (!alerts || alerts.length === 0) {
      return [];
    }

    // Build query for listings
    let query = supabase
      .from('listings')
      .select('*')
      .eq('status', 'active');

    // Add date filter if provided
    if (since) {
      query = query.gte('created_at', since.toISOString());
    }

    const { data: listings, error: listingsError } = await query;

    if (listingsError) {
      console.error('Error fetching listings:', listingsError);
      return [];
    }

    if (!listings) {
      return [];
    }

    // Filter listings based on alerts criteria
    const matchingListings = listings.filter(listing => {
      // Check if listing matches any alert criteria
      return alerts.some(alert => {
        // Price range check
        if (alert.min_price && listing.asking_price && listing.asking_price < alert.min_price) return false;
        if (alert.max_price && listing.asking_price && listing.asking_price > alert.max_price) return false;

        // Revenue range check
        if (alert.min_revenue && listing.revenue && listing.revenue < alert.min_revenue) return false;
        if (alert.max_revenue && listing.revenue && listing.revenue > alert.max_revenue) return false;

        // Business type check
        if (alert.business_types?.length && listing.industry) {
          if (!alert.business_types.includes(listing.industry)) return false;
        }

        // Keyword search in title and description
        if (alert.search_keywords?.length) {
          const searchText = `${listing.title || ''} ${listing.description || ''}`.toLowerCase();
          return alert.search_keywords.some(keyword =>
            searchText.includes(keyword.toLowerCase())
          );
        }

        return true;
      });
    });

    return matchingListings;
  } catch (error) {
    console.error('Error in getMatchingListings:', error);
    return [];
  }
} 