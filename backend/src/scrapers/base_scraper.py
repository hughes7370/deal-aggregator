from abc import ABC, abstractmethod
from typing import Dict, List, Optional
import requests
from bs4 import BeautifulSoup
from config.config import SCRAPER_API_KEY
import json
from datetime import datetime
import time

class BaseScraper(ABC):
    def __init__(self):
        self.scraper_api_url = "http://api.scraperapi.com"
        self.params = {
            'api_key': SCRAPER_API_KEY,
            'render': 'true',
            'premium': 'true',
            'country_code': 'us'
        }

    @abstractmethod
    def get_listings(self, max_pages: int = 1) -> List[Dict]:
        """Get all listings from the platform"""
        pass

    @abstractmethod
    def get_listing_details(self, url: str) -> Optional[Dict]:
        """Get detailed information for a specific listing"""
        pass

    def _make_request(self, url: str) -> BeautifulSoup:
        """Make a request through ScraperAPI"""
        self.params['url'] = url
        response = requests.get(self.scraper_api_url, params=self.params)
        response.raise_for_status()
        return BeautifulSoup(response.text, 'html.parser')

    def get_enriched_listings(self, max_pages: int = 1) -> List[Dict]:
        """Get listings and enrich them with detailed page data"""
        listings = self.get_listings(max_pages)
        enriched_listings = []
        
        for listing in listings:
            try:
                print(f"\nEnriching listing: {listing['listing_url']}")
                details = self.get_listing_details(listing['listing_url'])
                
                if details:
                    # Merge listing data with detailed page data
                    enriched_listing = {
                        **listing,
                        'detailed_data': details,
                        'enriched_at': datetime.now().isoformat()
                    }
                    enriched_listings.append(enriched_listing)
                
                # Be nice to the servers
                time.sleep(2)
                
            except Exception as e:
                print(f"Error enriching listing: {e}")
                enriched_listings.append(listing)  # Keep original if enrichment fails
        
        return enriched_listings 