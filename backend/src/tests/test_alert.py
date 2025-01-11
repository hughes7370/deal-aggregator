import sys
import os
from datetime import datetime, timedelta, UTC
from dotenv import load_dotenv

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

# Load environment variables from .env
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env'))

from src.services.newsletter_service import NewsletterService
from src.database.supabase_db import SupabaseClient

def test_specific_alert():
    # Initialize Supabase client
    db = SupabaseClient()
    
    # Initialize NewsletterService
    service = NewsletterService()
    
    # Update alert's last_notification_sent to 2 days ago
    alert_id = '5fbab0f5-d6be-4e1e-98c8-11f641fc4533'
    two_days_ago = datetime.now(UTC) - timedelta(days=2)
    db.client.table('alerts').update({'last_notification_sent': two_days_ago.isoformat()}).eq('id', alert_id).execute()
    
    # Get alert and user data
    alert_result = db.client.table('alerts').select('*').eq('id', alert_id).execute()
    if not alert_result.data:
        print(f"Alert not found with ID: {alert_id}")
        return
    
    alert = alert_result.data[0]
    user_result = db.client.table('users').select('*').eq('id', alert['user_id']).execute()
    if not user_result.data:
        print(f"User not found with ID: {alert['user_id']}")
        return
    
    user = user_result.data[0]
    
    print(f"\n📧 Processing alert '{alert['name']}' for user: {user['email']}")
    
    print("\nAlert search criteria:")
    print(f"- Keywords: {alert.get('search_keywords', [])}")
    print(f"- Match type: {alert.get('search_match_type', 'any')}")
    print(f"- Search in: {alert.get('search_in', ['title', 'description'])}")
    print(f"- Exclude: {alert.get('exclude_keywords', [])}")
    print(f"- Industries: {alert.get('industries', [])}")
    
    # Process alert and send email
    matches = service.get_matching_listings(alert)
    exact_matches = matches.get('exact_matches', [])
    other_matches = matches.get('other_matches', [])
    
    print(f"\nFound {len(exact_matches)} exact matches and {len(other_matches)} other matches")
    
    if exact_matches or other_matches:
        email_result = service.send_newsletter({'email': user['email'], 'alert': alert}, matches)
        if email_result:
            print(f"\nEmail sent successfully! Resend API response ID: {email_result}")
        else:
            print("\nFailed to send email")
    else:
        print("\nNo matches found, email not sent")

if __name__ == '__main__':
    test_specific_alert() 