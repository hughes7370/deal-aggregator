from typing import Dict, List, Optional
from datetime import datetime
import os
import json
import requests
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError
from agentql import wrap
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
        """Get listings from Acquire using direct AgentQL query"""
        listings = []
        
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=False)
                context = browser.new_context()
                page = context.new_page()
                
                # Set longer default timeout
                page.set_default_timeout(60000)  # 60 seconds
                
                try:
                    # First try to use stored state
                    if os.path.exists(self.login_state_path):
                        print("Found stored login state, restoring...")
                        context.storage_state(path=self.login_state_path)
                        
                        # Try accessing listings page directly
                        print("Attempting to access listings with stored state...")
                        page.goto(self.base_url)
                        page.wait_for_timeout(5000)  # Short wait for initial load
                        
                        # If we're still on the login page, stored state is invalid
                        if '/signin' in page.url:
                            print("Stored login state expired, logging in again...")
                            os.remove(self.login_state_path)
                            
                            # Navigate to login page
                            print("Navigating to login page...")
                            page.goto(self.login_url)
                            page.wait_for_timeout(2000)
                            
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
                            page.wait_for_timeout(5000)
                            
                            # Store login state for next time
                            print("Storing login state...")
                            context.storage_state(path=self.login_state_path)
                            
                            # Navigate to listings page
                            print("\nNavigating to listings page...")
                            page.goto(self.base_url)
                    
                    print("Waiting 30 seconds for content to load...")
                    page.wait_for_timeout(30000)  # Wait 30 seconds for everything to load
                    
                    print("Page URL:", page.url)
                    
                    # Wrap the page with AgentQL
                    print("Initializing AgentQL...")
                    agentql_page = wrap(page)
                    
                    print("Executing AgentQL query (this may take a minute)...")
                    try:
                        data = agentql_page.query_data("""
                        {
                            listings[] {
                                listing_title
                                description
                                TTM_revenue
                                TTM_profit
                                asking_price
                                listing_url
                            }
                        }
                        """)
                        
                        print("Raw AgentQL response:", json.dumps(data, indent=2))
                        
                        # Process the data
                        listing_data = data.get('listings', [])
                        if listing_data:
                            for item in listing_data:
                                try:
                                    formatted_listing = {
                                        'title': item.get('listing_title', ''),
                                        'description': item.get('description', ''),
                                        'revenue': item.get('TTM_revenue', ''),
                                        'cash_flow': item.get('TTM_profit', ''),
                                        'price': item.get('asking_price', ''),
                                        'url': item.get('listing_url', ''),
                                        'source': 'acquire',
                                        'created_at': datetime.utcnow().isoformat(),
                                        'updated_at': datetime.utcnow().isoformat()
                                    }
                                    print(f"\nFound listing: {json.dumps(formatted_listing, indent=2)}")
                                    listings.append(formatted_listing)
                                except Exception as e:
                                    print(f"Error processing listing: {e}")
                                    continue
                        else:
                            print("No listings found in the response")
                            # Take a screenshot for debugging
                            page.screenshot(path="debug_screenshot.png")
                            print("Saved debug screenshot to debug_screenshot.png")
                    
                    except Exception as e:
                        print(f"Error during AgentQL query: {e}")
                        # Take a screenshot for debugging
                        page.screenshot(path="agentql_error.png")
                        print("Saved error screenshot to agentql_error.png")
                    
                except PlaywrightTimeoutError as e:
                    print(f"Timeout error: {e}")
                except Exception as e:
                    print(f"Error during scraping: {e}")
                finally:
                    browser.close()
        
        except Exception as e:
            print(f"Fatal error in Acquire scraper: {e}")
        
        # Store listings in Supabase
        if listings:
            try:
                print(f"\nStoring {len(listings)} listings in Supabase...")
                for listing in listings:
                    try:
                        # Insert or update based on title and source
                        result = self.supabase.table('listings').upsert(
                            listing,
                            on_conflict='title,source'
                        ).execute()
                        print(f"Stored listing: {listing['title']}")
                    except Exception as e:
                        print(f"Error storing listing {listing['title']}: {e}")
            except Exception as e:
                print(f"Error storing listings in Supabase: {e}")
        
        return listings

    def _do_login(self, page):
        """Helper method to perform login"""
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
        
        # Store login state
        print("Storing login state...")
        context = page.context
        context.storage_state(path=self.login_state_path)
        
        # Navigate to listings page and wait for it to be interactive
        print("\nNavigating to listings page...")
        page.goto(self.base_url)
        
        print("Waiting for page to be interactive...")
        # Wait for network activity to settle
        page.wait_for_load_state('networkidle')
        
        # Wait for React to mount and render
        page.wait_for_function("""
            () => {
                // Check if main content area exists and has children
                const mainContent = document.querySelector('div[role="main"]');
                return mainContent && mainContent.children.length > 0;
            }
        """)
        
        # Wait a bit for any final renders
        page.wait_for_timeout(2000)

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