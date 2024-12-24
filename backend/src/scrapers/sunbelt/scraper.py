from typing import Dict, List, Optional
import os
import json
import requests
from ..base_scraper import BaseScraper
from backend.src.database.supabase_db import SupabaseClient
from config.search_queries import BASE_URLS

class SunbeltScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.base_url = BASE_URLS.get("sunbelt", "https://www.sunbeltnetwork.com/business-search/business-results/i-online-technology-for-sale-12/")
        self.supabase = SupabaseClient()
        self.agentql_api_url = "https://api.agentql.com/v1/query-data"
        self.headers = {
            "X-API-Key": os.getenv('AGENTQL_API_KEY'),
            "Content-Type": "application/json"
        }

    def get_listing_details(self, listing_url: str) -> Optional[Dict]:
        """Required implementation of abstract method"""
        return self._get_listing_details(listing_url)

    def get_listings(self, max_pages: int = 1) -> List[Dict]:
        """Get listings from Sunbelt using AgentQL REST API"""
        listings = []
        
        try:
            # Query for listings with fast mode
            payload = {
                "query": """
                {
                    listings[] {
                        title
                        price
                        revenue
                        cash_flow
                        description
                        listing_link
                        location
                        established_year
                        employees
                    }
                }
                """,
                "url": self.base_url,
                "params": {
                    "wait_for": 5,
                    "mode": "fast"
                }
            }
            
            print(f"\nQuerying Sunbelt listings via AgentQL API in fast mode...")
            response = requests.post(self.agentql_api_url, headers=self.headers, json=payload)
            
            if response.status_code != 200:
                print(f"Error response: {response.text}")
                response.raise_for_status()
            
            data = response.json()
            page_listings = data.get('data', {}).get('listings', [])
            
            if not page_listings:
                print("No listings found in the response. This might be due to Cloudflare protection.")
                return listings
            
            # Get all existing listing URLs from the database
            listing_urls = [listing.get('listing_link') for listing in page_listings if listing.get('listing_link')]
            existing_urls = self.supabase.get_existing_listing_urls(listing_urls)
            
            for listing_data in page_listings:
                try:
                    # Get listing URL
                    listing_url = listing_data.get('listing_link')
                    
                    # Skip if listing URL is None
                    if not listing_url:
                        continue
                    
                    # Check if listing already exists
                    if listing_url in existing_urls:
                        print(f"Listing already exists: {listing_url}")
                        continue
                    
                    # Get detailed listing data
                    listing_details = self._get_listing_details(listing_url)
                    
                    if listing_details:
                        # Format listing for storage
                        full_listing = self._format_listing_for_storage(listing_data, listing_details)
                        
                        if full_listing:
                            # Skip listings with zero revenue, EBITDA, or asking price
                            if full_listing['revenue'] == 0 or full_listing['ebitda'] == 0 or full_listing['asking_price'] == 0:
                                print(f"Skipping listing with zero financial values: {listing_url}")
                                continue
                            
                            # Store in database
                            listing_id = self.supabase.store_listing(full_listing)
                            print(f"Stored listing {listing_id}: {full_listing.get('title')}")
                            
                            listings.append(full_listing)
                    
                except Exception as e:
                    print(f"Error processing listing: {e}")
                    continue
                
        except Exception as e:
            print(f"Error in Sunbelt scraper: {e}")
            
        return listings

    def _get_listing_details(self, listing_url: str) -> Optional[Dict]:
        """Get detailed information from a listing page"""
        try:
            payload = {
                "query": """
                {
                    business_details {
                        asking_price
                        gross_revenue
                        cash_flow
                        ebitda
                        inventory
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
                        inventory
                        payroll
                    }
                }
                """,
                "url": listing_url,
                "params": {
                    "wait_for": 5,
                    "mode": "fast"
                }
            }
            
            response = requests.post(self.agentql_api_url, headers=self.headers, json=payload)
            
            if response.status_code != 200:
                print(f"Error response: {response.text}")
                response.raise_for_status()
            
            data = response.json()
            return data.get('data', {})
            
        except Exception as e:
            print(f"Error getting listing details: {e}")
            return None

    def _format_listing_for_storage(self, listing_data: Dict, listing_details: Dict) -> Dict:
        """Format listing data to match database schema"""
        try:
            # Extract financial details
            financial_info = listing_details.get('financial_info', {})
            business_details = listing_details.get('business_details', {})
            
            # Format listing for storage
            formatted_listing = {
                'title': listing_data.get('title', ''),
                'listing_url': listing_data.get('listing_link', ''),
                'source_platform': 'Sunbelt',
                'asking_price': self._parse_price(business_details.get('asking_price', listing_data.get('price', '0'))),
                'revenue': self._parse_price(business_details.get('gross_revenue', listing_data.get('revenue', '0'))),
                'ebitda': self._parse_price(listing_data.get('cash_flow', '0')),
                'industry': self._extract_industry(listing_data.get('title', '')),
                'location': business_details.get('location', listing_data.get('location', 'United States')),
                'description': listing_data.get('description', ''),
                'full_description': listing_details.get('description_text', ''),
                'business_highlights': json.dumps(listing_details.get('highlights', [])),
                'financial_details': json.dumps({
                    'revenue': self._parse_price(business_details.get('gross_revenue', '0')),
                    'ebitda': self._parse_price(listing_data.get('cash_flow', '0')),
                    'inventory': self._parse_price(business_details.get('inventory', '0')),
                    'payroll': self._parse_price(financial_info.get('payroll', '0'))
                }),
                'business_details': json.dumps({
                    'location': business_details.get('location', listing_data.get('location', 'United States')),
                    'employees': business_details.get('employees', listing_data.get('employees', '')),
                    'established_year': business_details.get('established_year', listing_data.get('established_year', '')),
                    'inventory': business_details.get('inventory', '')
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
        """Convert price string to integer"""
        try:
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