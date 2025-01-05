import os
import sys
import traceback
import json
from dotenv import load_dotenv

# Add the project root directory to Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

# Load environment variables from .env file
load_dotenv(os.path.join(project_root, 'backend', '.env'))

from backend.src.api.listings_api import fetch_flippa_listings
from backend.src.services.deal_analyzer import analyze_listings

def print_listing_summary(listing):
    """Helper function to print key financial metrics for a listing"""
    print(f"\n{'='*80}")
    print(f"Listing: {listing.get('title')}")
    print(f"URL: {listing.get('listing_url')}")
    print(f"\nFinancial Metrics:")
    print(f"Asking Price: ${listing.get('asking_price', 0):,}")
    print(f"Revenue: ${listing.get('revenue', 0):,}")
    print(f"EBITDA: ${listing.get('ebitda', 0):,}")
    
    # Print raw financial details for debugging
    try:
        financial_details = json.loads(listing.get('financial_details', '{}'))
        print(f"\nDetailed Financial Info:")
        print(f"Revenue Multiple: {financial_details.get('revenue_multiple', 0):.2f}x")
        print(f"Monthly Profit: ${financial_details.get('monthly_profit', 0):,}")
        print(f"Annual Profit: ${financial_details.get('annual_profit', 0):,}")
    except json.JSONDecodeError:
        print("Could not parse financial details")
    print(f"{'='*80}\n")

def main():
    print("\nRunning Flippa scraper individually...")
    
    try:
        # Check for required environment variables
        if not os.getenv('AGENTQL_API_KEY'):
            print("Error: AGENTQL_API_KEY environment variable not set")
            return
            
        # Fetch listings (only first page)
        print("Fetching Flippa listings...")
        results = fetch_flippa_listings(max_pages=1)
        
        if results:
            print(f"\nFound {len(results)} listings from Flippa")
            
            # Print detailed summary for each listing
            for listing in results:
                print_listing_summary(listing)
            
            # Analyze listings in same format as main.py
            listings_dict = {'Flippa': results}
            analyze_listings(listings_dict)
        else:
            print("No listings found")
            
    except Exception as e:
        print(f"\nError running Flippa scraper:")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        print("\nFull traceback:")
        traceback.print_exc()

if __name__ == "__main__":
    main() 