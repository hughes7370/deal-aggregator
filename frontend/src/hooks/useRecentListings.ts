import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getMatchingListings } from '@/utils/alertMatching';

interface DatabaseListing {
  id: string;
  title: string;
  description: string;
  industry: string;
  asking_price: number;
  revenue: number;
  first_seen_at: string;
  source_platform: string;
}

interface Listing {
  id: string;
  title: string;
  businessType: string;
  askingPrice: number;
  monthlyRevenue: number;
  multiple: number;
  daysListed: number;
  hoursListed: number;
  source: string;
  description: string;
  firstSeenAt: number;
}

export async function getRecentListings(userId: string): Promise<Listing[]> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get matching listings using alert criteria
    const matchingListings = await getMatchingListings(userId, thirtyDaysAgo) as DatabaseListing[];

    // Map and sort the listings by newest first
    const formattedListings = matchingListings
      .map(listing => {
        const timeDiff = Date.now() - new Date(listing.first_seen_at).getTime();
        const hoursListed = Math.floor(timeDiff / (1000 * 60 * 60));
        const daysListed = Math.floor(hoursListed / 24);

        return {
          id: listing.id,
          title: listing.title || 'Untitled Listing',
          description: listing.description || '',
          businessType: listing.industry || 'Unknown Type',
          askingPrice: listing.asking_price || 0,
          monthlyRevenue: listing.revenue ? Math.round(listing.revenue / 12) : 0,
          multiple: listing.asking_price && listing.revenue 
            ? listing.asking_price / (listing.revenue * 12)
            : 0,
          daysListed,
          hoursListed,
          source: listing.source_platform ? listing.source_platform.replace(/_/g, ' ') : 'Unknown Source',
          firstSeenAt: new Date(listing.first_seen_at).getTime()
        };
      })
      .sort((a, b) => b.firstSeenAt - a.firstSeenAt) // Sort by newest first
      .slice(0, 4); // Get only the top 4 listings

    return formattedListings;
  } catch (error) {
    console.error('Error fetching recent listings:', error);
    return [];
  }
} 