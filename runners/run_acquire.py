import os
import sys
from dotenv import load_dotenv
from pathlib import Path

# Add project root to Python path
project_root = str(Path(__file__).parent.parent)
sys.path.append(project_root)

# Load environment variables
load_dotenv()
print("Environment variables loaded successfully")

from backend.src.api.listings_api import fetch_acquire_listings
from backend.src.services.deal_analyzer import analyze_listings

def main():
    # Fetch listings from Acquire
    print("\nFetching listings from Acquire...")
    listings = fetch_acquire_listings()
    
    if not listings:
        print("No listings found")
        return
    
    print(f"\nFound {len(listings)} listings")
    
    # Analyze listings
    print("\nAnalyzing listings...")
    analysis = analyze_listings(listings)
    print(analysis)

if __name__ == "__main__":
    main() 