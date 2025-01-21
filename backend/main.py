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
        print(f"🔒 Scraper running status set to: {status}")

def run_with_timeout(func, timeout_seconds):
    """Run a function with a timeout"""
    def handler(signum, frame):
        print("⚠️ Timeout signal received - scraper execution exceeded time limit")
        raise TimeoutError("Function execution timed out")
    
    print(f"⏱️ Setting up timeout handler for {timeout_seconds} seconds")
    # Set up the timeout
    signal.signal(signal.SIGALRM, handler)
    signal.alarm(timeout_seconds)
    
    try:
        print("▶️ Starting function execution with timeout")
        result = func()
        signal.alarm(0)  # Disable the alarm
        print("✅ Function completed successfully within timeout")
        return result
    except TimeoutError as e:
        print("❌ Function execution timed out")
        raise e
    finally:
        signal.alarm(0)  # Ensure the alarm is disabled
        print("🔄 Timeout handler cleanup completed")

def main():
    try:
        FINAL_LIMIT = 10  # Number of listings to analyze per platform
        print(f"Starting business listing search...")
        print(f"Process: Fetch listings → Filter by criteria → Analyze top {FINAL_LIMIT} matches")
        
        # Get static search URLs
        print("📚 Fetching search queries from database...")
        search_queries = get_queries_from_db()
        print(f"Found {len(search_queries)} search queries")
        
        # Get listing results (includes Empire Flippers)
        print("\n🔍 Fetching listings from all platforms...")
        results = get_all_listings(limit=FINAL_LIMIT, queries=search_queries, debug=False)
        
        # Only proceed with analysis if we have results
        if results and any(results.values()):
            print("\n📊 Analyzing acquisition opportunities...")
            print("Results by platform:")
            for platform, listings in results.items():
                print(f"- {platform}: {len(listings)} listings")
            
            # Combine all listings into a single list
            all_listings = []
            for platform, listings in results.items():
                for listing in listings:
                    listing['source_platform'] = platform
                    all_listings.append(listing)
            
            if all_listings:
                # Enrich listings with detailed information
                print(f"\n🔍 Enriching {len(all_listings)} listings with detailed information...")
                scraper = ListingDetailsScraper(debug=False)
                enriched_listings = scraper.enrich_listings(all_listings)
                
                # Generate analysis for listings
                if enriched_listings:
                    print(f"\n📈 Generating analysis for {len(enriched_listings)} enriched listings...")
                    analysis = analyze_listings(enriched_listings, debug=False)
                    
                    if analysis:
                        print("\n📋 Acquisition Analysis:")
                        print(analysis['acquisition_analysis'])
                    else:
                        print("❌ No analysis was generated.")
            else:
                print("❌ No listings found to analyze.")
                
    except Exception as e:
        print(f"❌ An error occurred: {str(e)}")
        import traceback
        print(f"📜 Traceback:\n{traceback.format_exc()}")
        return None

def run_scrapers():
    """
    Run all scrapers and store results in the database
    """
    print("\n🤖 Starting scraper execution...")
    print(f"⏰ Current time: {datetime.now().isoformat()}")
    
    # Check if scraper is already running
    if is_scraper_running():
        print("⚠️ Scraper is already running, skipping this run")
        return
    
    try:
        # Set scraper as running
        print("🔒 Setting scraper status to running")
        set_scraper_running(True)
        
        # Initialize database client
        print("🔌 Initializing database connection...")
        db = SupabaseClient()
        
        def scraper_task():
            # Get listings from all sources
            print("\n🔄 Starting scraper run...")
            print("📊 Fetching listings from all platforms")
            try:
                all_listings = get_all_listings()
            except Exception as e:
                print(f"❌ Error getting listings: {e}")
                print(f"📜 Traceback:\n{traceback.format_exc()}")
                all_listings = {}  # Continue with empty listings rather than failing
            
            total_processed = 0
            total_errors = 0
            
            # Store listings in database
            for platform, listings in all_listings.items():
                try:
                    print(f"\n📦 Processing {len(listings)} listings from {platform}")
                    platform_processed = 0
                    platform_errors = 0
                    
                    for listing in listings:
                        try:
                            print(f"💾 Storing listing: {listing.get('title', 'Unknown Title')[:100]}...")  # Truncate long titles
                            db.store_listing(listing)
                            platform_processed += 1
                            total_processed += 1
                        except Exception as e:
                            print(f"❌ Error storing listing: {str(e)[:500]}")  # Truncate long error messages
                            platform_errors += 1
                            total_errors += 1
                            continue
                    
                    print(f"\n📊 Platform Summary - {platform}:")
                    print(f"✅ Successfully stored: {platform_processed}")
                    print(f"❌ Errors: {platform_errors}")
                except Exception as e:
                    print(f"❌ Error processing platform {platform}: {e}")
                    print(f"📜 Traceback:\n{traceback.format_exc()}")
                    continue
            
            print("\n📈 Overall Scraper Summary:")
            print(f"✅ Total listings processed: {total_processed}")
            print(f"❌ Total errors: {total_errors}")
            if total_processed > 0:
                print("✨ Scraper run completed with some successes")
            else:
                print("⚠️ Scraper run completed but no listings were processed")
        
        # Run the scraper with a 45-minute timeout
        print("\n⏱️ Starting scraper task with 45-minute timeout...")
        run_with_timeout(scraper_task, 45 * 60)  # 45 minutes in seconds
        
    except TimeoutError:
        print("⚠️ Scraper run timed out after 45 minutes")
    except Exception as e:
        print(f"❌ Error in scraper run: {e}")
        import traceback
        print(f"📜 Traceback:\n{traceback.format_exc()}")
        raise
    finally:
        # Always mark scraper as not running when done
        print("\n🔓 Cleaning up: Setting scraper status to not running")
        set_scraper_running(False)
        print(f"🏁 Scraper execution finished at: {datetime.now().isoformat()}")

if __name__ == "__main__":
    main()