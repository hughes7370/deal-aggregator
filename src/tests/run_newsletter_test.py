import sys
import os
from pathlib import Path
from dotenv import load_dotenv

# Add the project root directory to Python path
project_root = str(Path(__file__).parent.parent.parent)
sys.path.append(project_root)

# Load environment variables with override
env_path = os.path.join(project_root, '.env')
load_dotenv(env_path, override=True)  # Force override any existing env vars

# Debug: Print source of env vars
env_file = os.path.join(project_root, '.env')
print(f"\n📁 Loading environment from: {env_file}")
if os.path.exists(env_file):
    with open(env_file, 'r') as f:
        print("Environment file contents:")
        for line in f:
            if line.startswith('RESEND'):
                print(f"  {line.strip()}")

from src.services.newsletter_service import NewsletterService
from src.database.supabase_db import SupabaseClient
from datetime import datetime
import asyncio

async def run_test():
    """Run newsletter test with existing data"""
    
    # First verify we have test data
    supabase = SupabaseClient()
    
    try:
        # Get all user preferences
        preferences_result = supabase.client.table('user_preferences')\
            .select('*')\
            .execute()
            
        if not preferences_result.data:
            print("❌ No user preferences found")
            return
            
        print(f"\n📊 Found {len(preferences_result.data)} users with preferences")
        
        # Process each user
        for user_preferences in preferences_result.data:
            try:
                # Get the user data
                user_result = supabase.client.table('users')\
                    .select('*')\
                    .eq('id', user_preferences['user_id'])\
                    .single()\
                    .execute()
                
                if not user_result.data:
                    print(f"⚠️ User not found for preferences {user_preferences['id']}")
                    continue
                    
                test_user = user_result.data
                print(f"\n📧 Processing user: {test_user['email']}")
                print(f"Newsletter frequency: {user_preferences['newsletter_frequency']}")
                
                # Get matching listings for this user
                listings_result = supabase.client.table('listings')\
                    .select('*')\
                    .gte('asking_price', user_preferences['min_price'])\
                    .lte('asking_price', user_preferences['max_price'])\
                    .in_('industry', user_preferences['industries'])\
                    .limit(3)\
                    .execute()
                    
                if not listings_result.data:
                    print(f"ℹ️ No matching listings found for user {test_user['email']}")
                    continue
                    
                print(f"📑 Found {len(listings_result.data)} matching listings")
                
                # Initialize newsletter service with explicit from_email
                newsletter_service = NewsletterService()
                newsletter_service.from_email = os.getenv('RESEND_FROM_EMAIL', 'alerts@dealsight.co')
                
                # Send test newsletter
                print(f"📤 Sending newsletter to {test_user['email']}...")
                print(f"Using from email: {newsletter_service.from_email}")
                email_id = await newsletter_service.send_newsletter(
                    user={
                        'email': test_user['email'],
                        'preferences': user_preferences
                    },
                    listings=listings_result.data
                )
                
                if email_id:
                    print(f"✅ Newsletter sent successfully to {test_user['email']}!")
                    print(f"Email ID: {email_id}")
                else:
                    print(f"❌ Failed to send newsletter to {test_user['email']}")
                
                # Add a small delay between sends to avoid rate limits
                await asyncio.sleep(1)
                
            except Exception as e:
                print(f"❌ Error processing user {user_preferences.get('user_id')}: {str(e)}")
                continue
            
        print("\n✨ Finished processing all users")
            
    except Exception as e:
        print(f"\n❌ Error running test: {e}")
        raise e  # Re-raise to see full traceback

if __name__ == "__main__":
    print("\n🏃 Starting Newsletter Test")
    print("=" * 50)
    print("\n🔍 All RESEND environment variables:")
    for key, value in os.environ.items():
        if key.startswith('RESEND'):
            print(f"{key}: {value}")
    asyncio.run(run_test()) 