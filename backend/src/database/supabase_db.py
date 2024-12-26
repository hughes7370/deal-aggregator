from supabase import create_client
import os
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import json

class SupabaseClient:
    def __init__(self):
        url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        if not url or not key:
            raise ValueError("Missing Supabase credentials in environment variables")
        
        self.client = create_client(url, key)
        print("Supabase client initialized")

    def store_listing(self, listing_data: Dict) -> str:
        """Store a listing in the database"""
        try:
            # Check if listing already exists
            existing = self.client.table('listings').select('id').eq('listing_url', listing_data['listing_url']).execute()
            
            # Prepare the data for storage
            storage_data = {
                'title': listing_data['title'],
                'listing_url': listing_data['listing_url'],
                'source_platform': listing_data.get('source_platform', ''),
                'asking_price': listing_data.get('asking_price', 0),
                'revenue': listing_data.get('revenue', 0),
                'ebitda': listing_data.get('ebitda', 0),
                'industry': listing_data.get('industry', ''),
                'location': listing_data.get('location', 'United States'),
                'description': listing_data.get('full_description', ''),
                'business_highlights': listing_data.get('business_highlights', '{}'),
                'financial_details': listing_data.get('financial_details', '{}'),
                'business_details': listing_data.get('business_details', '{}'),
                'raw_data': listing_data.get('raw_data', '{}'),
                'status': listing_data.get('status', 'active'),
                'first_seen_at': datetime.now().isoformat(),
                'last_seen_at': datetime.now().isoformat()
            }
            
            if existing.data:
                # Update existing listing
                listing_id = existing.data[0]['id']
                storage_data['last_seen_at'] = datetime.now().isoformat()
                self.client.table('listings').update(storage_data).eq('id', listing_id).execute()
                print(f"Updated existing listing with ID: {listing_id}")
                return listing_id
            
            # Insert new listing
            result = self.client.table('listings').insert(storage_data).execute()
            listing_id = result.data[0]['id']
            print(f"Inserted new listing with ID: {listing_id}")
            
            return listing_id
            
        except Exception as e:
            print(f"Error storing listing: {e}")
            print("Storage data:", json.dumps(storage_data, indent=2))
            raise

    def store_analysis(self, user_id: str, analysis_data: Dict) -> str:
        """Store analysis results"""
        try:
            result = self.client.table('analysis_results').insert({
                'user_id': user_id,
                'analysis_text': analysis_data['acquisition_analysis'],
                'listings_included': [listing['id'] for listing in analysis_data['source_listings']],
                'created_at': datetime.now().isoformat()
            }).execute()
            
            return result.data[0]['id']
            
        except Exception as e:
            print(f"Error storing analysis: {e}")
            raise

    def get_user_preferences(self, user_id: str) -> Optional[Dict]:
        """Get user preferences"""
        try:
            result = self.client.table('user_preferences').select('*').eq('user_id', user_id).execute()
            return result.data[0] if result.data else None
            
        except Exception as e:
            print(f"Error getting user preferences: {e}")
            return None

    def get_pending_newsletters(self) -> List[Dict]:
        """Get newsletters that need to be sent"""
        try:
            result = self.client.table('newsletter_logs')\
                .select('*')\
                .eq('status', 'pending')\
                .lte('scheduled_for', datetime.now().isoformat())\
                .execute()
            
            return result.data
            
        except Exception as e:
            print(f"Error getting pending newsletters: {e}")
            return []

    def update_newsletter_status(self, newsletter_id: str, status: str, error_message: str = None):
        """Update newsletter status"""
        try:
            update_data = {
                'status': status,
                'updated_at': datetime.now().isoformat()
            }
            
            if status == 'sent':
                update_data['sent_at'] = datetime.now().isoformat()
            elif status == 'failed' and error_message:
                update_data['error_message'] = error_message
            
            self.client.table('newsletter_logs').update(update_data).eq('id', newsletter_id).execute()
            
        except Exception as e:
            print(f"Error updating newsletter status: {e}")
            raise 

    def get_existing_listing_urls(self, urls: List[str]) -> List[str]:
        """Check which URLs already exist in the database"""
        try:
            result = self.client.table('listings')\
                .select('listing_url')\
                .in_('listing_url', urls)\
                .execute()
            
            return [item['listing_url'] for item in result.data]
            
        except Exception as e:
            print(f"Error checking existing URLs: {e}")
            return []

    def create_user_with_preferences(self, user_data: Dict, preferences_data: Dict) -> Tuple[str, str]:
        """Create a user and their preferences in a transaction"""
        try:
            # Create user
            user_result = self.client.table('users').insert(user_data).execute()
            if not user_result.data:
                raise Exception("Failed to create user")
            
            user_id = user_result.data[0]['id']
            
            # Create preferences
            preferences_data['user_id'] = user_id
            pref_result = self.client.table('user_preferences').insert(preferences_data).execute()
            if not pref_result.data:
                raise Exception("Failed to create preferences")
            
            pref_id = pref_result.data[0]['id']
            
            return user_id, pref_id
            
        except Exception as e:
            print(f"Error creating user with preferences: {e}")
            raise

    def get_users_for_newsletter(self) -> List[Dict]:
        """Get users who should receive newsletters based on their preferences"""
        try:
            result = self.client.table('user_preferences')\
                .select('*')\
                .execute()
            
            return result.data if result.data else []
            
        except Exception as e:
            print(f"Error getting users for newsletter: {e}")
            return []

    def update_last_notification_sent(self, user_id: str):
        """Update the last notification sent timestamp for a user"""
        try:
            self.client.table('user_preferences')\
                .update({'last_notification_sent': datetime.now().isoformat()})\
                .eq('user_id', user_id)\
                .execute()
            
        except Exception as e:
            print(f"Error updating last notification sent: {e}")
            raise

    def get_filtered_listings(self, min_price: float = None, max_price: float = None, industries: str = None, last_sent: datetime = None) -> List[Dict]:
        """Get listings filtered by user preferences"""
        try:
            query = self.client.table('listings').select('*')
            
            # Apply filters
            if min_price is not None:
                query = query.gte('asking_price', min_price)
            if max_price is not None:
                query = query.lte('asking_price', max_price)
            if industries:
                industry_list = [ind.strip() for ind in industries.split(',')]
                query = query.in_('industry', industry_list)
            if last_sent:
                query = query.gte('first_seen_at', last_sent.isoformat())
                
            # Execute query
            result = query.execute()
            return result.data if result.data else []
            
        except Exception as e:
            print(f"Error getting filtered listings: {e}")
            return []

    def create_newsletter_log(self, user_id: str, scheduled_for: datetime = None) -> str:
        """Create a new newsletter log entry"""
        try:
            data = {
                'user_id': user_id,
                'status': 'pending',
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
            
            if scheduled_for:
                data['scheduled_for'] = scheduled_for.isoformat()
            
            result = self.client.table('newsletter_logs').insert(data).execute()
            return result.data[0]['id']
            
        except Exception as e:
            print(f"Error creating newsletter log: {e}")
            raise