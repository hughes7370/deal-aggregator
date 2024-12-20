import os
import sys
import traceback

# Add the project root directory to Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

from src.api.listings_api import fetch_latonas_listings
from src.services.deal_analyzer import analyze_listings

def main():
    print("\nRunning Latonas scraper individually...")
    
    try:
        # Check for required environment variables
        if not os.getenv('AGENTQL_API_KEY'):
            print("Error: AGENTQL_API_KEY environment variable not set")
            return
            
        # Fetch listings
        print("Fetching Latonas listings...")
        results = fetch_latonas_listings(max_pages=1)
        
        if results:
            print(f"Found {len(results)} listings from Latonas")
            
            # Analyze listings in same format as main.py
            listings_dict = {'Latonas': results}
            analyze_listings(listings_dict)
        else:
            print("No listings found")
            
    except Exception as e:
        print(f"\nError running Latonas scraper:")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        print("\nFull traceback:")
        traceback.print_exc()

if __name__ == "__main__":
    main() 