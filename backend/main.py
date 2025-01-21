from backend.src.api.listings_api import get_all_listings
from backend.src.services.deal_analyzer import analyze_listings
from backend.src.services.listing_details_scraper import ListingDetailsScraper
from config.search_queries import get_queries_from_db
import json
from datetime import datetime, timedelta
from backend.src.database.supabase_db import SupabaseClient
import threading
import signal

# Global flag for scraper status
_scraper_running = False
_scraper_lock = threading.Lock()

def is_scraper_running():
    """Check if scraper is currently running"""
    with _scraper_lock:
        return _scraper_running

def set_scraper_running(status: bool):
    """Set scraper running status"""
    with _scraper_lock:
        global _scraper_running
        _scraper_running = status

def run_with_timeout(func, timeout_seconds):
    """Run a function with a timeout"""
    def handler(signum, frame):
        raise TimeoutError("Function execution timed out")
    
    # Set up the timeout
    signal.signal(signal.SIGALRM, handler)
    signal.alarm(timeout_seconds)
    
    try:
        result = func()
        signal.alarm(0)  # Disable the alarm
        return result
    except TimeoutError as e:
        raise e
    finally:
        signal.alarm(0)  # Ensure the alarm is disabled

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

def run_scrapers():
    """
    Run all scrapers and store results in the database
    """
    # Check if scraper is already running
    if is_scraper_running():
        print("Scraper is already running, skipping this run")
        return
    
    try:
        # Set scraper as running
        set_scraper_running(True)
        
        # Initialize database client
        db = SupabaseClient()
        
        def scraper_task():
            # Get listings from all sources
            print("Starting scraper run...")
            all_listings = get_all_listings()
            
            # Store listings in database
            for platform, listings in all_listings.items():
                print(f"\nProcessing {len(listings)} listings from {platform}")
                for listing in listings:
                    try:
                        db.store_listing(listing)
                    except Exception as e:
                        print(f"Error storing listing: {e}")
                        continue
            
            print("\nScraper run completed successfully")
        
        # Run the scraper with a 45-minute timeout
        run_with_timeout(scraper_task, 45 * 60)  # 45 minutes in seconds
        
    except TimeoutError:
        print("Scraper run timed out after 45 minutes")
    except Exception as e:
        print(f"Error in scraper run: {e}")
        raise
    finally:
        # Always mark scraper as not running when done
        set_scraper_running(False)

if __name__ == "__main__":
    main()