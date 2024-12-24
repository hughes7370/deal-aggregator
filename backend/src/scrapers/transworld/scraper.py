from typing import Dict, List, Optional
from datetime import datetime
import os
import json
import requests
from ..base_scraper import BaseScraper
from backend.src.database.supabase_db import SupabaseClient
from config.search_queries import BASE_URLS

class TransWorldScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.base_url = BASE_URLS.get("transworld")
        self.supabase = SupabaseClient()
        self.agentql_api_url = "https://api.agentql.com/v1/query-data"
        self.headers = {
            "X-API-Key": os.getenv('AGENTQL_API_KEY'),
            "Content-Type": "application/json"
        }

    def get_listing_details(self, listing_url: str) -> Optional[Dict]:
        return self._get_listing_details(listing_url)

    def get_listings(self, max_pages: int = 1) -> List[Dict]:
        listings = []
        
        try:
            payload = {
                "query": """
                {
                    listings[] {
                        title
                        price
                        revenue
                        cash_flow
                        description
                        listing_url
                        location
                        established_year
                        business_type
                    }
                }
                """,
                "url": self.base_url,
                "params": {
                    "wait_for": 5,
                    "is_scroll_to_bottom_enabled": True,
                    "mode": "standard"
                }
            }
            
            print(f"\nQuerying TransWorld listings via AgentQL API...")
            response = requests.post(self.agentql_api_url, headers=self.headers, json=payload)
            
            if response.status_code != 200:
                print(f"Error response: {response.text}")
                response.raise_for_status()
            
            data = response.json()
            page_listings = data.get('data', {}).get('listings', [])
            
            listing_urls = [listing.get('listing_url') for listing in page_listings if listing.get('listing_url')]
            existing_urls = self.supabase.get_existing_listing_urls(listing_urls)
            
            for listing_data in page_listings:
                try:
                    listing_url = listing_data.get('listing_url')
                    
                    if not listing_url:
                        print("Skipping listing with no URL")
                        continue
                    
                    if listing_url in existing_urls:
                        print(f"Skipping existing listing: {listing_url}")
                        continue
                    
                    listing_details = self._get_listing_details(listing_url)
                    
                    if listing_details:
                        full_listing = self._format_listing_for_storage(listing_data, listing_details)
                        
                        if full_listing:
                            if not any(full_listing.get(field, 0) for field in ['revenue', 'ebitda', 'asking_price']):
                                print(f"Skipping listing with zero financial values: {listing_url}")
                                continue
                            
                            listing_id = self.supabase.store_listing(full_listing)
                            print(f"Stored listing {listing_id}: {full_listing.get('title')}")
                            listings.append(full_listing)
                
                except Exception as e:
                    print(f"Error processing listing: {e}")
                    continue
            
        except Exception as e:
            print(f"Error in TransWorld scraper: {e}")
            
        return listings

    def _get_listing_details(self, listing_url: str) -> Optional[Dict]:
        try:
            payload = {
                "query": """
                {
                    business_details {
                        asking_price
                        revenue
                        cash_flow
                        business_type
                        employees
                        established_year
                        location
                    }
                    description_text
                    highlights[] {
                        text
                    }
                    financial_info {
                        revenue
                        cash_flow
                        business_model
                    }
                }
                """,
                "url": listing_url,
                "params": {
                    "wait_for": 3,
                    "mode": "standard"
                }
            }
            
            response = requests.post(self.agentql_api_url, headers=self.headers, json=payload)
            
            if response.status_code != 200:
                response.raise_for_status()
            
            return response.json().get('data', {})
            
        except Exception as e:
            print(f"Error getting listing details: {e}")
            return None

    def _format_listing_for_storage(self, listing_data: Dict, listing_details: Dict) -> Dict:
        try:
            financial_info = listing_details.get('financial_info', {})
            business_details = listing_details.get('business_details', {})
            
            formatted_listing = {
                'title': listing_data.get('title', ''),
                'listing_url': listing_data.get('listing_url', ''),
                'source_platform': 'TransWorld',
                'asking_price': self._parse_price(business_details.get('asking_price', listing_data.get('price', '0'))),
                'revenue': self._parse_price(business_details.get('revenue', listing_data.get('revenue', '0'))),
                'ebitda': self._parse_price(business_details.get('cash_flow', listing_data.get('cash_flow', '0'))),
                'industry': self._extract_industry(listing_data.get('business_type', '')),
                'location': business_details.get('location', 'United States'),
                'description': listing_data.get('description', ''),
                'full_description': listing_details.get('description_text', ''),
                'business_highlights': json.dumps(listing_details.get('highlights', [])),
                'financial_details': json.dumps({
                    'revenue': self._parse_price(business_details.get('revenue', '0')),
                    'cash_flow': self._parse_price(business_details.get('cash_flow', '0')),
                    'business_model': financial_info.get('business_model', '')
                }),
                'business_details': json.dumps({
                    'location': business_details.get('location', 'United States'),
                    'employees': business_details.get('employees', ''),
                    'established_year': business_details.get('established_year', ''),
                    'business_type': business_details.get('business_type', '')
                }),
                'raw_data': json.dumps({
                    'listing_data': listing_data,
                    'listing_details': listing_details
                }),
                'status': 'active'
            }
            
            return formatted_listing
            
        except Exception as e:
            print(f"Error formatting listing: {e}")
            return None

    def _parse_price(self, price_str: str) -> int:
        try:
            price_str = str(price_str).replace('$', '').replace(',', '').strip().lower()
            
            if 'm' in price_str:
                return int(float(price_str.replace('m', '')) * 1000000)
            elif 'k' in price_str:
                return int(float(price_str.replace('k', '')) * 1000)
            else:
                return int(float(price_str))
        except:
            return 0

    def _extract_industry(self, business_type: str) -> str:
        business_type = business_type.lower()
        if any(term in business_type for term in ['saas', 'software', 'tech', 'app', 'internet']):
            return 'Software/SaaS'
        elif any(term in business_type for term in ['ecommerce', 'e-commerce', 'retail']):
            return 'Ecommerce'
        elif any(term in business_type for term in ['content', 'blog', 'media', 'digital']):
            return 'Content/Media'
        elif any(term in business_type for term in ['service', 'consulting', 'agency']):
            return 'Service'
        else:
            return 'Other' 