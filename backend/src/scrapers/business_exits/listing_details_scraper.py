from typing import Dict, Optional
import requests
from bs4 import BeautifulSoup
from config.config import SCRAPER_API_KEY
from datetime import datetime
import json

class BusinessExitsDetailsScaper:
    def __init__(self):
        self.scraper_api_url = "http://api.scraperapi.com"
        self.params = {
            'api_key': SCRAPER_API_KEY,
            'render': 'true',
            'ultra_premium': 'true',
            'country_code': 'us'
        }

    def scrape_listing_details(self, url: str) -> Optional[Dict]:
        """Scrape detailed information from a Business Exits listing page"""
        try:
            self.params['url'] = url
            response = requests.get(self.scraper_api_url, params=self.params)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Save raw HTML for debugging
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            with open(f"business_exits_raw_{timestamp}.html", 'w', encoding='utf-8') as f:
                f.write(soup.prettify())
            
            details = {
                'full_description': self._extract_full_description(soup),
                'financial_info': self._extract_financial_info(soup),
                'business_info': self._extract_business_info(soup),
                'key_highlights': self._extract_key_highlights(soup)
            }
            
            return details
            
        except Exception as e:
            print(f"Error scraping Business Exits listing details: {e}")
            return None

    def _extract_full_description(self, soup) -> str:
        """Extract full description specific to Business Exits format"""
        try:
            # Try multiple possible description containers
            desc_elem = (
                soup.select_one('.listing-description') or
                soup.select_one('.business-description') or
                soup.select_one('[class*="description"]')
            )
            
            if desc_elem:
                # Remove any script or style tags
                for element in desc_elem.find_all(['script', 'style']):
                    element.decompose()
                return desc_elem.get_text(separator='\n', strip=True)
            
            return "Description not found"
            
        except Exception as e:
            print(f"Error extracting Business Exits description: {e}")
            return "Error extracting description"

    def _extract_financial_info(self, soup) -> Dict:
        """Extract financial information specific to Business Exits format"""
        financials = {}
        try:
            # Look for financial metrics with Business Exits specific labels
            metrics = {
                'asking_price': ['Price:', 'Asking Price:', 'List Price:'],
                'revenue': ['Revenue:', 'Annual Revenue:', 'Yearly Revenue:'],
                'ebitda': ['Cash Flow:', 'EBITDA:', 'Annual Profit:']
            }
            
            for key, labels in metrics.items():
                for label in labels:
                    elem = soup.find(string=lambda x: label in str(x) if x else False)
                    if elem:
                        value = elem.parent.get_text(strip=True)
                        financials[key] = value.replace(label, '').strip()
                        break
            
            return financials
            
        except Exception as e:
            print(f"Error extracting Business Exits financials: {e}")
            return {}

    def _extract_business_info(self, soup) -> Dict:
        """Extract business information specific to Business Exits format"""
        info = {}
        try:
            # Extract business details with Business Exits specific structure
            info_mapping = {
                'industry': ['.business-category', '.industry'],
                'location': ['.business-location', '.location'],
                'years_established': ['.years-established', '.age'],
                'employees': ['.employee-count', '.staff-size']
            }
            
            for key, selectors in info_mapping.items():
                for selector in selectors:
                    elem = soup.select_one(selector)
                    if elem:
                        info[key] = elem.get_text(strip=True)
                        break
            
            return info
            
        except Exception as e:
            print(f"Error extracting Business Exits business info: {e}")
            return {}

    def _extract_key_highlights(self, soup) -> Dict:
        """Extract key highlights specific to Business Exits format"""
        highlights = {}
        try:
            # Look for Business Exits specific highlight sections
            highlight_section = (
                soup.select_one('.business-highlights') or
                soup.select_one('.key-features') or
                soup.select_one('[class*="highlight"]')
            )
            
            if highlight_section:
                items = highlight_section.find_all(['li', 'div', 'p'])
                for i, item in enumerate(items, 1):
                    text = item.get_text(strip=True)
                    if ':' in text:
                        key, value = text.split(':', 1)
                        highlights[key.strip()] = value.strip()
                    else:
                        highlights[f'highlight_{i}'] = text
            
            return highlights
            
        except Exception as e:
            print(f"Error extracting Business Exits highlights: {e}")
            return {} 