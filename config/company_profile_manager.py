import os
import sys
import sqlite3
from typing import Dict, Optional, Tuple
import json
from datetime import datetime
import uuid

# Add the project root directory to Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

from src.database.database import NewsDatabase
from src.database.supabase_db import SupabaseClient

class CompanyProfileManager:
    def __init__(self):
        self.db = NewsDatabase()
        self.supabase = SupabaseClient()
        # Generate a system user ID if needed
        self.system_user_id = str(uuid.uuid4())
        print(f"CompanyProfileManager initialized with database path: {self.db.db_path}")
    
    def verify_profile_exists(self, user_id: str = None) -> Tuple[bool, bool]:
        """
        Check if profiles exist in both databases
        """
        # Use system_user_id if no user_id provided
        user_id = user_id or self.system_user_id
        
        supabase_exists = False
        local_exists = False
        
        try:
            # Check Supabase
            result = self.supabase.get_user_preferences(user_id)
            supabase_exists = bool(result)
            
            # Check local DB
            with sqlite3.connect(self.db.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT COUNT(*) FROM company_profile')
                local_exists = cursor.fetchone()[0] > 0
                
            print(f"\nProfile Check:")
            print(f"Supabase profile exists: {supabase_exists}")
            print(f"Local profile exists: {local_exists}")
            
            return local_exists, supabase_exists
            
        except Exception as e:
            print(f"Error verifying profiles: {e}")
            return False, False
    
    def set_company_profile(self, profile: Dict, user_id: str = None) -> bool:
        """
        Set or update the buyer's deal criteria profile in both local DB and Supabase
        """
        try:
            # Use system_user_id if no user_id provided
            user_id = user_id or self.system_user_id

            # First, ensure user exists in users table
            try:
                user_data = {
                    'id': user_id,
                    'email': f'system_{user_id}@example.com',
                    'subscription_tier': 'free',
                    'subscription_status': 'active'
                }
                self.supabase.client.table('users').upsert(user_data).execute()
            except Exception as e:
                print(f"Note: User already exists or error creating user: {e}")

            # Format the profile data for Supabase
            supabase_profile = {
                'user_id': user_id,
                'min_price': profile.get('size_min', 0),
                'max_price': profile.get('size_max', 0),
                'industries': profile.get('industries', '').split(','),
                'geographic_regions': [profile.get('geographic_scope', '')],
                'business_models': profile.get('description', '').split(','),
                'newsletter_frequency': 'weekly',
                'include_keywords': [],
                'exclude_keywords': [],
                'updated_at': datetime.now().isoformat()
            }

            # Store in Supabase
            existing = self.supabase.client.table('user_preferences')\
                .select('id')\
                .eq('user_id', user_id)\
                .execute()

            if existing.data:
                # Update existing preferences
                self.supabase.client.table('user_preferences')\
                    .update(supabase_profile)\
                    .eq('user_id', user_id)\
                    .execute()
                print(f"Updated preferences for user {user_id}")
            else:
                # Insert new preferences
                self.supabase.client.table('user_preferences')\
                    .insert(supabase_profile)\
                    .execute()
                print(f"Created new preferences for user {user_id}")

            # Also store in local SQLite (keeping existing functionality)
            with sqlite3.connect(self.db.db_path) as conn:
                cursor = conn.cursor()
                
                # Deactivate all existing profiles
                cursor.execute('''
                    UPDATE company_profile 
                    SET is_active = 0 
                    WHERE is_active = 1
                ''')
                
                # Insert new profile
                cursor.execute('''
                    INSERT INTO company_profile 
                    (company_name, size_min, size_max, industries, geographic_scope, 
                     description)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    profile['name'],
                    profile.get('size_min', 0),
                    profile.get('size_max', 0),
                    profile.get('industries', ''),
                    profile.get('geographic_scope', ''),
                    profile.get('description', '')
                ))
                
            print("Profile set successfully in both databases")
            return True
            
        except Exception as e:
            print(f"Error setting profile: {e}")
            return False
    
    def get_active_profile(self, user_id: str = None) -> Optional[Dict]:
        """
        Get the current active profile from Supabase, falling back to local DB
        """
        try:
            # Use system_user_id if no user_id provided
            user_id = user_id or self.system_user_id
            
            # Try Supabase first
            result = self.supabase.get_user_preferences(user_id)
            
            if result:
                return {
                    'name': user_id,
                    'size_min': result.get('min_price', 0),
                    'size_max': result.get('max_price', 0),
                    'industries': ','.join(result.get('industries', [])),
                    'geographic_scope': result.get('geographic_regions', [''])[0],
                    'description': ','.join(result.get('business_models', []))
                }

            # Fall back to local SQLite
            with sqlite3.connect(self.db.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute('''
                    SELECT company_name, size_min, size_max, industries, 
                           geographic_scope, description
                    FROM company_profile
                    WHERE is_active = 1
                    ORDER BY created_at DESC
                    LIMIT 1
                ''')
                
                result = cursor.fetchone()
                
                if result:
                    print("Active profile retrieved from local DB")
                    return {
                        'name': result[0],
                        'size_min': result[1],
                        'size_max': result[2],
                        'industries': result[3],
                        'geographic_scope': result[4],
                        'description': result[5]
                    }
                    
            print("No active profile found in either database")
            return None
            
        except Exception as e:
            print(f"Error getting active profile: {e}")
            return None

# Example usage
if __name__ == "__main__":
    profile_manager = CompanyProfileManager()
    
    # Create a test user ID
    test_user_id = str(uuid.uuid4())
    print(f"\nUsing test user ID: {test_user_id}")
    
    # Set example buyer profile with deal criteria
    new_profile = {
        'name': 'Acme Acquisitions',
        'size_min': 1000000,
        'size_max': 5000000,
        'industries': 'Software, Technology',
        'geographic_scope': 'United States',
        'description': 'Looking for profitable software companies'
    }
    
    # Set profile with the test user ID
    success = profile_manager.set_company_profile(new_profile, test_user_id)
    if success:
        print("\nProfile set successfully")
    
    # Verify the profile was set
    active_profile = profile_manager.get_active_profile(test_user_id)
    print("\nCurrent active buyer profile:")
    print(json.dumps(active_profile, indent=2))