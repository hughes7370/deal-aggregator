from typing import Dict, List
import json
from bs4 import BeautifulSoup
import requests
from time import sleep
from config.config import SCRAPER_API_KEY
from src.services.listing_page_scraper import ListingPageScraper
from src.scrapers.website_closers.scraper import WebsiteClosersScraper
from src.scrapers.business_exits.scraper import BusinessExitsScraper
from src.database.supabase_db import SupabaseClient
from src.scrapers.bizbuysell.scraper import BizBuySellScraper
from src.scrapers.quietlight.scraper import QuietLightScraper
from src.scrapers.empire_flippers.scraper import EmpireFlippersScraper
from src.scrapers.latonas.scraper import LatonasScraper
from src.scrapers.flippa.scraper import FlippaScraper
from src.scrapers.transworld.scraper import TransWorldScraper
from src.scrapers.sunbelt.scraper import SunbeltScraper
from src.scrapers.murphy.scraper import MurphyScraper

def get_all_listings(limit: int, queries: Dict[str, Dict[str, str]]) -> Dict[str, List[Dict]]:
    """
    Fetch business listings from multiple platforms
    """
    all_results = {}
    
    try:
        print("\nFetching listings from Website Closers...")
        results = fetch_websiteclosers_listings(max_pages=1)
        if results:
            all_results['WebsiteClosers'] = results
            print(f"Found {len(results)} listings from Website Closers")
            
        print("\nFetching listings from Business Exits...")
        biz_exits_results = fetch_businessexits_listings(max_pages=1)
        if biz_exits_results:
            all_results['BusinessExits'] = biz_exits_results
            print(f"Found {len(biz_exits_results)} listings from Business Exits")
            
        print("\nFetching listings from BizBuySell...")
        bizbuysell_results = fetch_bizbuysell_listings(max_pages=1)
        if bizbuysell_results:
            all_results['BizBuySell'] = bizbuysell_results
            print(f"Found {len(bizbuysell_results)} listings from BizBuySell")
            
        print("\nFetching listings from QuietLight...")
        quietlight_results = fetch_quietlight_listings(max_pages=1)
        if quietlight_results:
            all_results['QuietLight'] = quietlight_results
            print(f"Found {len(quietlight_results)} listings from QuietLight")
        
        print("\nFetching listings from Empire Flippers...")
        empire_flippers_results = fetch_empire_flippers_listings(max_pages=1)
        if empire_flippers_results:
            all_results['EmpireFlippers'] = empire_flippers_results
            print(f"Found {len(empire_flippers_results)} listings from Empire Flippers")
        
        print("\nFetching listings from Latonas...")
        latonas_results = fetch_latonas_listings(max_pages=1)
        if latonas_results:
            all_results['Latonas'] = latonas_results
            print(f"Found {len(latonas_results)} listings from Latonas")
        
        print("\nFetching listings from Flippa...")
        flippa_results = fetch_flippa_listings(max_pages=1)
        if flippa_results:
            all_results['Flippa'] = flippa_results
            print(f"Found {len(flippa_results)} listings from Flippa")
        
        print("\nFetching listings from TransWorld...")
        transworld_results = fetch_transworld_listings(max_pages=1)
        if transworld_results:
            all_results['TransWorld'] = transworld_results
            print(f"Found {len(transworld_results)} listings from TransWorld")
            
        print("\nFetching listings from Sunbelt...")
        sunbelt_results = fetch_sunbelt_listings(max_pages=1)
        if sunbelt_results:
            all_results['Sunbelt'] = sunbelt_results
            print(f"Found {len(sunbelt_results)} listings from Sunbelt")
            
        print("\nFetching listings from Murphy Business...")
        murphy_results = fetch_murphy_listings(max_pages=1)
        if murphy_results:
            all_results['MurphyBusiness'] = murphy_results
            print(f"Found {len(murphy_results)} listings from Murphy Business")
        
    except Exception as e:
        print(f"Error fetching listings: {e}")
    
    return all_results

def fetch_websiteclosers_listings(max_pages: int) -> List[Dict]:
    """
    Fetch listings from websiteclosers.com
    """
    scraper = WebsiteClosersScraper()
    return scraper.get_listings(max_pages=max_pages)

def fetch_businessexits_listings(max_pages: int) -> List[Dict]:
    """
    Fetch listings from businessexits.com
    """
    scraper = BusinessExitsScraper()
    return scraper.get_listings(max_pages=max_pages)

def fetch_bizbuysell_listings(max_pages: int) -> List[Dict]:
    """
    Fetch listings from bizbuysell.com
    """
    scraper = BizBuySellScraper()
    return scraper.get_listings(max_pages=max_pages)

