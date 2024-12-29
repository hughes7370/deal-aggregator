import sys
import os
from pathlib import Path

# Add the project root directory to Python path
project_root = str(Path(__file__).parent.parent.parent)
sys.path.append(project_root)

from datetime import datetime
from backend.src.database.supabase_db import SupabaseClient
from backend.src.services.newsletter_service import NewsletterService
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
            if not user.get('email'):
                print("⚠️ Skipping user with no email")
                continue
                
            print(f"\n📧 Processing user: {user['email']}")
            
            # Get alerts for this user
            alerts_result = db.client.table('alerts')\
                .select('*')\
                .eq('user_id', user['id'])\
                .execute()
                
            if not alerts_result.data:
                print(f"⚠️ No alerts found for user {user['email']}")
                continue
                
            for alert in alerts_result.data:
                # Skip alerts with invalid price ranges
                if alert.get('min_price') is None or alert.get('max_price') is None:
                    print(f"⚠️ Skipping alert with invalid price range: min={alert.get('min_price')}, max={alert.get('max_price')}")
                    continue
                    
                print(f"Found alert: min_price={alert['min_price']}, max_price={alert['max_price']}, industries={alert.get('industries', [])}")
                
                # Normalize industries in alert
                normalized_industries = [normalize_industry(ind) for ind in alert.get('industries', [])]
                print(f"Normalized industries: {normalized_industries}")
                
                # Get matching listings
                print("🔍 Finding matching listings...")
                listings_result = db.client.table('listings')\
                    .select('*')\
                    .gte('asking_price', alert['min_price'])\
                    .lte('asking_price', alert['max_price'])
                    
                if normalized_industries:
                    listings_result = listings_result.in_('industry', normalized_industries)
                    
                listings_result = listings_result.execute()
                matching_listings = listings_result.data
                
                if not matching_listings:
                    print("ℹ️ No matching listings found for user's criteria")
                    continue
                    
                print(f"✅ Found {len(matching_listings)} matching listings")
                print("Matching listings industries:", [listing['industry'] for listing in matching_listings])
                
                # Send test newsletter
                print("📤 Sending newsletter...")
                result = await newsletter_service.send_newsletter(
                    user={
                        'email': user['email'],
                        'alert': alert
                    },
                    listings=matching_listings
                )
                
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