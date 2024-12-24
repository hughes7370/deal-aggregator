from ..base_scraper import BaseScraper
from typing import Dict, List, Optional
from datetime import datetime
from bs4 import BeautifulSoup
from backend.src.services.listing_parser import ListingParser
from .selectors import SELECTORS, PAGE_SELECTORS
import requests
from config.config import SCRAPER_API_KEY
import json
from .listing_parser import BusinessExitsListingParser
from backend.src.services.listing_details_scraper import ListingDetailsScraper
from backend.src.database.supabase_db import SupabaseClient

class BusinessExitsScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.base_url = "https://businessexits.com/listings/"
        self.parser = BusinessExitsListingParser()
        self.details_scraper = ListingDetailsScraper()
        self.supabase = SupabaseClient()

    def get_listings(self, max_pages: int = 1) -> List[Dict]:
        """Get all listings from Business Exits"""
        listings = []
        
        try:
            print("\nMaking direct request to Business Exits...")
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
                'Accept-Language': 'en-US,en;q=0.9'
            }
            
            response = requests.get(self.base_url, headers=headers)
            
            if response.status_code != 200:
                print(f"Error: Received status code {response.status_code}")
                return []
            
            soup = BeautifulSoup(response.text, 'html.parser')
            listings_row = soup.find('div', id='listings-row')
            
            if not listings_row:
                print("Could not find listings row")
                return []
            
            listing_items = listings_row.find_all('div', class_='tb-fields-and-text')
            
            if listing_items:
                print(f"\nFound {len(listing_items)} potential listings")
                
                # Collect all URLs first
                listing_urls = []
                for item in listing_items:
                    link_elem = item.find('a')
                    if link_elem and link_elem.get('href'):
                        listing_urls.append(link_elem['href'])
                
                # Check which URLs don't exist in database
                existing_urls = self.supabase.get_existing_listing_urls(listing_urls)
                new_urls = set(listing_urls) - set(existing_urls)
                
                if new_urls:
                    print(f"\nFound {len(new_urls)} new listings to process")
                else:
                    print("\nNo new listings found")
                    return []
                
                # Only process new listings
                for item in listing_items:
                    try:
                        link_elem = item.find('a')
                        if not link_elem or not link_elem.get('href'):
                            continue
                        
                        listing_url = link_elem['href']
                        if listing_url not in new_urls:
                            continue
                        
                        # Get basic listing data
                        listing_container = item.find('div', class_='key-listings')
                        if not listing_container:
                            continue
                        
                        # Check if listing is pending - skip if it is
                        if 'Sale Pending' in listing_container.get('class', []) or 'Pending' in listing_container.get('class', []):
                            print(f"Skipping pending listing: {listing_url}")
                            continue
                        
                        details_container = listing_container.find('div', class_='listing_details')
                        if not details_container:
                            continue
                        
                        # Get detailed page content
                        if listing_url:
                            print(f"\nFetching detailed information from: {listing_url}")
                            detailed_response = requests.get(listing_url, headers=headers)
                            if detailed_response.status_code == 200:
                                detailed_soup = BeautifulSoup(detailed_response.text, 'html.parser')
                                
                                # Check if the detailed page indicates pending status
                                if any(text in detailed_soup.get_text().lower() for text in ['sale pending', 'under contract', 'offer pending']):
                                    print(f"Skipping pending listing (found in details): {listing_url}")
                                    continue
                                    
                                full_description = detailed_soup.find('div', class_='business-description')
                                if full_description:
                                    detailed_text = full_description.get_text(separator=' ', strip=True)
                                else:
                                    detailed_text = item.get_text(separator=' ', strip=True)
                            else:
                                detailed_text = item.get_text(separator=' ', strip=True)
                        else:
                            detailed_text = item.get_text(separator=' ', strip=True)
                        
                        # Prepare listing data with detailed information
                        listing_data = {
                            'raw_html': str(item),
                            'raw_text': detailed_text,  # Use detailed page text
                            'title_elem': details_container.find('div', class_='listing_title'),
                            'price_elem': details_container.find('div', class_='listing_price'),
                            'revenue_elem': details_container.find('div', class_='listing_revenue'),
                            'income_elem': details_container.find('div', class_='listing_income'),
                            'description_elem': details_container,
                            'source_platform': 'BusinessExits',
                            'listing_url': listing_url
                        }
                        
                        # Add image URL if available
                        img_elem = listing_container.find('img', class_='wp-post-image')
                        if img_elem and img_elem.get('src'):
                            listing_data['image_url'] = img_elem['src']
                        
                        # Check if listing is pending
                        is_pending = 'Sale Pending' in listing_container.get('class', [])
                        listing_data['status'] = 'pending' if is_pending else 'active'
                        
                        # Parse and store the listing
                        parsed_listing = self.parser.parse_listing(listing_data)
                        if parsed_listing:
                            try:
                                # Store in Supabase
                                listing_id = self.supabase.store_listing(parsed_listing)
                                print(f"Successfully stored listing in Supabase with ID: {listing_id}")
                            except Exception as e:
                                print(f"Error storing listing in Supabase: {e}")
                                print("Listing data:", json.dumps(parsed_listing, indent=2))
                            
                            listings.append(parsed_listing)
                            print(f"\nSuccessfully processed listing: {parsed_listing.get('title', 'Untitled')}")
                        
                    except Exception as e:
                        print(f"Error processing listing: {str(e)}")
                        continue
            
            return listings
            
        except Exception as e:
            print(f"Error fetching listings: {str(e)}")
            print(f"Full error details: ", e)
            return []

    def get_listing_details(self, url: str) -> Optional[Dict]:
        """Get detailed information from a Business Exits listing page"""
        try:
            soup = self._make_request(url)
            
            details = {
                'url': url,
                'raw_html': str(soup),
                'raw_text': soup.get_text(separator=' ', strip=True),
                'source_platform': 'BusinessExits',
                'scraped_at': datetime.now().isoformat(),
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
        """Extract financial information from Business Exits listing"""
        financials = {}
        try:
            # Look for financial metrics in the listing details
            metrics = {
                'asking_price': 'Listing Price:',
                'revenue': 'Revenue:',
                'ebitda': 'Income:'
            }
            
            for key, label in metrics.items():
                elem = soup.find('div', string=lambda x: label in str(x) if x else False)
                if elem:
                    # Extract the number after the label
                    value = elem.text.split(label)[-1].strip()
                    financials[key] = value
                    
        except Exception as e:
            print(f"Error extracting financials: {e}")
        return financials

    def _extract_business_info(self, soup) -> Dict:
        """Extract business information from Business Exits listing"""
        info = {}
        try:
            # Extract business type/category
            category_elem = soup.find('div', {'class': 'listing-category'})
            if category_elem:
                info['industry'] = category_elem.text.strip()
                
            # Extract location if available
            location_elem = soup.find('div', {'class': 'listing-location'})
            if location_elem:
                info['location'] = location_elem.text.strip()
                
        except Exception as e:
            print(f"Error extracting business info: {e}")
        return info

    def _extract_key_highlights(self, soup) -> Dict:
        """Extract key highlights from Business Exits listing"""
        highlights = {}
        try:
            # Look for bullet points or highlighted features
            highlights_section = soup.find('div', {'class': 'listing-highlights'})
            if highlights_section:
                bullet_points = highlights_section.find_all('li')
                for i, point in enumerate(bullet_points, 1):
                    text = point.get_text(strip=True)
                    if ':' in text:
                        key, value = text.split(':', 1)
                        highlights[key.strip()] = value.strip()
                    else:
                        highlights[f'highlight_{i}'] = text
                        
        except Exception as e:
            print(f"Error extracting highlights: {e}")
        return highlights 