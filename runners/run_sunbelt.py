import os
import sys

# Add the project root directory to Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

from src.scrapers.sunbelt.scraper import SunbeltScraper
from src.services.deal_analyzer import analyze_listings

def main():
    print("\nRunning Sunbelt scraper individually...")
    
    # Initialize and run scraper
    scraper = SunbeltScraper()
    results = scraper.get_listings(max_pages=1)
    
    if results:
        print(f"Found {len(results)} listings from Sunbelt")
        
        # Analyze listings in same format as main.py
        listings_dict = {'Sunbelt': results}
        analyze_listings(listings_dict)
    else:
        print("No listings found")

if __name__ == "__main__":
    main() 