def fetch_quietlight_listings(max_pages: int) -> List[Dict]:
    """
    Fetch listings from quietlight.com
    """
    scraper = QuietLightScraper()
    return scraper.get_listings(max_pages=max_pages)

def fetch_empire_flippers_listings(max_pages: int) -> List[Dict]:
    """
    Fetch listings from empireflippers.com
    """
    scraper = EmpireFlippersScraper()
    return scraper.get_listings(max_pages=max_pages)

def fetch_latonas_listings(max_pages: int) -> List[Dict]:
    """
    Fetch listings from latonas.com
    """
    scraper = LatonasScraper()
    return scraper.get_listings(max_pages=max_pages)

def fetch_flippa_listings(max_pages: int) -> List[Dict]:
    """
    Fetch listings from flippa.com
    """
    scraper = FlippaScraper()
    return scraper.get_listings(max_pages=max_pages)

def fetch_transworld_listings(max_pages: int) -> List[Dict]:
    """
    Fetch listings from tworld.com
    """
    scraper = TransWorldScraper()
    return scraper.get_listings(max_pages=max_pages)

def fetch_sunbelt_listings(max_pages: int) -> List[Dict]:
    """
    Fetch listings from sunbeltnetwork.com
    """
    scraper = SunbeltScraper()
    return scraper.get_listings(max_pages=max_pages)

def fetch_murphy_listings(max_pages: int) -> List[Dict]:
    """
    Fetch listings from murphybusiness.com
    """
    scraper = MurphyScraper()
    return scraper.get_listings(max_pages=max_pages)

def parse_websiteclosers_listing(container) -> Dict:
    """
    Parse listing details from HTML container
    """
    try:
        # Find title from post_title link
        title_elem = container.find('a', class_='post_title')
        if not title_elem:
            raise ValueError("Could not find title element")
        
        title = title_elem.text.strip()
        listing_url = title_elem['href']
        
        # Find asking price
        asking_price_elem = container.find('div', class_='asking_price')
        asking_price = 0
        if asking_price_elem:
            price_strong = asking_price_elem.find('strong')
            if price_strong:
                asking_price = parse_price(price_strong.text.strip())
        
        # Find cash flow (EBITDA)
        cash_flow_elem = container.find('div', class_='cash_flow')
        ebitda = 0
        if cash_flow_elem:
            flow_strong = cash_flow_elem.find('strong')
            if flow_strong:
                ebitda = parse_price(flow_strong.text.strip())
        
        # Find description
        desc_elem = container.find('div', class_='the_content')
        description = desc_elem.text.strip() if desc_elem else ''
        
        # Create listing object
        listing = {
            'title': title,
            'asking_price': asking_price,
            'revenue': 0,  # Revenue not directly shown on listing
            'ebitda': ebitda,
            'industry': extract_industry(title),
            'location': 'United States',
            'description': description,
            'listing_url': listing_url,
            'source_platform': 'WebsiteClosers'
        }
        
        print(f"\nSuccessfully parsed listing:")
        print(f"Title: {title}")
        print(f"Asking Price: ${asking_price:,}")
        print(f"EBITDA: ${ebitda:,}")
        print(f"Industry: {listing['industry']}")
        
        return listing
        
    except Exception as e:
        print(f"Error parsing listing details: {e}")
        raise

def extract_financials_from_description(description: str) -> Dict:
    """
    Extract revenue and EBITDA from description text
    """
    financials = {
        'revenue': 0,
        'ebitda': 0
    }
    
    description = description.lower()
    
    # Look for revenue indicators
    revenue_indicators = ['revenue', 'sales', 'turnover']
    for indicator in revenue_indicators:
        if indicator in description:
            # Find the sentence containing the indicator
            sentences = description.split('.')
            for sentence in sentences:
                if indicator in sentence:
                    # Try to extract the number
                    try:
                        amount = parse_price_from_text(sentence)
                        if amount > 0:
                            financials['revenue'] = amount
                            break
                    except:
                        continue
    
    # Look for EBITDA indicators
    ebitda_indicators = ['ebitda', 'profit', 'earnings', 'cash flow']
    for indicator in ebitda_indicators:
        if indicator in description:
            sentences = description.split('.')
            for sentence in sentences:
                if indicator in sentence:
                    try:
                        amount = parse_price_from_text(sentence)
                        if amount > 0:
                            financials['ebitda'] = amount
                            break
                    except:
                        continue
    
    return financials

