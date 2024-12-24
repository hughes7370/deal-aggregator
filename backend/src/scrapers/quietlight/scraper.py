from typing import Dict, List, Optional
import json
import requests
import os
from ..base_scraper import BaseScraper
from backend.src.database.supabase_db import SupabaseClient
from .selectors import LISTING_QUERY, LISTING_DETAILS_QUERY
from datetime import datetime
from config.search_queries import BASE_URLS

class QuietLightScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.base_url = BASE_URLS.get("quietlight", "https://quietlight.com/listings/")
        self.supabase = SupabaseClient()
        self.agentql_api_url = "https://api.agentql.com/v1/query-data"
        
        self.api_key = os.getenv('AGENTQL_API_KEY')
        if not self.api_key:
            raise ValueError("AGENTQL_API_KEY environment variable not set")
            
        self.headers = {
            "X-API-Key": self.api_key,
            "Content-Type": "application/json"
        }

    def get_listing_details(self, listing_url: str) -> Optional[Dict]:
        """Required implementation of abstract method"""
        return self._get_listing_details(listing_url)

    def get_listings(self, max_pages: int = 1) -> List[Dict]:
        """Get listings from QuietLight using AgentQL REST API"""
        listings = []
        
        try:
            print(f"\nQuerying QuietLight listings via AgentQL API...")
            
            # Query for listings - keeping it simple like BizBuySell
            payload = {
                "query": LISTING_QUERY,
                "url": self.base_url,
                "params": {
                    "wait_for": 5,
                    "is_scroll_to_bottom_enabled": True,
                    "mode": "standard"
                }
            }
            
            response = requests.post(self.agentql_api_url, headers=self.headers, json=payload)
            
            if response.status_code != 200:
                print(f"Error response: {response.text}")
                return []
            
            data = response.json()
            print(f"Raw response data: {json.dumps(data, indent=2)}")  # Debug response
            
            page_listings = data.get('data', {}).get('listings', [])
            print(f"Found {len(page_listings)} listings to process")
            
            # Get existing listing URLs
            listing_urls = [listing.get('listing_link') for listing in page_listings if listing.get('listing_link')]
            existing_urls = self.supabase.get_existing_listing_urls(listing_urls)
            
            for listing_data in page_listings:
                try:
                    # Debug listing data
                    print(f"\nRaw listing data: {json.dumps(listing_data, indent=2)}")
                    
                    # Get listing URL
                    listing_url = listing_data.get('listing_link')
                    if not listing_url:
                        print(f"No listing URL found for: {listing_data.get('title')}")
                        continue
                    
                    if listing_url in existing_urls:
                        print(f"Listing already exists: {listing_url}")
                        continue
                    
                    # Format listing for storage
                    listing = {
                        'title': listing_data.get('title', ''),
                        'listing_url': listing_url,
                        'source_platform': 'QuietLight',
                        'asking_price': self._parse_price(listing_data.get('price', '0')),
                        'revenue': self._parse_price(listing_data.get('revenue', '0')),
                        'ebitda': self._parse_price(listing_data.get('cash_flow', '0')),
                        'industry': self._extract_industry(listing_data.get('title', '')),
                        'location': listing_data.get('location', 'United States'),
                        'description': listing_data.get('description', ''),
                        'business_highlights': json.dumps([]),
                        'financial_details': json.dumps({
                            'revenue': self._parse_price(listing_data.get('revenue', '0')),
                            'ebitda': self._parse_price(listing_data.get('cash_flow', '0'))
                        }),
                        'business_details': json.dumps({
                            'location': listing_data.get('location', 'United States'),
                            'employees': listing_data.get('employees', ''),
                            'established_year': listing_data.get('established_year', '')
                        }),
                        'raw_data': json.dumps(listing_data),
                        'status': 'active',
                        'created_at': datetime.now().isoformat(),
                        'updated_at': datetime.now().isoformat()
                    }
                    
                    print(f"Attempting to store listing in Supabase...")
                    print(f"Storage data: {json.dumps(listing, indent=2)}")
                    
                    # Store in Supabase
                    listing_id = self.supabase.store_listing(listing)
                    if listing_id:
                        print(f"Successfully stored listing {listing_id}: {listing['title']}")
                        listings.append(listing)
                    else:
                        print(f"Error storing listing: {listing['title']}")
                
                except Exception as e:
                    print(f"Error processing listing: {e}")
                    continue
            
        except Exception as e:
            print(f"Error in QuietLight scraper: {e}")
            
        return listings

    def _parse_price(self, price_str: str) -> int:
        """Convert price string to integer"""
        try:
            if not price_str:
                return 0
                
            # Remove currency symbols and spaces
            price_str = str(price_str).replace('$', '').replace(',', '').strip().lower()
            
            # Handle different formats
            if 'm' in price_str:
                return int(float(price_str.replace('m', '')) * 1000000)
            elif 'k' in price_str:
                return int(float(price_str.replace('k', '')) * 1000)
            else:
                return int(float(price_str))
        except:
            return 0

    def _extract_industry(self, title: str) -> str:
        """Extract industry from listing title"""
        title = title.lower()
        if any(term in title for term in ['saas', 'software', 'tech', 'app']):
            return 'Software/SaaS'
        elif any(term in title for term in ['ecommerce', 'e-commerce', 'amazon', 'shopify']):
            return 'Ecommerce'
        elif any(term in title for term in ['manufacturing', 'factory', 'production']):
            return 'Manufacturing'
        elif any(term in title for term in ['service', 'consulting', 'agency']):
            return 'Service'
        else:
            return 'Other' 