from src.api.listings_api import get_all_listings
from src.services.deal_analyzer import analyze_listings
from src.services.listing_details_scraper import ListingDetailsScraper
from config.search_queries import get_queries_from_db
import json
from datetime import datetime

def main():
    try:
        FINAL_LIMIT = 10  # Number of listings to analyze per platform
        print(f"Starting business listing search...")
        print(f"Process: Fetch listings → Filter by criteria → Analyze top {FINAL_LIMIT} matches")
        
        # Get static search URLs
        search_queries = get_queries_from_db()
        
        # Get listing results (includes Empire Flippers)
        results = get_all_listings(limit=FINAL_LIMIT, queries=search_queries, debug=False)
        
        # Only proceed with analysis if we have results
        if results and any(results.values()):
            print("\nAnalyzing acquisition opportunities...")
            
            # Combine all listings into a single list
            all_listings = []
            for platform, listings in results.items():
                for listing in listings:
                    listing['source_platform'] = platform
                    all_listings.append(listing)
            
            if all_listings:
                # Enrich listings with detailed information
                print("\nEnriching listings with detailed information...")
                scraper = ListingDetailsScraper(debug=False)
                enriched_listings = scraper.enrich_listings(all_listings)
                
                # Generate analysis for listings
                if enriched_listings:
                    analysis = analyze_listings(enriched_listings, debug=False)
                    
                    if analysis:
                        print("\nAcquisition Analysis:")
                        print(analysis['acquisition_analysis'])
                    else:
                        print("No analysis was generated.")
            else:
                print("No listings found to analyze.")
                
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return None

if __name__ == "__main__":
    main()