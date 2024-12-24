from bs4 import BeautifulSoup
import requests
from typing import Dict, Optional
import time
from config.config import SCRAPER_API_KEY
import re

class ListingPageScraper:
    def __init__(self):
        self.scraper_api_url = "http://api.scraperapi.com"
        self.params = {
            'api_key': SCRAPER_API_KEY,
            'render': 'true',
            'premium': 'true',
            'country_code': 'us'
        }

    def scrape_listing_page(self, url: str) -> Optional[Dict]:
        """
        Scrape a single listing page from Website Closers
        """
        try:
            print(f"\nScraping detailed listing page: {url}")
            
            # Make request through ScraperAPI
            self.params['url'] = url
            response = requests.get(self.scraper_api_url, params=self.params)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract all the details
            details = {
                'financial_info': self._extract_financial_info(soup),
                'business_info': self._extract_business_info(soup),
                'full_description': self._extract_full_description(soup),
                'key_highlights': self._extract_key_highlights(soup),
                'additional_details': self._extract_additional_details(soup)
            }
            
            print(f"Successfully scraped listing page: {url}")
            return details
            
        except Exception as e:
            print(f"Error scraping listing page {url}: {e}")
            return None

    def _extract_financial_info(self, soup) -> Dict:
        """Extract financial information"""
        financials = {}
        
        # Look for financial metrics in the listing
        try:
            # Find the financial metrics section
            metrics_section = soup.find('div', class_='botoom')
            if metrics_section:
                # Extract asking price
                asking_price = metrics_section.find('div', class_='asking_price')
                if asking_price:
                    strong = asking_price.find('strong')
                    if strong:
                        financials['asking_price'] = self._clean_price(strong.text)

                # Extract cash flow
                cash_flow = metrics_section.find('div', class_='cash_flow')
                if cash_flow:
                    strong = cash_flow.find('strong')
                    if strong:
                        financials['cash_flow'] = self._clean_price(strong.text)

            # Look for additional financial information in the content
            content = soup.find('div', class_='the_content')
            if content:
                text = content.get_text()
                
                # Extract revenue
                revenue_match = re.search(r'revenue.*?\$\s*(\d[\d,.]*\s*[kmb]?)', text.lower())
                if revenue_match:
                    financials['revenue'] = self._clean_price(revenue_match.group(1))
                
                # Extract EBITDA if mentioned
                ebitda_match = re.search(r'ebitda.*?\$\s*(\d[\d,.]*\s*[kmb]?)', text.lower())
                if ebitda_match:
                    financials['ebitda'] = self._clean_price(ebitda_match.group(1))

        except Exception as e:
            print(f"Error extracting financial info: {e}")
        
        return financials

    def _extract_business_info(self, soup) -> Dict:
        """Extract business information"""
        info = {}
        
        try:
            content = soup.find('div', class_='the_content')
            if content:
                text = content.get_text().lower()
                
                # Extract years in business
                years_match = re.search(r'(\d+)\s*(?:year|yr)s?(?:\s+in\s+business)?', text)
                if years_match:
                    info['years_in_business'] = int(years_match.group(1))
                
                # Extract number of employees
                employees_match = re.search(r'(\d+)\s*(?:employee|staff|team\s*member)s?', text)
                if employees_match:
                    info['employees'] = int(employees_match.group(1))
                
                # Extract location information
                location_match = re.search(r'located\s+in\s+([^\.]+)', text)
                if location_match:
                    info['location'] = location_match.group(1).strip()

        except Exception as e:
            print(f"Error extracting business info: {e}")
        
        return info

    def _extract_full_description(self, soup) -> str:
        """Extract the full listing description"""
        try:
            content = soup.find('div', class_='the_content')
            if content:
                # Remove any script or style tags
                for element in content.find_all(['script', 'style']):
                    element.decompose()
                return content.get_text(separator='\n', strip=True)
            return ""
        except Exception as e:
            print(f"Error extracting description: {e}")
            return ""

    def _extract_key_highlights(self, soup) -> Dict:
        """Extract key highlights or bullet points"""
        highlights = {}
        
        try:
            content = soup.find('div', class_='the_content')
            if content:
                # Look for bullet points
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

    def _extract_additional_details(self, soup) -> Dict:
        """Extract any additional important details"""
        details = {}
        
        try:
            content = soup.find('div', class_='the_content')
            if content:
                text = content.get_text().lower()
                
                # Look for reason for sale
                reason_match = re.search(r'reason\s+for\s+sale[:\s]+([^\.]+)', text)
                if reason_match:
                    details['reason_for_sale'] = reason_match.group(1).strip()
                
                # Look for growth opportunities
                growth_match = re.search(r'growth\s+opportunities?[:\s]+([^\.]+)', text)
                if growth_match:
                    details['growth_opportunities'] = growth_match.group(1).strip()
                
                # Look for competitive advantages
                advantage_match = re.search(r'competitive\s+advantages?[:\s]+([^\.]+)', text)
                if advantage_match:
                    details['competitive_advantages'] = advantage_match.group(1).strip()
        
        except Exception as e:
            print(f"Error extracting additional details: {e}")
        
        return details

    def _clean_price(self, price_str: str) -> int:
        """Convert price string to integer"""
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