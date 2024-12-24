import json
import os
from typing import Dict, List, Optional
import requests
from ..base_scraper import BaseScraper

class AuthenticatedScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.session = requests.Session()
        self._load_cookies()

    def _load_cookies(self):
        """Load cookies from exported Chrome cookies"""
        cookie_file = os.path.join('cookies', 'site_cookies.json')
        try:
            with open(cookie_file, 'r') as f:
                cookies = json.load(f)
                for cookie in cookies:
                    self.session.cookies.set(
                        cookie['name'],
                        cookie['value'],
                        domain=cookie['domain']
                    )
            print("Loaded authentication cookies successfully")
        except Exception as e:
            print(f"Error loading cookies: {e}")
            raise

    def get_listings(self, max_pages: int = 1) -> List[Dict]:
        try:
            # Use authenticated session
            response = self.session.get(
                self.base_url,
                headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            )
            
            # Check if we're still authenticated
            if 'login' in response.url.lower():
                raise Exception("Cookie authentication failed - please update cookies")
                
            # Continue with normal scraping...
            
        except Exception as e:
            print(f"Error in authenticated scraper: {e}")
            return [] 