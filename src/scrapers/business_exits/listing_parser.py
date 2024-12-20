from typing import Dict
from bs4 import BeautifulSoup
import json
from openai import OpenAI
from config.config import OPENAI_API_KEY
from src.database.supabase_db import SupabaseClient

class BusinessExitsListingParser:
    def __init__(self):
        self.client = OpenAI(api_key=OPENAI_API_KEY)
        self.supabase = SupabaseClient()
        
    def parse_listing(self, listing_data: Dict) -> Dict:
        """Parse listing data specific to Business Exits format"""
        try:
            # Extract text from elements
            title = listing_data['title_elem'].text.strip() if listing_data['title_elem'] else ''
            price_text = listing_data['price_elem'].text.strip() if listing_data['price_elem'] else ''
            revenue_text = listing_data['revenue_elem'].text.strip() if listing_data['revenue_elem'] else ''
            income_text = listing_data['income_elem'].text.strip() if listing_data['income_elem'] else ''
            description_text = listing_data.get('raw_text', '')
            
            # Parse financial values
            asking_price = self._extract_amount(price_text.replace('Listing Price:', '').strip())
            revenue = self._extract_amount(revenue_text.replace('Revenue:', '').strip())
            ebitda = self._extract_amount(income_text.replace('Income:', '').strip())
            
            # Use GPT to parse and structure the data
            prompt = f"""
            Parse this business listing information and return a structured JSON object.
            
            Title: {title}
            Price: {price_text}
            Revenue: {revenue_text}
            Income: {income_text}
            Full Text: {description_text}
            
            Return a JSON object with these fields:
            - full_description: A clean, well-formatted description of the business (this is very important)
            - business_highlights: Key points about the business as key-value pairs
            - financial_details: All financial information as key-value pairs
            - business_details: Information about operations, employees, location, etc. as key-value pairs
            
            Format all financial numbers as plain integers (no currency symbols or commas).
            Make sure the full_description is a complete, well-written paragraph about the business.
            """
            
            try:
                response = self.client.chat.completions.create(
                    model="gpt-4-0125-preview",
                    response_format={ "type": "json_object" },
                    messages=[
                        {"role": "system", "content": "You are a business listing parser that extracts structured data."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0
                )
                
                parsed_data = json.loads(response.choices[0].message.content)
                
                # Create listing object with GPT-parsed data
                listing = {
                    'title': title,
                    'asking_price': asking_price,
                    'revenue': revenue,
                    'ebitda': ebitda,
                    'industry': self._extract_industry(title),
                    'location': 'United States',
                    'listing_url': listing_data.get('listing_url', ''),
                    'source_platform': 'BusinessExits',
                    'status': listing_data.get('status', 'active'),
                    'full_description': parsed_data['full_description'],  # Directly use the description
                    'business_highlights': json.dumps(parsed_data.get('business_highlights', {})),
                    'financial_details': json.dumps(parsed_data.get('financial_details', {})),
                    'business_details': json.dumps(parsed_data.get('business_details', {})),
                    'raw_data': json.dumps({
                        'raw_html': listing_data.get('raw_html', ''),
                        'raw_text': listing_data.get('raw_text', ''),
                        'parsed_data': parsed_data
                    })
                }
                
                # Debug output
                print(f"\nSuccessfully parsed listing:")
                print(f"Title: {title}")
                print(f"Asking Price: ${asking_price:,}")
                print(f"Revenue: ${revenue:,}")
                print(f"EBITDA: ${ebitda:,}")
                print(f"Description: {listing['full_description'][:200]}...")  # Show first 200 chars
                
                return listing
                
            except Exception as e:
                print(f"Error using GPT to parse data: {e}")
                return None
                
        except Exception as e:
            print(f"Error parsing Business Exits listing: {e}")
            print(f"Listing data keys: {listing_data.keys()}")
            return None

    def _extract_amount(self, text: str) -> int:
        """Extract numeric amount from text"""
        try:
            # Remove currency symbols and commas
            text = text.replace('$', '').replace(',', '').strip()
            
            # Handle ranges by taking the lower number
            if '-' in text:
                text = text.split('-')[0].strip()
                
            # Handle "to" in ranges
            if ' to ' in text:
                text = text.split(' to ')[0].strip()
            
            # Handle parenthetical notes
            if '(' in text:
                text = text.split('(')[0].strip()
            
            # Convert K/M/B to full numbers
            if 'K' in text.upper():
                return int(float(text.upper().replace('K', '')) * 1000)
            elif 'M' in text.upper():
                return int(float(text.upper().replace('M', '')) * 1000000)
            elif 'B' in text.upper():
                return int(float(text.upper().replace('B', '')) * 1000000000)
            
            return int(float(text))
        except:
            return 0

    def _extract_industry(self, title: str) -> str:
        """Extract industry from listing title"""
        title = title.lower()
        
        if any(term in title for term in ['saas', 'software', 'tech', 'app']):
            return 'Software/SaaS'
        elif any(term in title for term in ['ecommerce', 'e-commerce', 'amazon', 'shopify']):
            return 'Ecommerce'
        elif any(term in title for term in ['manufacturing', 'factory', 'production']):
            return 'Manufacturing'
        elif any(term in title for term in ['service', 'consulting', 'agency']):
            return 'Service'
        elif any(term in title for term in ['distribution', 'wholesale']):
            return 'Wholesale/Distribution'
        else:
            return 'Other' 