def parse_price_from_text(text: str) -> int:
    """
    Extract price from text containing dollar amounts
    """
    text = text.lower()
    try:
        # Find dollar amount patterns
        import re
        patterns = [
            r'\$\s*(\d+\.?\d*)\s*m',  # $1.5m
            r'\$\s*(\d+\.?\d*)\s*k',  # $500k
            r'\$\s*(\d+,\d+)',        # $1,500,000
            r'\$\s*(\d+)'             # $1500000
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                number = match.group(1).replace(',', '')
                if 'm' in text[match.start():match.end()]:
                    return int(float(number) * 1000000)
                elif 'k' in text[match.start():match.end()]:
                    return int(float(number) * 1000)
                else:
                    return int(float(number))
    except:
        pass
    return 0

def parse_price(price_str: str) -> int:
    """
    Convert price string to integer
    Example: "$1.5M" -> 1500000
    """
    try:
        # Remove currency symbols and spaces
        price_str = price_str.replace('$', '').replace(',', '').strip().lower()
        
        # Handle different formats
        if 'm' in price_str:
            return int(float(price_str.replace('m', '')) * 1000000)
        elif 'k' in price_str:
            return int(float(price_str.replace('k', '')) * 1000)
        else:
            return int(float(price_str))
    except:
        return 0

def extract_industry(title: str) -> str:
    """
    Extract industry from listing title
    """
    # Add logic to identify industry from title
    # This is a simple example - you might want to make this more sophisticated
    title = title.lower()
    if 'saas' in title or 'software' in title:
        return 'Software'
    elif 'ecommerce' in title or 'e-commerce' in title:
        return 'E-commerce'
    elif 'tech' in title or 'technology' in title:
        return 'Technology'
    else:
        return 'Other'

def matches_buyer_criteria(listing: Dict, criteria: Dict) -> bool:
    """
    Check if listing matches buyer's criteria, using a more permissive approach
    """
    try:
        # Only filter out if we have both criteria and listing data that explicitly mismatch
        
        # Price range check - only if listing has a price
        if listing.get('asking_price', 0) > 0:
            if criteria.get('size_max', float('inf')) < listing['asking_price']:
                print(f"Rejected: Price {listing['asking_price']} above max {criteria.get('size_max')}")
                return False
        
        # Revenue range check - only if listing has revenue
        if listing.get('revenue', 0) > 0:
            if criteria.get('target_revenue_max', float('inf')) < listing['revenue']:
                print(f"Rejected: Revenue {listing['revenue']} above max {criteria.get('target_revenue_max')}")
                return False
        
        # Industry match - only if we have both industry data and criteria
        if criteria.get('industries') and listing.get('industry'):
            buyer_industries = [ind.strip().lower() for ind in criteria['industries'].split(',')]
            if listing['industry'].lower() not in buyer_industries and 'other' not in buyer_industries:
                print(f"Rejected: Industry {listing['industry']} not in {buyer_industries}")
                return False
        
        return True
        
    except Exception as e:
        print(f"Error matching criteria: {e}")
        return True  # If there's an error in matching, include the listing rather than exclude it

class ListingDetailsScraper:
    def __init__(self):
        self.scraper_api_url = "http://api.scraperapi.com"
        self.params = {
            'api_key': SCRAPER_API_KEY,
            'render': 'true',
            'premium': 'true',
            'country_code': 'us'
        }
        self.supabase = SupabaseClient()
        self.page_scraper = ListingPageScraper()

    def enrich_listings(self, listings: List[Dict]) -> List[Dict]:
        enriched_listings = []
        
        for listing in listings:
            try:
                print(f"\nScraping details for listing: {listing['title']}")
                # Get detailed page information
                page_details = self.page_scraper.scrape_listing_page(listing['listing_url'])
                
                if page_details:
                    listing.update({
                        'financial_info': page_details['financial_info'],
                        'business_info': page_details['business_info'],
                        'full_description': page_details['full_description'],
                        'key_highlights': page_details['key_highlights'],
                        'additional_details': page_details['additional_details']
                    })
                
                # Prepare for storage
                enriched_listing = {
                    'title': listing['title'],
                    'listing_url': listing['listing_url'],
                    'source_platform': listing.get('source_platform', ''),
                    'asking_price': listing.get('financial_info', {}).get('asking_price', 0),
                    'revenue': listing.get('financial_info', {}).get('revenue', 0),
                    'ebitda': listing.get('financial_info', {}).get('ebitda', 0),
                    'industry': listing.get('industry', ''),
                    'location': listing.get('business_info', {}).get('location', 'United States'),
                    'description': listing.get('full_description', ''),
                    'business_highlights': json.dumps(listing.get('key_highlights', {})),
                    'financial_details': json.dumps(listing.get('financial_info', {})),
                    'business_details': json.dumps(listing.get('business_info', {})),
                    'raw_data': json.dumps(listing),
                    'status': 'active'
                }
                
                enriched_listings.append(enriched_listing)
                
            except Exception as e:
                print(f"Error enriching listing: {e}")
                continue
                
        return enriched_listings