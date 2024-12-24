import os
import sys

# Add the project root directory to Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

from backend.src.scrapers.murphy.scraper import MurphyScraper

def main():
    print("\nRunning Murphy Business scraper individually...")
    scraper = MurphyScraper()
    listings = scraper.get_listings(max_pages=1)
    print(f"\nFound {len(listings)} listings from Murphy Business")

if __name__ == "__main__":
    main() 