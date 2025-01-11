import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getMatchingListings } from '@/utils/alertMatching';

interface Listing {
  id: string;
  title: string;
  businessType: string;
  askingPrice: number;
  monthlyRevenue: number;
  multiple: number;
}

export async function getRecentListings(userId: string): Promise<Listing[]> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get matching listings using alert criteria
    const matchingListings = await getMatchingListings(userId, thirtyDaysAgo);

    // Map and sort the listings
    const formattedListings = matchingListings
      .map(listing => ({
        id: listing.id,
        title: listing.title || 'Untitled Listing',
        businessType: listing.industry || 'Unknown Type',
        askingPrice: listing.asking_price || 0,
        monthlyRevenue: listing.revenue || 0,
        multiple: listing.asking_price && listing.revenue 
          ? listing.asking_price / (listing.revenue * 12)
          : 0
      }))
      .sort((a, b) => b.askingPrice - a.askingPrice)
      .slice(0, 4); // Get only the top 4 listings

    return formattedListings;
  } catch (error) {
    console.error('Error fetching recent listings:', error);
    return [];
  }
} 