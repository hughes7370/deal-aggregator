from typing import Dict, List
import requests
from bs4 import BeautifulSoup
from config.config import SCRAPER_API_KEY
import time
import json
from datetime import datetime
import os
from backend.src.database.supabase_db import SupabaseClient
from backend.src.services.listing_page_scraper import ListingPageScraper

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
        """
        Enrich listings with detailed information and store in Supabase
        """
        enriched_listings = []
        
        for listing in listings:
            try:
                print(f"\nScraping details for listing: {listing['title']}")
                detailed_info = self.scrape_listing_details(listing['listing_url'])
                
                # Merge the detailed info with the original listing
                enriched_listing = {
                    'title': listing['title'],
                    'listing_url': listing['listing_url'],
                    'source_platform': listing.get('source_platform', ''),
                    'asking_price': listing.get('asking_price', 0),
                    'revenue': listing.get('revenue', 0),
                    'ebitda': listing.get('ebitda', 0),
                    'industry': listing.get('industry', ''),
                    'location': listing.get('location', 'United States'),
                    'description': detailed_info.get('full_description', ''),
                    'business_highlights': json.dumps(detailed_info.get('business_highlights', {})),
                    'financial_details': json.dumps(detailed_info.get('financial_details', {})),
                    'business_details': json.dumps(detailed_info.get('business_details', {})),
                    'raw_data': json.dumps(listing),  # Store complete original data
                    'status': 'active'
                }

                # Store in Supabase and get the ID
                try:
                    listing_id = self.supabase.store_listing(enriched_listing)
                    enriched_listing['id'] = listing_id
                    print(f"Stored listing in Supabase with ID: {listing_id}")
                except Exception as e:
                    print(f"Error storing listing in Supabase: {e}")
                    # Continue processing even if storage fails
                
                enriched_listings.append(enriched_listing)
                
                # Save debug file
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                debug_file = f"enriched_listing_{timestamp}.json"
                with open(debug_file, 'w', encoding='utf-8') as f:
                    json.dump(enriched_listing, f, indent=2, ensure_ascii=False)
                print(f"Saved enriched listing details to: {debug_file}")
                
                # Be nice to the server
                time.sleep(2)
                
            except Exception as e:
                print(f"Error enriching listing {listing['title']}: {e}")
                enriched_listings.append(listing)  # Keep original listing if enrichment fails
                
        return enriched_listings

    def save_enriched_listings(self, enriched_listings: List[Dict]):
        """Save all enriched listings to a JSON file and ensure they're in Supabase"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        debug_file = f"all_enriched_listings_{timestamp}.json"
        
        # Ensure all listings are in Supabase
        for listing in enriched_listings:
            if 'id' not in listing:
                try:
                    listing_id = self.supabase.store_listing(listing)
                    listing['id'] = listing_id
                    print(f"Stored missing listing in Supabase with ID: {listing_id}")
                except Exception as e:
                    print(f"Error storing listing in Supabase: {e}")
        
        with open(debug_file, 'w', encoding='utf-8') as f:
            json.dump(enriched_listings, f, indent=2, ensure_ascii=False)
        print(f"\nSaved all enriched listings to: {debug_file}")

    def scrape_listing_details(self, url: str) -> Dict:
        """
        Scrape detailed information from a listing's page
        """
        try:
            # Make request through ScraperAPI
            self.params['url'] = url
            response = requests.get(self.scraper_api_url, params=self.params)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Save raw HTML for debugging
            with open(f"raw_html_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html", 'w', encoding='utf-8') as f:
                f.write(soup.prettify())
            
            # Extract detailed information specific to Website Closers
            details = {
                'full_description': self._extract_full_description(soup),
                'business_highlights': self._extract_business_highlights(soup),
                'financial_details': self._extract_financial_details(soup),
                'business_details': self._extract_business_details(soup)
            }
            
            print("\nExtracted details:")
            print(json.dumps(details, indent=2))
            
            return details
            
        except Exception as e:
            print(f"Error scraping listing details from {url}: {e}")
            return {}

    def _extract_full_description(self, soup) -> str:
        """Extract full business description from Website Closers listing"""
        try:
            # Try multiple possible locations for the description
            desc_elem = None
            
            # Try main content area first
            desc_elem = soup.find('div', class_='the_content')
            if desc_elem:
                # Remove any script or style tags
                for element in desc_elem.find_all(['script', 'style']):
                    element.decompose()
                return desc_elem.get_text(separator='\n', strip=True)
            
            # Try alternative content areas
            desc_elem = (
                soup.find('div', class_='post-content') or
                soup.find('div', class_='listing-description') or
                soup.find('div', class_='business-description')
            )
            
            if desc_elem:
                # Remove any script or style tags
                for element in desc_elem.find_all(['script', 'style']):
                    element.decompose()
                return desc_elem.get_text(separator='\n', strip=True)
            
            # If still not found, try to find any div containing substantial text
            content_divs = soup.find_all('div', class_=True)
            for div in content_divs:
                text = div.get_text(strip=True)
                if len(text) > 200:  # Assume substantial content
                    return text
            
            return "Description not found"
            
        except Exception as e:
            print(f"Error extracting description: {e}")
            return "Error extracting description"

    def _extract_business_highlights(self, soup) -> Dict:
        """Extract key business highlights from Website Closers listing"""
        highlights = {}
        
        try:
            # Look for bullet points or key features
            highlight_containers = soup.find_all(['ul', 'div'], class_=['highlights', 'key-points', 'features'])
            
            for container in highlight_containers:
                items = container.find_all(['li', 'p'])
                for i, item in enumerate(items, 1):
                    text = item.get_text(strip=True)
                    if ':' in text:
                        key, value = text.split(':', 1)
                        highlights[key.strip()] = value.strip()
                    else:
                        highlights[f'highlight_{i}'] = text
            
            # If no structured highlights found, look for key metrics
            if not highlights:
                metrics = soup.find_all(['div', 'p'], class_=['metric', 'stat', 'key-metric'])
                for i, metric in enumerate(metrics, 1):
                    text = metric.get_text(strip=True)
                    highlights[f'metric_{i}'] = text
            
            return highlights
            
        except Exception as e:
            print(f"Error extracting highlights: {e}")
            return {}

    def _extract_financial_details(self, soup) -> Dict:
        """Extract financial information from Website Closers listing"""
        financials = {}
        
        try:
            # Look for financial metrics in specific divs
            financial_divs = soup.find_all('div', class_=['asking_price', 'cash_flow', 'revenue'])
            for div in financial_divs:
                label = div.get_text(strip=True).split(':')[0].strip()
                value = div.find('strong')
                if value:
                    financials[label] = value.get_text(strip=True)
            
            # Look for other financial information in the text
            text = soup.get_text()
            for indicator in ['Revenue', 'EBITDA', 'Cash Flow', 'Inventory Value']:
                if indicator in text:
                    # Find the sentence containing the indicator
                    sentences = text.split('.')
                    for sentence in sentences:
                        if indicator in sentence:
                            financials[indicator] = sentence.strip()
            
            return financials
            
        except Exception as e:
            print(f"Error extracting financials: {e}")
            return {}

    def _extract_business_details(self, soup) -> Dict:
        """Extract general business details"""
        details = {
            'years_established': self._extract_number(soup, ['years established', 'year established', 'years in business']),
            'employees': self._extract_number(soup, ['employees', 'staff', 'team size']),
            'location_details': self._extract_text(soup, ['location', 'area', 'region']),
            'reason_for_sale': self._extract_text(soup, ['reason for sale', 'sale reason']),
            'business_model': self._extract_text(soup, ['business model', 'operation model']),
            'competition': self._extract_text(soup, ['competition', 'market position']),
            'growth_opportunities': self._extract_text(soup, ['growth opportunities', 'expansion potential']),
            'support_and_training': self._extract_text(soup, ['support', 'training', 'transition'])
        }
        return {k: v for k, v in details.items() if v}  # Remove empty values

    def _extract_amount(self, soup, keywords: List[str]) -> int:
        """Extract monetary amount using various keywords"""
        for keyword in keywords:
            elem = soup.find(text=lambda t: keyword.lower() in t.lower() if t else False)
            if elem:
                try:
                    # Use regex to find monetary amounts
                    import re
                    matches = re.findall(r'\$?\s*\d+(?:,\d{3})*(?:\.\d{2})?(?:\s*[kKmMbB])?', elem)
                    if matches:
                        # Convert to integer (handle K, M, B suffixes)
                        amount_str = matches[0].replace('$', '').replace(',', '').strip().lower()
                        if 'k' in amount_str:
                            return int(float(amount_str.replace('k', '')) * 1000)
                        elif 'm' in amount_str:
                            return int(float(amount_str.replace('m', '')) * 1000000)
                        elif 'b' in amount_str:
                            return int(float(amount_str.replace('b', '')) * 1000000000)
                        return int(float(amount_str))
                except:
                    continue
        return 0

    def _extract_percentage(self, soup, keywords: List[str]) -> float:
        """Extract percentage values using various keywords"""
        for keyword in keywords:
            elem = soup.find(text=lambda t: keyword.lower() in t.lower() if t else False)
            if elem:
                try:
                    import re
                    matches = re.findall(r'\d+(?:\.\d+)?%', elem)
                    if matches:
                        return float(matches[0].replace('%', ''))
                except:
                    continue
        return 0.0

    def _extract_number(self, soup, keywords: List[str]) -> int:
        """Extract numeric values using various keywords"""
        for keyword in keywords:
            elem = soup.find(text=lambda t: keyword.lower() in t.lower() if t else False)
            if elem:
                try:
                    import re
                    matches = re.findall(r'\d+', elem)
                    if matches:
                        return int(matches[0])
                except:
                    continue
        return 0

    def _extract_text(self, soup, keywords: List[str]) -> str:
        """Extract text content using various keywords"""
        for keyword in keywords:
            elem = soup.find(text=lambda t: keyword.lower() in t.lower() if t else False)
            if elem:
                # Get parent element to capture full content
                parent = elem.parent
                return parent.text.strip()
        return '' 