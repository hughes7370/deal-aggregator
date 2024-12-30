import sys
import os
from pathlib import Path
from datetime import datetime, timedelta
import pytest
import asyncio
from pytz import UTC

# Add the project root directory to Python path
project_root = str(Path(__file__).parent.parent.parent)
sys.path.append(project_root)

from backend.src.services.newsletter_service import NewsletterService
from backend.src.database.supabase_db import SupabaseClient
from backend.src.services.scheduler_service import SchedulerService

pytestmark = pytest.mark.asyncio  # Mark all tests as async

@pytest.fixture
def newsletter_service():
    return NewsletterService()

@pytest.fixture
def db_client():
    return SupabaseClient()

@pytest.fixture
def scheduler_service():
    return SchedulerService()

@pytest.mark.asyncio
async def test_newsletter_log_creation(newsletter_service, db_client):
    """Test creating a newsletter log entry"""
    print("\n🧪 Testing newsletter log creation...")
    
    try:
        # First get a test user
        user_result = db_client.client.table('users')\
            .select('*')\
            .limit(1)\
            .execute()
            
        if not user_result.data:
            pytest.skip("No test users found in database")
            
        test_user = user_result.data[0]
        print(f"Using test user: {test_user['email']}")
        
        # Create a log entry
        log_id = db_client.create_newsletter_log(test_user['id'])
        assert log_id is not None, "Newsletter log creation failed"
        print(f"✅ Created newsletter log with ID: {log_id}")
        
        # Verify the log entry
        log_result = db_client.client.table('newsletter_logs')\
            .select('*')\
            .eq('id', log_id)\
            .single()\
            .execute()
            
        assert log_result.data is not None, "Could not find created log entry"
        log_entry = log_result.data
        
        assert log_entry['user_id'] == test_user['id']
        assert log_entry['status'] == 'pending'
        assert log_entry['created_at'] is not None
        print("✅ Log entry verified")
        
    except Exception as e:
        print(f"❌ Error in test_newsletter_log_creation: {str(e)}")
        raise

@pytest.mark.asyncio
async def test_scheduled_newsletter(newsletter_service, db_client):
    """Test scheduling and processing a newsletter"""
    print("\n🧪 Testing scheduled newsletter...")
    
    try:
        # First get a test user
        user_result = db_client.client.table('users')\
            .select('*')\
            .limit(1)\
            .execute()
            
        if not user_result.data:
            pytest.skip("No test users found in database")
            
        test_user = user_result.data[0]
        
        # Get user preferences separately
        preferences_result = db_client.client.table('alerts')\
            .select('*')\
            .eq('user_id', test_user['id'])\
            .execute()
            
        if not preferences_result.data:
            pytest.skip("No preferences found for test user")
            
        test_user['preferences'] = preferences_result.data[0]
        print(f"Using test user: {test_user['email']}")
        
        # Schedule a newsletter for 1 minute from now
        scheduled_time = datetime.now(UTC) + timedelta(minutes=1)
        log_id = newsletter_service.schedule_newsletter(test_user['id'], scheduled_time)
        assert log_id is not None, "Failed to schedule newsletter"
        print(f"✅ Scheduled newsletter with ID: {log_id}")
        
        # Verify the scheduled entry
        log_result = db_client.client.table('newsletter_logs')\
            .select('*')\
            .eq('id', log_id)\
            .single()\
            .execute()
            
        assert log_result.data is not None
        assert log_result.data['status'] == 'pending'
        assert log_result.data['scheduled_for'] is not None
        print("✅ Scheduled entry verified")
        
        # Wait for 70 seconds to ensure the scheduled time has passed
        print("Waiting for scheduled time...")
        await asyncio.sleep(70)
        
        # Process scheduled newsletters
        newsletter_service.process_scheduled_newsletters()
        
        # Verify the newsletter was processed
        log_result = db_client.client.table('newsletter_logs')\
            .select('*')\
            .eq('id', log_id)\
            .single()\
            .execute()
            
        assert log_result.data is not None
        assert log_result.data['status'] in ['sent', 'failed', 'skipped']
        print(f"✅ Newsletter processed with status: {log_result.data['status']}")
        
    except Exception as e:
        print(f"❌ Error in test_scheduled_newsletter: {str(e)}")
        raise

