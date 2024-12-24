from typing import Dict, List, Optional
from datetime import datetime
import os
import json
import requests
from ..base_scraper import BaseScraper
from backend.src.database.supabase_db import SupabaseClient
from config.search_queries import BASE_URLS

class EmpireFlippersScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.base_url = BASE_URLS.get("empireflippers", "https://empireflippers.com/marketplace/")
        self.supabase = SupabaseClient()
        self.agentql_api_url = "https://api.agentql.com/v1/query-data"
        self.headers = {
            "X-API-Key": os.getenv('AGENTQL_API_KEY'),
            "Content-Type": "application/json"
        }

    def get_listing_details(self, listing_url: str) -> Optional[Dict]:
        """Required implementation of abstract method from BaseScraper"""
        return self._get_listing_details(listing_url)

    def get_listings(self, max_pages: int = 1) -> List[Dict]:
        """Get listings from Empire Flippers using AgentQL REST API"""
        listings = []
        
        try:
            payload = {
                "query": """
                {
                    listings[] {
                        id
                        title
                        monetization
                        price
                        monthly_net_profit
                        monthly_revenue
                        monthly_multiple
                        business_created
                        description
                        profit_trend
                        revenue_trend
                        traffic_trend
                        listing_url
                        niche
                        status
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
            
            print(f"\nQuerying Empire Flippers listings via AgentQL API...")
            response = requests.post(self.agentql_api_url, headers=self.headers, json=payload)
            
            if response.status_code != 200:
                print(f"Error response: {response.text}")
                response.raise_for_status()
            
            data = response.json()
            page_listings = data.get('data', {}).get('listings', [])
            
            # Get existing listing URLs from database
            listing_urls = [listing.get('listing_url') for listing in page_listings if listing.get('listing_url')]
            existing_urls = self.supabase.get_existing_listing_urls(listing_urls)
            
            for listing_data in page_listings:
                try:
                    listing_url = listing_data.get('listing_url')
                    
                    if not listing_url:
                        continue
                        
                    if listing_url in existing_urls:
                        print(f"Listing already exists: {listing_url}")
                        continue
                    
                    # Get detailed listing data using the abstract method
                    listing_details = self.get_listing_details(listing_url)
                    
                    if listing_details:
                        full_listing = self._format_listing_for_storage(listing_data, listing_details)
                        
                        if full_listing:
                            # Skip listings with zero financial values
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
            print(f"Error in Empire Flippers scraper: {e}")
            
        return listings

    def _get_listing_details(self, listing_url: str) -> Optional[Dict]:
        """Get detailed information from a listing page"""
        try:
            payload = {
                "query": """
                {
                    business_details {
                        monetization_details
                        business_model
                        hours_required
                        training_period
                        inventory_included
                        growth_opportunities
                    }
                    financial_details {
                        yearly_revenue[]
                        yearly_profit[]
                        expenses_breakdown
                    }
                    traffic_stats {
                        monthly_visitors
                        traffic_sources
                        top_countries
                    }
                    full_description
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
        """Format listing data to match database schema"""
        try:
            print("\nFormatting listing for storage...")
            print(f"Initial listing data: {json.dumps(listing_data, indent=2)}")
            
            # Calculate annual values from monthly
            monthly_revenue = self._parse_price(listing_data.get('monthly_revenue', '0'))
            monthly_profit = self._parse_price(listing_data.get('monthly_net_profit', '0'))
            
            # Generate a title if none exists
            title = listing_data.get('title')
            print(f"Initial title value: {title}")
            
            if not title or title == "null" or title is None:
                niche = listing_data.get('niche', 'Business')
                monetization = listing_data.get('monetization', '')
                price = self._parse_price(listing_data.get('price', '0'))
                listing_id = listing_data.get('id', '')
                title = f"{monetization} {niche} Business #{listing_id} - ${price:,}"
                print(f"Generated title: {title}")
            
            # Ensure title is not None or empty
            if not title or title == "null" or title is None:
                print("Title validation failed after generation")
                raise ValueError("Unable to generate valid title for listing")
            
            print(f"Final title value: {title}")
            
            formatted_listing = {
                'title': str(title).strip(),  # Ensure title is a string and stripped
                'listing_url': listing_data.get('listing_url', ''),
                'source_platform': 'Empire Flippers',
                'asking_price': self._parse_price(listing_data.get('price', '0')),
                'revenue': monthly_revenue * 12,  # Annualized
                'ebitda': monthly_profit * 12,    # Annualized
                'industry': self._extract_industry(listing_data.get('niche', '')),
                'location': 'Online',  # Empire Flippers typically deals with online businesses
                'description': listing_data.get('description', ''),
                'full_description': listing_details.get('full_description', ''),
                'business_highlights': json.dumps({
                    'monetization': listing_data.get('monetization', ''),
                    'monthly_multiple': listing_data.get('monthly_multiple', ''),
                    'business_age': listing_data.get('business_created', ''),
                    'profit_trend': listing_data.get('profit_trend', ''),
                    'revenue_trend': listing_data.get('revenue_trend', ''),
                    'traffic_trend': listing_data.get('traffic_trend', '')
                }),
                'financial_details': json.dumps({
                    'monthly_revenue': monthly_revenue,
                    'monthly_profit': monthly_profit,
                    'yearly_revenue': listing_details.get('financial_details', {}).get('yearly_revenue', []),
                    'yearly_profit': listing_details.get('financial_details', {}).get('yearly_profit', []),
                    'expenses_breakdown': listing_details.get('financial_details', {}).get('expenses_breakdown', {})
                }),
                'business_details': json.dumps({
                    'monetization_details': listing_details.get('business_details', {}).get('monetization_details', ''),
                    'business_model': listing_details.get('business_details', {}).get('business_model', ''),
                    'hours_required': listing_details.get('business_details', {}).get('hours_required', ''),
                    'training_period': listing_details.get('business_details', {}).get('training_period', ''),
                    'inventory_included': listing_details.get('business_details', {}).get('inventory_included', ''),
                    'growth_opportunities': listing_details.get('business_details', {}).get('growth_opportunities', [])
                }),
                'raw_data': json.dumps({
                    'listing_data': listing_data,
                    'listing_details': listing_details
                }),
                'status': listing_data.get('status', 'active')
            }
            
            # Final validation
            print(f"Formatted listing title: {formatted_listing['title']}")
            if not formatted_listing['title'] or formatted_listing['title'] == "null":
                print("Final title validation failed")
                raise ValueError("Listing title cannot be empty")
            
            return formatted_listing
            
        except Exception as e:
            print(f"\nError formatting listing: {e}")
            print(f"Listing data: {json.dumps(listing_data, indent=2)}")
            print(f"Listing details: {json.dumps(listing_details, indent=2)}")
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

    def _extract_industry(self, niche: str) -> str:
        """Extract industry from niche category"""
        niche = niche.lower()
        
        if any(term in niche for term in ['saas', 'software', 'tech', 'application']):
            return 'Software/SaaS'
        elif any(term in niche for term in ['ecommerce', 'e-commerce', 'amazon', 'shopify', 'fba', 'fbm']):
            return 'Ecommerce'
        elif any(term in niche for term in ['content', 'blog', 'affiliate', 'display advertising']):
            return 'Content/Affiliate'
        elif any(term in niche for term in ['service', 'consulting', 'agency']):
            return 'Service'
        else:
            return 'Other' 