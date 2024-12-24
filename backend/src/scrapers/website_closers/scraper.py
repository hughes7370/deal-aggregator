from ..base_scraper import BaseScraper
from typing import Dict, List, Optional
from datetime import datetime
from bs4 import BeautifulSoup
from backend.src.services.listing_parser import ListingParser
from config.search_queries import BASE_URLS
import requests

class WebsiteClosersScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.base_url = BASE_URLS.get("websiteclosers", "https://www.websiteclosers.com/businesses-for-sale/")
        self.parser = ListingParser()

    def get_listings(self, max_pages: int = 1) -> List[Dict]:
        """Get all listings from Website Closers"""
        listings = []
        
        try:
            response = requests.get(self.base_url)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                content_divs = soup.find_all('div', class_='post_content')
                
                if content_divs:
                    print(f"\nFound {len(content_divs)} potential listings")
                    
                    # First, collect all URLs
                    listing_urls = []
                    for div in content_divs:
                        title_elem = div.find('a', class_='post_title')
                        if title_elem and title_elem.get('href'):
                            listing_urls.append(title_elem['href'])
                    
                    # Check which URLs don't exist in database
                    from backend.src.database.supabase_db import SupabaseClient
                    db_client = SupabaseClient()
                    existing_urls = db_client.get_existing_listing_urls(listing_urls)
                    new_urls = set(listing_urls) - set(existing_urls)
                    
                    if new_urls:
                        print(f"\nFound {len(new_urls)} new listings to process")
                    else:
                        print("\nNo new listings found")
                        return []
                    
                    # Only process new listings
                    for div in content_divs:
                        try:
                            title_elem = div.find('a', class_='post_title')
                            if not title_elem or not title_elem.get('href'):
                                continue
                                
                            # Skip if URL already exists
                            if title_elem['href'] not in new_urls:
                                continue
                            
                            listing_data = {
                                'raw_html': str(div),
                                'raw_text': div.get_text(separator=' ', strip=True),
                                'title_elem': title_elem,
                                'price_elem': div.find('div', class_='asking_price'),
                                'cash_flow_elem': div.find('div', class_='cash_flow'),
                                'description_elem': div.find('div', class_='the_content'),
                                'source_platform': 'WebsiteClosers',
                                'listing_url': title_elem['href']
                            }
                            
                            parsed_listing = self.parser.parse_listing(listing_data)
                            if parsed_listing:
                                listings.append(parsed_listing)
                            
                        except Exception as e:
                            print(f"Error extracting listing: {e}")
                            continue
                            
                return listings
                
        except Exception as e:
            print(f"Error fetching listings: {e}")
            return []

    def get_listing_details(self, url: str) -> Optional[Dict]:
        """Get detailed information from a Website Closers listing page"""
        try:
            soup = self._make_request(url)
            
            # Store both raw and extracted data
            details = {
                'url': url,
                'raw_html': str(soup),
                'raw_text': soup.get_text(separator=' ', strip=True),
                'source_platform': 'WebsiteClosers',
                'scraped_at': datetime.now().isoformat(),
                
                # Extract specific data points while we have the page loaded
                'extracted_data': {
                    'financial_info': self._extract_financial_info(soup),
                    'business_info': self._extract_business_info(soup),
                    'key_highlights': self._extract_key_highlights(soup)
                }
            }
            
            return details
            
        except Exception as e:
            print(f"Error fetching listing details: {e}")
            return None

    def _extract_financial_info(self, soup) -> Dict:
        """Extract financial information using platform-specific selectors"""
        financials = {}
        try:
            metrics_section = soup.find('div', class_=PAGE_SELECTORS['metrics_section'])
            if metrics_section:
                for metric_type in ['asking_price', 'cash_flow', 'revenue']:
                    elem = metrics_section.find('div', class_=PAGE_SELECTORS[metric_type])
                    if elem and (strong := elem.find('strong')):
                        financials[metric_type] = strong.text.strip()
        except Exception as e:
            print(f"Error extracting financials: {e}")
        return financials

    def _extract_business_info(self, soup) -> Dict:
        """Extract business information using platform-specific selectors"""
        info = {}
        try:
            content = soup.find('div', class_=PAGE_SELECTORS['content'])
            if content:
                text = content.get_text().lower()
                
                # Extract using platform-specific patterns
                for key, pattern in PAGE_SELECTORS['patterns'].items():
                    match = re.search(pattern, text)
                    if match:
                        info[key] = match.group(1).strip()
        except Exception as e:
            print(f"Error extracting business info: {e}")
        return info

    def _extract_key_highlights(self, soup) -> Dict:
        """Extract key highlights using platform-specific selectors"""
        highlights = {}
        try:
            content = soup.find('div', class_=PAGE_SELECTORS['content'])
            if content:
                bullets = content.find_all('li')
                for i, bullet in enumerate(bullets, 1):
                    text = bullet.get_text(strip=True)
                    if ':' in text:
                        key, value = text.split(':', 1)
                        highlights[key.strip()] = value.strip()
                    else:
                        highlights[f'highlight_{i}'] = text
        except Exception as e:
            print(f"Error extracting highlights: {e}")
        return highlights 