@pytest.mark.asyncio
async def test_newsletter_error_handling(newsletter_service, db_client):
    """Test error handling in newsletter sending"""
    print("\n🧪 Testing newsletter error handling...")
    
    try:
        # First get a test user
        user_result = db_client.client.table('users')\
            .select('*')\
            .limit(1)\
            .execute()
            
        if not user_result.data:
            pytest.skip("No test users found in database")
            
        test_user = user_result.data[0]
        
        # Create a log entry with a valid user but no preferences
        # This should cause the newsletter processing to fail
        scheduled_time = datetime.now(UTC) - timedelta(minutes=1)  # Schedule it for 1 minute ago
        log_id = db_client.create_newsletter_log(test_user['id'], scheduled_time)
        assert log_id is not None, "Failed to create test log entry"
        print("✅ Created test log entry")
        
        # Process the newsletter (should fail due to missing preferences)
        newsletter_service.process_scheduled_newsletters()
        
        # Verify the error was logged
        log_result = db_client.client.table('newsletter_logs')\
            .select('*')\
            .eq('id', log_id)\
            .single()\
            .execute()
            
        assert log_result.data is not None
        assert log_result.data['status'] in ['failed', 'skipped'], f"Expected status to be 'failed' or 'skipped', got {log_result.data['status']}"
        if log_result.data['status'] == 'failed':
            assert log_result.data['error_message'] is not None
            print(f"✅ Error properly logged: {log_result.data['error_message']}")
        else:
            assert log_result.data['status'] == 'skipped'
            print("✅ Newsletter properly skipped due to no matching listings")
        
    except Exception as e:
        print(f"❌ Error in test_newsletter_error_handling: {str(e)}")
        raise

@pytest.mark.asyncio
async def test_scheduler_integration(scheduler_service):
    """Test the scheduler's newsletter handling"""
    print("\n🧪 Testing scheduler integration...")
    
    try:
        # First get a test user
        user_result = scheduler_service.db.client.table('users')\
            .select('*')\
            .limit(1)\
            .execute()
            
        if not user_result.data:
            pytest.skip("No test users found in database")
            
        test_user = user_result.data[0]
        
        # Get user preferences separately
        preferences_result = scheduler_service.db.client.table('alerts')\
            .select('*')\
            .eq('user_id', test_user['id'])\
            .execute()
            
        if not preferences_result.data:
            pytest.skip("No preferences found for test user")
            
        # Create a test newsletter log with scheduled_for time
        scheduled_time = datetime.now(UTC) + timedelta(minutes=1)
        log_id = scheduler_service.db.create_newsletter_log(
            test_user['id'],
            scheduled_for=scheduled_time
        )
        assert log_id is not None
        print(f"✅ Created test newsletter log")
        
        # Process newsletters through the scheduler
        scheduler_service.process_newsletters()
        
        # Verify the newsletter was scheduled
        log_result = scheduler_service.db.client.table('newsletter_logs')\
            .select('*')\
            .eq('id', log_id)\
            .single()\
            .execute()
            
        assert log_result.data is not None
        assert log_result.data['scheduled_for'] is not None
        scheduled_time = datetime.fromisoformat(log_result.data['scheduled_for'].replace('Z', '+00:00'))
        assert scheduled_time > datetime.now(UTC)
        print(f"✅ Newsletter scheduled for: {scheduled_time}")
        
    except Exception as e:
        print(f"❌ Error in test_scheduler_integration: {str(e)}")
        raise

if __name__ == "__main__":
    print("\n🚀 Starting Newsletter System Tests")
    print("=" * 50)
    
    # Verify environment variables
    required_vars = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'RESEND_API_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"  - {var}")
        exit(1)
    
    # Run the tests
    asyncio.run(test_newsletter_log_creation(NewsletterService(), SupabaseClient()))
    asyncio.run(test_scheduled_newsletter(NewsletterService(), SupabaseClient()))
    asyncio.run(test_newsletter_error_handling(NewsletterService(), SupabaseClient()))
    asyncio.run(test_scheduler_integration(SchedulerService())) 