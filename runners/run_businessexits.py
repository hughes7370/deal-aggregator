import os
import sys

# Add the project root directory to Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

from src.api.listings_api import fetch_businessexits_listings
from src.services.deal_analyzer import analyze_listings

def main():
    print("\nRunning Business Exits scraper individually...")
    
    # Fetch listings
    results = fetch_businessexits_listings(max_pages=1)
    
    if results:
        print(f"Found {len(results)} listings from Business Exits")
        
        # Analyze listings in same format as main.py
        listings_dict = {'BusinessExits': results}
        analyze_listings(listings_dict)
    else:
        print("No listings found")

if __name__ == "__main__":
    main() 