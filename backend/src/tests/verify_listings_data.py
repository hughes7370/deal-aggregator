from backend.src.database.supabase_db import SupabaseClient
from datetime import datetime

def verify_listings_data():
    """Verify listings data in database"""
    supabase = SupabaseClient()
    
    try:
        print("\n📊 Listings Data Analysis")
        print("=" * 50)
        
        # Get all listings
        all_listings = supabase.client.table('listings')\
            .select('*')\
            .execute()
            
        if not all_listings.data:
            print("❌ No listings found in database")
            return
            
        total_listings = len(all_listings.data)
        print(f"\nTotal listings: {total_listings}")
        
        # Analyze price distribution
        prices = [l.get('asking_price', 0) for l in all_listings.data if l.get('asking_price')]
        if prices:
            print(f"\nPrice Range:")
            print(f"Min: ${min(prices):,}")
            print(f"Max: ${max(prices):,}")
        
        # Count by status
        statuses = {}
        for listing in all_listings.data:
            status = listing.get('status', 'unknown')
            statuses[status] = statuses.get(status, 0) + 1
            
        print("\nStatus Distribution:")
        for status, count in statuses.items():
            print(f"{status}: {count} listings")
        
        # Count by industry
        industries = {}
        for listing in all_listings.data:
            industry = listing.get('industry', 'Not specified')
            industries[industry] = industries.get(industry, 0) + 1
            
        print("\nTop Industries:")
        sorted_industries = sorted(industries.items(), key=lambda x: x[1], reverse=True)
        for industry, count in sorted_industries[:10]:
            print(f"{industry}: {count} listings")
            
        # Sample listings across price ranges
        print("\nSample Listings Across Price Ranges:")
        if prices:
            ranges = [
                (0, 100000),
                (100000, 1000000),
                (1000000, float('inf'))
            ]
            
            for min_price, max_price in ranges:
                range_listings = [l for l in all_listings.data 
                                if l.get('asking_price', 0) >= min_price 
                                and l.get('asking_price', 0) < max_price]
                if range_listings:
                    print(f"\nRange ${min_price:,} - ${max_price if max_price != float('inf') else 'inf'}:")
                    sample = range_listings[0]  # Show first listing in range
                    print(f"- {sample['title']}")
                    print(f"  Price: ${sample.get('asking_price', 0):,}")
                    print(f"  Industry: {sample.get('industry', 'Not specified')}")
        
    except Exception as e:
        print(f"❌ Error analyzing listings data: {e}")

if __name__ == "__main__":
    verify_listings_data() 