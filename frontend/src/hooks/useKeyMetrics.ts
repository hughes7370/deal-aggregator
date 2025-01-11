import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getMatchingListings } from '@/utils/alertMatching';

interface KeyMetricsData {
  newListingsCount: number;
  matchingCriteriaCount: number;
  priceRange: string;
  mostActive: string;
}

export async function getKeyMetrics(userId: string): Promise<KeyMetricsData> {
  try {
    const supabase = createClientComponentClient();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get new listings count in the last 30 days
    const { count: newListingsCount } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Get matching listings count
    const matchingListings = await getMatchingListings(userId, thirtyDaysAgo);
    const matchingCriteriaCount = matchingListings.length;

    // Get price range of active listings
    const { data: priceData } = await supabase
      .from('listings')
      .select('asking_price')
      .eq('status', 'active')
      .order('asking_price', { ascending: true });

    let priceRange = 'No data';
    if (priceData && priceData.length > 0) {
      const validPrices = priceData
        .map(d => d.asking_price)
        .filter((price): price is number => price !== null && !isNaN(price));
      
      if (validPrices.length > 0) {
        const minPrice = Math.min(...validPrices);
        const maxPrice = Math.max(...validPrices);
        priceRange = `$${(minPrice / 1000).toFixed(0)}k - $${(maxPrice / 1000).toFixed(0)}k`;
      }
    }

    // Get most active business type
    const { data: businessTypes } = await supabase
      .from('listings')
      .select('industry')
      .eq('status', 'active')
      .gte('created_at', thirtyDaysAgo.toISOString());

    let mostActive = 'No data';
    if (businessTypes && businessTypes.length > 0) {
      const typeCounts = new Map<string, number>();
      businessTypes.forEach(({ industry }) => {
        if (industry) {
          typeCounts.set(industry, (typeCounts.get(industry) || 0) + 1);
        }
      });

      let maxCount = 0;
      typeCounts.forEach((count, type) => {
        if (count > maxCount) {
          maxCount = count;
          mostActive = type;
        }
      });
    }

    return {
      newListingsCount: newListingsCount || 0,
      matchingCriteriaCount,
      priceRange,
      mostActive,
    };
  } catch (error) {
    console.error('Error fetching key metrics:', error);
    return {
      newListingsCount: 0,
      matchingCriteriaCount: 0,
      priceRange: 'Error',
      mostActive: 'Error',
    };
  }
} 