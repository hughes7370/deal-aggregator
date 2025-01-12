from typing import Dict, List, Optional
from datetime import datetime
import os
import json
import requests
from ..base_scraper import BaseScraper
from backend.src.database.supabase_db import SupabaseClient
from config.search_queries import BASE_URLS

class FlippaScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.base_url = BASE_URLS.get("flippa")
        self.supabase = SupabaseClient()
        self.agentql_api_url = "https://api.agentql.com/v1/query-data"
        self.headers = {
            "X-API-Key": os.getenv('AGENTQL_API_KEY'),
            "Content-Type": "application/json"
        }

    def get_listing_details(self, listing_url: str) -> Optional[Dict]:
        return self._get_listing_details(listing_url)

    def get_listings(self, max_pages: int = 1) -> List[Dict]:
        """Only fetch first page for Flippa"""
        listings = []
        
        try:
            payload = {
                "query": """
                {
                    listings[] {
                        title
                        price
                        revenue_multiple
                        multiple
                        valuation_multiple
                        monthly_profit
                        description
                        listing_url
                        location
                        site_age
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
            
            print(f"\nQuerying Flippa listings via AgentQL API...")
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
                    
                    # Temporarily commenting out existing URL check for testing
                    # if listing_url in existing_urls:
                    #     print(f"Skipping existing listing: {listing_url}")
                    #     continue
                    
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
            print(f"Error in Flippa scraper: {e}")
            
        return listings

    def _get_listing_details(self, listing_url: str) -> Optional[Dict]:
        try:
            payload = {
                "query": """
                {
                    business_details {
                        asking_price
                        revenue_multiple
                        multiple
                        valuation_multiple
                        monthly_profit
                        business_type
                        employees
                        site_age
                        location
                    }
                    description_text
                    highlights[] {
                        text
                    }
                    financial_info {
                        monthly_profit
                        business_model
                        revenue_multiple
                        multiple
                        valuation_multiple
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
            
            data = response.json()
            print("\nRaw AgentQL Response Data:")
            print(json.dumps(data.get('data', {}), indent=2))
            
            return data.get('data', {})
            
        except Exception as e:
            print(f"Error getting listing details: {e}")
            return None

    def _parse_site_age(self, age_str: str) -> int:
        """Convert site age string to number of years"""
        try:
            age_str = str(age_str).strip().lower()
            if not age_str:
                return 0
                
            # Extract the number
            number = ''.join(filter(str.isdigit, age_str))
            if not number:
                return 0
                
            years = int(number)
            
            # Convert months to years if specified in months
            if 'month' in age_str:
                years = max(1, round(years / 12))
                
            return years
        except:
            return 0

    def _format_listing_for_storage(self, listing_data: Dict, listing_details: Dict) -> Dict:
        try:
            financial_info = listing_details.get('financial_info', {})
            business_details = listing_details.get('business_details', {})
            
            print("\nRaw Business Details:")
            print(json.dumps(business_details, indent=2))
            print("\nRaw Financial Info:")
            print(json.dumps(financial_info, indent=2))
            
            # Parse site age
            site_age = self._parse_site_age(business_details.get('site_age', listing_data.get('site_age', '')))
            print(f"Parsed Site Age: {site_age} years")
            
            # Calculate revenue using revenue multiple
            asking_price = self._parse_price(business_details.get('asking_price', listing_data.get('price', '0')))
            
            # Try different possible field names for revenue multiple
            revenue_multiple = 0.0
            for field in ['revenue_multiple', 'multiple', 'valuation_multiple']:
                multiple = business_details.get(field, listing_data.get(field, 0))
                if multiple:
                    revenue_multiple = self._parse_revenue_multiple(multiple)
                    if revenue_multiple > 0:
                        break
            
            # Also check financial_info for the multiple
            if revenue_multiple == 0 and financial_info:
                for field in ['revenue_multiple', 'multiple', 'valuation_multiple']:
                    multiple = financial_info.get(field, 0)
                    if multiple:
                        revenue_multiple = self._parse_revenue_multiple(multiple)
                        if revenue_multiple > 0:
                            break
            
            annual_revenue = int(asking_price / revenue_multiple) if revenue_multiple > 0 else 0
            
            print(f"\nRevenue Calculation Debug for {listing_data.get('title', '')}:")
            print(f"Asking Price: ${asking_price:,}")
            print(f"Revenue Multiple: {revenue_multiple:.2f}x")
            print(f"Calculated Annual Revenue: ${annual_revenue:,}")
            
            # Calculate annual profit
            monthly_profit = self._parse_price(business_details.get('monthly_profit', listing_data.get('monthly_profit', '0')))
            print(f"\nEBITDA Calculation Debug:")
            print(f"Raw monthly_profit from business_details: {business_details.get('monthly_profit')}")
            print(f"Raw monthly_profit from listing_data: {listing_data.get('monthly_profit')}")
            print(f"Parsed monthly_profit: ${monthly_profit:,}")
            annual_profit = monthly_profit * 12
            print(f"Calculated annual_profit (EBITDA): ${annual_profit:,}")
            
            formatted_listing = {
                'title': listing_data.get('title', ''),
                'listing_url': listing_data.get('listing_url', ''),
                'source_platform': 'Flippa',
                'asking_price': asking_price,
                'revenue': annual_revenue,
                'ebitda': annual_profit,
                'industry': self._extract_industry(listing_data.get('business_type', '')),
                'location': business_details.get('location', 'United States'),
                'description': listing_data.get('description', ''),
                'full_description': listing_details.get('description_text', ''),
                'business_highlights': json.dumps(listing_details.get('highlights', [])),
                'financial_details': json.dumps({
                    'revenue_multiple': revenue_multiple,
                    'annual_revenue': annual_revenue,
                    'monthly_profit': monthly_profit,
                    'annual_profit': annual_profit,
                    'business_model': financial_info.get('business_model', '')
                }),
                'business_details': json.dumps({
                    'location': business_details.get('location', 'United States'),
                    'employees': business_details.get('employees', ''),
                    'business_age': site_age,
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

    def _parse_price(self, price_input: any) -> int:
        try:
            # If input is already a number, return it as an integer
            if isinstance(price_input, (int, float)):
                return int(price_input)
            
            # Convert to string and clean up basic formatting
            price_str = str(price_input).strip().lower()
            
            # If empty or none, return 0
            if not price_str or price_str == 'none':
                return 0
            
            # Remove currency indicators and other text
            price_str = price_str.replace('usd', '').replace('$', '').replace('/mo', '')
            price_str = price_str.replace('p/mo', '').replace(',', '').strip()
            price_str = price_str.replace('eur', '').replace('€', '')
            price_str = price_str.replace('aud', '')
            
            if 'm' in price_str:
                return int(float(price_str.replace('m', '')) * 1000000)
            elif 'k' in price_str:
                return int(float(price_str.replace('k', '')) * 1000)
            else:
                return int(float(price_str))
        except Exception as e:
            print(f"Error parsing price '{price_input}' (type: {type(price_input)}): {str(e)}")
            return 0

    def _extract_industry(self, business_type: str) -> str:
        business_type = business_type.lower()
        if any(term in business_type for term in ['saas', 'software', 'app', 'plugin', 'extension']):
            return 'Software/SaaS'
        elif any(term in business_type for term in ['ecommerce', 'e-commerce', 'shopify', 'fba', 'amazon']):
            return 'Ecommerce'
        elif any(term in business_type for term in ['content', 'blog', 'youtube', 'social media', 'newsletter']):
            return 'Content/Media'
        elif any(term in business_type for term in ['service', 'agency']):
            return 'Service'
        else:
            return 'Other' 

    def _parse_revenue_multiple(self, multiple_str: str) -> float:
        try:
            multiple_str = str(multiple_str).strip().lower()
            if 'x' in multiple_str:
                multiple_str = multiple_str.replace('x', '')
            return float(multiple_str) if multiple_str else 0.0
        except:
            return 0.0 