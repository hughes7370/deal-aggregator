import sys
import os
from pathlib import Path

# Add the project root directory to Python path
project_root = str(Path(__file__).parent.parent.parent)
sys.path.append(project_root)

from datetime import datetime
from src.database.supabase_db import SupabaseClient
from src.services.newsletter_service import NewsletterService
import asyncio

def normalize_industry(industry: str) -> str:
    """Normalize industry names between preferences and listings"""
    industry_mapping = {
        'SaaS': 'Software/SaaS',
        # Add more mappings as needed
    }
    return industry_mapping.get(industry, industry)

async def test_newsletter_sending():
    """Test newsletter sending with real data from Supabase"""
    try:
        # Initialize services
        db = SupabaseClient()
        newsletter_service = NewsletterService()
        
        print("🔍 Fetching active users...")
        # First get active users
        users_result = db.client.table('users')\
            .select('id, email')\
            .execute()
            
        if not users_result.data:
            print("❌ No active users found in database")
            return
            
        print(f"✅ Found {len(users_result.data)} active users")
        
        # Process each user
        for user in users_result.data:
            print(f"\n📧 Processing user: {user['email']}")
            
            # Get user preferences in a separate query
            preferences_result = db.client.table('user_preferences')\
                .select('*')\
                .eq('user_id', user['id'])\
                .execute()
                
            if not preferences_result.data:
                print(f"⚠️ No preferences found for user {user['email']}")
                continue
                
            preferences = preferences_result.data[0]
            print(f"Found preferences: min_price={preferences['min_price']}, max_price={preferences['max_price']}, industries={preferences['industries']}")
            
            # Normalize industries in preferences
            normalized_industries = [normalize_industry(ind) for ind in preferences['industries']]
            print(f"Normalized industries: {normalized_industries}")
            
            # Get matching listings
            print("🔍 Finding matching listings...")
            listings_result = db.client.table('listings')\
                .select('*')\
                .gte('asking_price', preferences['min_price'])\
                .lte('asking_price', preferences['max_price'])\
                .in_('industry', normalized_industries)\
                .execute()
                
            matching_listings = listings_result.data
            
            if not matching_listings:
                print("ℹ️ No matching listings found for user's criteria")
                continue
                
            print(f"✅ Found {len(matching_listings)} matching listings")
            print("Matching listings industries:", [listing['industry'] for listing in matching_listings])
            
            # Send test newsletter
            print("📤 Sending newsletter...")
            result = await newsletter_service.send_newsletter({
                'email': user['email'],
                'preferences': preferences
            }, matching_listings)
            
            if result:
                print(f"✅ Newsletter sent successfully! ID: {result}")
            else:
                print("❌ Failed to send newsletter")
                
            # Add a small delay between sends
            await asyncio.sleep(2)
            
    except Exception as e:
        print(f"❌ Error during testing: {str(e)}")
        raise e  # Re-raise the exception after logging
    finally:
        # Cleanup code if needed
        print("📝 Newsletter test completed")

if __name__ == "__main__":
    # Verify environment
    required_vars = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'RESEND_API_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"  - {var}")
        exit(1)
        
    print("🚀 Starting newsletter test...")
    asyncio.run(test_newsletter_sending()) 