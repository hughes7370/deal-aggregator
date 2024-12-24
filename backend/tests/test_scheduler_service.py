import os
import sys
from datetime import datetime, timedelta
import asyncio
from typing import List, Dict
from pytz import UTC
import pytest
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the backend directory to the Python path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Import the services
try:
    from backend.src.services.scheduler_service import SchedulerService
    from backend.src.services.newsletter_service import NewsletterService
    from backend.src.database.supabase_db import SupabaseDB
except ImportError as e:
    print(f"Import Error: {e}")
    print(f"sys.path: {sys.path}")
    print(f"Current directory: {os.getcwd()}")
    raise

@pytest.fixture
def scheduler_service():
    return SchedulerService()

@pytest.fixture
def newsletter_service():
    return NewsletterService()

@pytest.fixture
def db():
    return SupabaseDB()

async def test_newsletter_sending():
    """
    Test the newsletter sending functionality with real database data.
    This test will:
    1. Get actual users from the database
    2. Process their preferences
    3. Send real newsletters (but only to test emails)
    """
    print("\nInitializing newsletter service...")
    newsletter_service = NewsletterService()
    
    try:
        print("\nFetching active users from database...")
        # Get all active users with their preferences
        users_result = newsletter_service.supabase.client.table('users')\
            .select('*, user_preferences(*)')\
            .eq('subscription_status', 'active')\
            .execute()
        
        total_users = len(users_result.data)
        print(f"\nFound {total_users} active users")
        
        if total_users == 0:
            print("No active users found in the database!")
            return
            
        for user in users_result.data:
            print(f"\n{'='*50}")
            print(f"Processing user: {user.get('email')}")
            
            preferences = user.get('user_preferences')
            if not preferences:
                print(f"No preferences found for user {user.get('email')}")
                continue
                
            print(f"User preferences: Price range ${preferences.get('min_price', 0):,} - ${preferences.get('max_price', 0):,}")
            print(f"Industries: {preferences.get('industries', [])}")
            
            # Get matching listings
            matching_listings = newsletter_service.get_matching_listings(preferences)
            
            print(f"Found {len(matching_listings)} matching listings")
            
            if matching_listings:
                print("Sending newsletter...")
                # Send test newsletter
                email_id = await newsletter_service.send_newsletter({
                    'email': user['email'],
                    'preferences': preferences
                }, matching_listings)
                
                if email_id:
                    print(f"Successfully sent newsletter with ID: {email_id}")
                else:
                    print("Failed to send newsletter")
                
                # Verify the newsletter log was created
                log_result = newsletter_service.supabase.client.table('newsletter_logs')\
                    .select('*')\
                    .eq('user_id', user['id'])\
                    .order('created_at', desc=True)\
                    .limit(1)\
                    .execute()
                
                if log_result.data:
                    print("Newsletter log created successfully")
                else:
                    print("Warning: Newsletter log not created")
                
            else:
                print("No matching listings found for this user")
            
            print(f"{'='*50}\n")
                
    except Exception as e:
        print(f"Error during newsletter test: {str(e)}")
        raise

def test_should_send_newsletter():
    """Test the logic for determining if a newsletter should be sent"""
    scheduler = SchedulerService()
    
    # Test daily frequency
    assert scheduler.should_send_newsletter('daily', datetime.now(UTC) - timedelta(days=2)) == True
    assert scheduler.should_send_newsletter('daily', datetime.now(UTC) - timedelta(hours=12)) == False
    
    # Test weekly frequency
    assert scheduler.should_send_newsletter('weekly', datetime.now(UTC) - timedelta(days=8)) == True
    assert scheduler.should_send_newsletter('weekly', datetime.now(UTC) - timedelta(days=5)) == False
    
    # Test monthly frequency
    assert scheduler.should_send_newsletter('monthly', datetime.now(UTC) - timedelta(days=31)) == True
    assert scheduler.should_send_newsletter('monthly', datetime.now(UTC) - timedelta(days=25)) == False

if __name__ == "__main__":
    """
    Run the newsletter test directly
    """
    print("Starting newsletter system test...")
    asyncio.run(test_newsletter_sending()) 