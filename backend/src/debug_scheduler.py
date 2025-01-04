import os
from dotenv import load_dotenv
import sys
from datetime import datetime, timedelta, UTC
import time

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from backend.src.services.scheduler_service import SchedulerService
from backend.src.database.supabase_db import SupabaseClient

print("\n🔍 Starting Scheduler Service Debug\n")

try:
    # Load environment variables from .env file
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
    load_dotenv(env_path)
    
    # Initialize SupabaseClient and SchedulerService
    db = SupabaseClient()
    scheduler = SchedulerService()
    
    print("📅 Testing newsletter scheduling...")
    
    # Force schedule newsletters now
    print("\nForcing newsletter scheduling...")
    scheduler.schedule_newsletters()
    
    # Check newsletter logs right after scheduling
    print("\n📬 Checking newsletter logs after scheduling...")
    result = db.client.table('newsletter_logs').select('*').order('created_at', desc=True).limit(10).execute()
    if result.data:
        print("\nRecent newsletter logs:")
        for log in result.data:
            print(f"\nLog ID: {log.get('id')}")
            print(f"Status: {log.get('status')}")
            print(f"Created: {log.get('created_at')}")
            print(f"Scheduled For: {log.get('scheduled_for')}")
            print(f"Sent At: {log.get('sent_at')}")
            print(f"User ID: {log.get('user_id')}")
            print(f"Alert ID: {log.get('alert_id')}")
            if log.get('error'):
                print(f"Error: {log.get('error')}")
    else:
        print("No newsletter logs found")
    
    # Process scheduled newsletters
    print("\n📤 Processing scheduled newsletters...")
    scheduler.process_newsletters()
    
    # Check newsletter logs after processing
    print("\n📬 Checking newsletter logs after processing...")
    result = db.client.table('newsletter_logs').select('*').order('created_at', desc=True).limit(10).execute()
    if result.data:
        print("\nRecent newsletter logs:")
        for log in result.data:
            print(f"\nLog ID: {log.get('id')}")
            print(f"Status: {log.get('status')}")
            print(f"Created: {log.get('created_at')}")
            print(f"Scheduled For: {log.get('scheduled_for')}")
            print(f"Sent At: {log.get('sent_at')}")
            print(f"User ID: {log.get('user_id')}")
            print(f"Alert ID: {log.get('alert_id')}")
            if log.get('error'):
                print(f"Error: {log.get('error')}")
    
    # Check alerts last_notification_sent timestamps
    print("\n🕒 Checking alert last_notification_sent timestamps...")
    alerts_result = db.client.table('alerts').select('*').execute()
    if alerts_result.data:
        print("\nAlert timestamps:")
        for alert in alerts_result.data:
            print(f"\nAlert ID: {alert.get('id')}")
            print(f"Name: {alert.get('name')}")
            print(f"Last Notification: {alert.get('last_notification_sent')}")
    else:
        print("No alerts found")

except Exception as e:
    print(f"Error: {str(e)}")

if __name__ == "__main__":
    pass 