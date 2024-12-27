from typing import Dict, List, Optional
from datetime import datetime
import os
import json
import requests
from playwright.sync_api import sync_playwright
from ..base_scraper import BaseScraper
from backend.src.database.supabase_db import SupabaseClient
from config.search_queries import BASE_URLS

class AcquireScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.base_url = BASE_URLS.get("acquire", "https://app.acquire.com/all-listing")
        self.login_url = "https://app.acquire.com/signin"
        self.supabase = SupabaseClient()
        self.login_state_path = os.path.join(os.path.dirname(__file__), 'acquire_login.json')
        self.agentql_api_url = "https://api.agentql.com/v1/query-data"
        self.headers = {
            "X-API-Key": os.getenv('AGENTQL_API_KEY'),
            "Content-Type": "application/json"
        }
        self.auth_cookie = None
        self.auth_cookies = None

    def _authenticate(self) -> bool:
        """Authenticate with Acquire using Playwright"""
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=False)
                context = browser.new_context()
                page = context.new_page()
                
                # Check for stored login state
                if os.path.exists(self.login_state_path):
                    print("Found stored login state, restoring...")
                    context.storage_state(path=self.login_state_path)
                    
                    # Try accessing listings page directly
                    print("Attempting to access listings with stored state...")
                    page.goto(self.base_url)
                    print("Waiting for initial page load...")
                    page.wait_for_load_state('networkidle')
                    page.wait_for_timeout(5000)
                    
                    # If we're still on the login page, stored state is invalid
                    if '/signin' in page.url:
                        print("Stored login state expired, logging in again...")
                        os.remove(self.login_state_path)
                    else:
                        print("Successfully restored login state")
                        # Collect all cookies
                        cookies = context.cookies()
                        # For debugging:
                        # print("Cookies:", cookies)
                        self.auth_cookies = "; ".join([f"{c['name']}={c['value']}" for c in cookies])
                        return True
                
                if not os.path.exists(self.login_state_path):
                    # Navigate to login page
                    print("Navigating to login page...")
                    page.goto(self.login_url)
                    page.wait_for_load_state('networkidle')
                    
                    print("Filling login form...")
                    email_input = page.wait_for_selector("input.input.special-input[inputmode='email']")
                    email_input.fill("suncrestcap@gmail.com")
                    page.wait_for_timeout(1000)
                    
                    password_input = page.wait_for_selector("input.input.special-input[type='password']")
                    password_input.fill("6aZ!GF7^r*B^hyyVBA")
                    page.wait_for_timeout(1000)
                    
                    login_button = page.wait_for_selector("button.btn.btn-main.btn-action.btn-full-width.sign-in")
                    login_button.click()
                    
                    print("Waiting for login to complete...")
                    page.wait_for_load_state('networkidle')
                    page.wait_for_timeout(5000)
                    
                    # Store login state
                    print("Storing login state...")
                    context.storage_state(path=self.login_state_path)
                    
                    # Collect cookies
                    cookies = context.cookies()
                    self.auth_cookies = "; ".join([f"{c['name']}={c['value']}" for c in cookies])
                    
                    # Optionally set self.auth_cookie if you specifically care about the 'm' cookie
                    auth_cookie = next((cookie for cookie in cookies if cookie["name"] == "m"), None)
                    if auth_cookie:
                        self.auth_cookie = auth_cookie["value"]
                    
                    # If we successfully reached here, login presumably worked
                    return True

                return False
                    
        except Exception as e:
            print(f"Authentication error: {e}")
            return False

    def get_listings(self, max_pages: int = 1) -> List[Dict]:
        """Get listings from Acquire using AgentQL and fallback to Playwright"""
        listings = []
        
        try:
            # First authenticate
            if not self._authenticate():
                print("Failed to authenticate with Acquire")
                return []
            
            # Use the stored cookies
            if self.auth_cookies:
                self.headers["Cookie"] = self.auth_cookies
            else:
                print("Warning: Could not set Cookie header because 'auth_cookies' is empty.")
            
            payload = {
                "query": """
                {
                    listing_cards[] {
                        business_name: h3, h2, div[class*='title'] { text }
                        business_description: p, div[class*='description'] { text }
                        annual_revenue: div[class*='metric']:nth-child(1) { text }
                        annual_profit: div[class*='metric']:nth-child(2) { text }
                        asking_price: div[class*='metric']:nth-child(3) { text }
                        business_location: div[class*='detail']:nth-child(1) { text }
                        team_size: div[class*='detail']:nth-child(2) { text }
                        founded_year: div[class*='detail']:nth-child(3) { text }
                        business_category: div[class*='detail']:nth-child(4) { text }
                    }
                }
                """,
                "url": self.base_url,
                "params": {
                    "wait_for": 30,
                    "mode": "standard",
                    "is_scroll_to_bottom_enabled": True
                }
            }
            
            print("\nAttempting to fetch listings via AgentQL...")
            print(f"Using URL: {self.base_url}")
            print(f"Headers: {json.dumps(self.headers, indent=2)}")
            
            response = requests.post(self.agentql_api_url, headers=self.headers, json=payload)
            
            if response.status_code != 200:
                print(f"AgentQL error response: {response.text}")
                return self._get_listings_with_playwright()
            
            data = response.json()
            listing_cards = data.get('data', {}).get('listing_cards', [])
            
            if not listing_cards:
                print("No listings found via AgentQL, falling back to Playwright...")
                return self._get_listings_with_playwright()
            
            # Process listings
            for card in listing_cards:
                try:
                    formatted_listing = {
                        'title': card.get('business_name', [{}])[0].get('text', ''),
                        'description': card.get('business_description', [{}])[0].get('text', ''),
                        'revenue': card.get('annual_revenue', [{}])[0].get('text', ''),
                        'cash_flow': card.get('annual_profit', [{}])[0].get('text', ''),
                        'price': card.get('asking_price', [{}])[0].get('text', ''),
                        'location': card.get('business_location', [{}])[0].get('text', ''),
                        'employees': card.get('team_size', [{}])[0].get('text', ''),
                        'established_year': card.get('founded_year', [{}])[0].get('text', ''),
                        'industry': card.get('business_category', [{}])[0].get('text', '')
                    }
                    
                    print(f"\nFound listing via AgentQL: {json.dumps(formatted_listing, indent=2)}")
                    listings.append(formatted_listing)
                    
                except Exception as e:
                    print(f"Error processing listing data: {e}")
                    continue
            
        except Exception as e:
            print(f"Error in Acquire scraper: {e}")
            return self._get_listings_with_playwright()
            
        return listings

    def _get_listings_with_playwright(self) -> List[Dict]:
        """Backup method to get listings using Playwright directly"""
        listings = []
        
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=False)
                context = browser.new_context()
                
                # Load stored state if available
                if os.path.exists(self.login_state_path):
                    context.storage_state(path=self.login_state_path)
                
                page = context.new_page()
                page.goto(self.base_url)
                
                # Wait for page load
                print("Waiting for listings page to load...")
                page.wait_for_load_state('networkidle')
                page.wait_for_load_state('domcontentloaded')
                page.wait_for_load_state('load')
                
                # Wait for React app to initialize
                print("Waiting for React app to initialize...")
                page.wait_for_selector("div#root", timeout=30000)
                page.wait_for_timeout(5000)
                
                # Take a screenshot for debugging
                print("\nTaking screenshot...")
                page.screenshot(path="acquire_listings.png")
                
                # Print page content for debugging
                print("\nPage content:")
                content = page.content()
                print(content[:1000])
                
                # Scroll to trigger content loading
                print("Scrolling page to trigger content loading...")
                page.evaluate("""
                    window.scrollTo({
                        top: document.body.scrollHeight,
                        behavior: 'smooth'
                    });
                """)
                page.wait_for_timeout(5000)
                
                # Try different selectors to find listings
                selectors = [
                    "div[class*='ListingCard']",  # React component naming convention
                    "div[class*='listing-card']",  # Kebab case
                    "div[class*='listingCard']",   # Camel case
                    "div[class*='card']",
                    "div[class*='business']",
                    "div[class*='listing']",
                    "div[class*='Card']",          # PascalCase
                    "div[class*='item']",          # Generic
                    "div[class*='Item']",          # PascalCase
                ]
                
                listing_elements = []
                for selector in selectors:
                    print(f"\nTrying selector: {selector}")
                    elements = page.query_selector_all(selector)
                    print(f"Found {len(elements)} elements")
                    if elements:
                        listing_elements = elements
                        print("Sample element HTML:")
                        print(elements[0].inner_html()[:200])
                        break
                
                if not listing_elements:
                    print("No listing elements found")
                    return []
                
                print(f"\nProcessing {len(listing_elements)} listings...")
                for element in listing_elements:
                    try:
                        # Extract data using various selectors
                        title = element.query_selector("h3, h2, div[class*='title']")
                        title_text = title.inner_text() if title else ""
                        
                        desc = element.query_selector("p, div[class*='description']")
                        desc_text = desc.inner_text() if desc else ""
                        
                        # Extract metrics (revenue, profit, price)
                        metrics = element.query_selector_all("div[class*='metric'] span, div[class*='value'] span")
                        revenue = metrics[0].inner_text() if len(metrics) > 0 else ""
                        profit = metrics[1].inner_text() if len(metrics) > 1 else ""
                        price = metrics[2].inner_text() if len(metrics) > 2 else ""
                        
                        # Extract details (location, team size, founded year, category)
                        details = element.query_selector_all("div[class*='detail'] span, div[class*='info'] span")
                        location = details[0].inner_text() if len(details) > 0 else ""
                        team_size = details[1].inner_text() if len(details) > 1 else ""
                        founded_year = details[2].inner_text() if len(details) > 2 else ""
                        category = details[3].inner_text() if len(details) > 3 else ""
                        
                        formatted_listing = {
                            'title': title_text,
                            'description': desc_text,
                            'revenue': revenue,
                            'cash_flow': profit,
                            'price': price,
                            'location': location,
                            'employees': team_size,
                            'established_year': founded_year,
                            'industry': category
                        }
                        
                        print(f"\nFound listing via Playwright: {json.dumps(formatted_listing, indent=2)}")
                        listings.append(formatted_listing)
                        
                    except Exception as e:
                        print(f"Error extracting listing data: {e}")
                        continue
                
        except Exception as e:
            print(f"Error in Playwright scraping: {e}")
            
        return listings

    def get_listing_details(self, listing_url: str) -> Optional[Dict]:
        """Get detailed information from a listing page"""
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=False)
                context = browser.new_context()
                
                # Load stored state if available
                if os.path.exists(self.login_state_path):
                    context.storage_state(path=self.login_state_path)
                
                page = context.new_page()
                page.goto(listing_url)
                page.wait_for_load_state('networkidle')
                
                # Extract business details
                details = {}
                details_section = page.query_selector("div[class*='business-details']")
                if details_section:
                    metrics = details_section.query_selector_all("div[class*='metric']")
                    for metric in metrics:
                        label = metric.query_selector("div[class*='label']")
                        value = metric.query_selector("div[class*='value']")
                        if label and value:
                            key = label.inner_text().lower().replace(" ", "_")
                            details[key] = value.inner_text()
                
                # Extract description
                description = page.query_selector("div[class*='description']")
                description_text = description.inner_text() if description else ""
                
                # Extract highlights
                highlights = []
                highlight_elements = page.query_selector_all("div[class*='highlight']")
                for element in highlight_elements:
                    text = element.inner_text()
                    if text:
                        highlights.append({"text": text})
                
                # Extract financial info
                financials = {}
                financial_section = page.query_selector("div[class*='financials']")
                if financial_section:
                    metrics = financial_section.query_selector_all("div[class*='metric']")
                    for metric in metrics:
                        label = metric.query_selector("div[class*='label']")
                        value = metric.query_selector("div[class*='value']")
                        if label and value:
                            key = label.inner_text().lower().replace(" ", "_")
                            financials[key] = value.inner_text()
                
                return {
                    "business_details": details,
                    "description_text": description_text,
                    "highlights": highlights,
                    "financial_info": financials
                }
                
        except Exception as e:
            print(f"Error getting listing details: {e}")
            return None 