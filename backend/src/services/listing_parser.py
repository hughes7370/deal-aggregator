from openai import OpenAI
from typing import Dict, Optional
from config.config import OPENAI_API_KEY
import json
from backend.src.database.supabase_db import SupabaseClient

class ListingParser:
    def __init__(self):
        self.client = OpenAI(api_key=OPENAI_API_KEY)
        self.supabase = SupabaseClient()
        
    def parse_listing(self, listing_data: Dict) -> Optional[Dict]:
        """
        Use OpenAI to parse listing data into structured format matching our Supabase schema
        """
        try:
            # Extract text content from elements for OpenAI
            content = {
                'title': listing_data['title_elem'].text.strip() if listing_data['title_elem'] else '',
                'price': listing_data['price_elem'].get_text(' ', strip=True) if listing_data['price_elem'] else '',
                'ebitda': listing_data['cash_flow_elem'].get_text(' ', strip=True) if listing_data['cash_flow_elem'] else '',
                'description': listing_data['description_elem'].get_text(' ', strip=True) if listing_data['description_elem'] else '',
                'full_text': listing_data['raw_text']
            }

            prompt = f"""You are a business listing data parser. Extract structured information from this business listing.
            Focus on accurate extraction of financial figures, removing any currency symbols and converting to plain numbers.
            If a value is a range, use the lower number. If a value is not found, use 0 for numeric fields or empty string for text fields.

            IMPORTANT FINANCIAL MAPPINGS:
            - "Cash Flow" should be mapped to EBITDA
            - "Gross Income" or "Revenue" should be mapped to revenue
            - Remove all currency symbols, commas, and convert to plain numbers
            - For ranges, use the lower number
            - Convert K to thousands (e.g., 500K = 500000)
            - Convert M to millions (e.g., 2.5M = 2500000)

            REQUIRED FIELDS (must be included in output):
            - title: string (use the listing title)
            - asking_price: number (use 0 if not found)
            - description: string (use empty string if not found)

            Listing Information:
            Title: {content['title']}
            Price Information: {content['price']}
            EBITDA (Cash Flow): {content['ebitda']}
            Description: {content['description']}
            Full Text: {content['full_text'][:1500]}

            Parse this content according to the schema, ensuring:
            1. All financial figures are pure numbers (no symbols or text)
            2. Industry is categorized broadly (e.g., "Software", "E-commerce", "Technology")
            3. Description is concise but informative
            4. Business highlights capture key metrics and achievements
            5. Financial details should include:
               - Revenue/Gross Income (as revenue)
               - Cash Flow (as ebitda)
               - Asking Price
               - Other financial metrics found
            6. Business details include operational information

            Example output format:
            {{
                "title": "Business Title Here",
                "asking_price": 1000000,
                "revenue": 500000,
                "ebitda": 200000,
                "industry": "Software",
                "location": "United States",
                "description": "Brief description here",
                "business_highlights": {{
                    "key_metric_1": "value_1",
                    "key_metric_2": "value_2"
                }},
                "financial_details": {{
                    "gross_margin": "60%",
                    "monthly_recurring_revenue": 50000
                }},
                "business_details": {{
                    "years_in_business": 5,
                    "employees": 10
                }}
            }}

            Return the data in a clean, structured JSON format matching the schema.
            """

            # Define the schema to match Supabase 'listings' table
            schema = {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "The title of the business listing"},
                    "asking_price": {"type": "integer", "description": "Asking price in dollars (numeric only)"},
                    "revenue": {"type": "integer", "description": "Annual revenue in dollars (numeric only)"},
                    "ebitda": {"type": "integer", "description": "Annual EBITDA/Cash Flow in dollars (numeric only)"},
                    "industry": {"type": "string", "description": "Primary industry of the business"},
                    "location": {"type": "string", "description": "Business location"},
                    "description": {"type": "string", "description": "Brief description of the business"},
                    "business_highlights": {
                        "type": "object",
                        "description": "Key highlights and metrics about the business"
                    },
                    "financial_details": {
                        "type": "object",
                        "description": "Detailed financial information"
                    },
                    "business_details": {
                        "type": "object",
                        "description": "Additional business information"
                    }
                },
                "required": ["title", "asking_price", "description"]
            }

            response = self.client.chat.completions.create(
                model="gpt-4-0125-preview",
                response_format={ "type": "json_object" },
                messages=[
                    {"role": "system", "content": "You are a precise business listing parser that extracts structured data."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0
            )

            # Parse the response
            parsed_data = json.loads(response.choices[0].message.content)
            
            # Ensure required fields exist with default values
            parsed_data = {
                'title': parsed_data.get('title', content['title'] or 'Untitled Listing'),
                'asking_price': parsed_data.get('asking_price', 0),
                'revenue': parsed_data.get('revenue', 0),
                'ebitda': parsed_data.get('ebitda', 0),
                'industry': parsed_data.get('industry', ''),
                'location': parsed_data.get('location', 'United States'),
                'description': parsed_data.get('description', content['description'] or ''),
                'business_highlights': parsed_data.get('business_highlights', {}),
                'financial_details': parsed_data.get('financial_details', {}),
                'business_details': parsed_data.get('business_details', {})
            }

            # Format data for Supabase storage
            storage_data = {
                'title': parsed_data['title'],
                'asking_price': parsed_data['asking_price'],
                'revenue': parsed_data.get('revenue', 0),
                'ebitda': parsed_data.get('ebitda', 0),
                'industry': parsed_data.get('industry', ''),
                'location': parsed_data.get('location', 'United States'),
                'description': parsed_data['description'],
                'business_highlights': json.dumps(parsed_data.get('business_highlights', {})),
                'financial_details': json.dumps(parsed_data.get('financial_details', {})),
                'business_details': json.dumps(parsed_data.get('business_details', {})),
                'listing_url': listing_data['listing_url'],
                'source_platform': listing_data['source_platform'],
                'raw_data': json.dumps({
                    'html': listing_data['raw_html'],
                    'text': listing_data['raw_text'],
                    'parsed_data': parsed_data
                }),
                'status': 'active'
            }

            # Store in Supabase
            try:
                listing_id = self.supabase.store_listing(storage_data)
                storage_data['id'] = listing_id
                print(f"Successfully stored listing in Supabase with ID: {listing_id}")
            except Exception as e:
                print(f"Error storing listing in Supabase: {e}")
                # Continue even if storage fails
            
            return storage_data

        except Exception as e:
            print(f"Error parsing listing: {e}")
            return None

    def _clean_number(self, value: str) -> int:
        """Convert string numbers to integers, handling K/M/B suffixes"""
        try:
            value = value.strip().lower().replace('$', '').replace(',', '')
            if 'k' in value:
                return int(float(value.replace('k', '')) * 1000)
            elif 'm' in value:
                return int(float(value.replace('m', '')) * 1000000)
            elif 'b' in value:
                return int(float(value.replace('b', '')) * 1000000000)
            return int(float(value))
        except:
            return 0 