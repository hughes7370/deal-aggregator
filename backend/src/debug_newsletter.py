import os
from dotenv import load_dotenv
import sys

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from backend.src.services.newsletter_service import NewsletterService
from backend.src.database.supabase_db import SupabaseClient
from datetime import datetime, UTC
import json

print("\n🔍 Starting Newsletter Service Debug\n")

try:
    # Load environment variables from .env file
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
    load_dotenv(env_path)
    
    # Initialize SupabaseClient
    db = SupabaseClient()
    
    # Get all unique industries
    result = db.client.table('listings').select('industry').execute()
    industries = set(item['industry'] for item in result.data if item['industry'])
    print("\n📊 Unique industries in database:")
    for industry in sorted(industries):
        print(f"- {industry}")
    print()
    
    # Get all alerts to test
    alerts_result = db.client.table('alerts').select('*, users!inner(*)').execute()
    alerts = alerts_result.data
    
    print(f"📋 Found {len(alerts)} alerts to test\n")
    
    # Initialize NewsletterService in debug mode
    newsletter_service = NewsletterService()
    
    # Test each alert
    for alert in alerts:
        print(f"\n🔍 Testing alert: {alert['name']}")
        print(f"Alert ID: {alert['id']}")
        print(f"User ID: {alert['user_id']}")
        print(f"User Email: {alert['users']['email']}\n")
        
        print("Alert criteria:")
        print(json.dumps(alert, indent=2))
        print()
        
        # Get total number of listings
        listings_result = db.client.table('listings').select('*', count='exact').execute()
        total_listings = len(listings_result.data)
        print(f"Total listings in database: {total_listings}\n")
        
        # Get matching listings
        print("Searching for matching listings...")
        matching_listings = newsletter_service.get_matching_listings(alert)
        
        print(f"\nMatching listings found: {len(matching_listings)}")
        if matching_listings:
            print("\nFirst matching listing:")
            print(json.dumps(matching_listings[0], indent=2))
            
            # Test email generation
            print("\nTesting email generation...")
            try:
                user_data = {'email': alert['users']['email'], 'alert': alert}
                email_content = newsletter_service.generate_html_content(user_data, matching_listings)
                print("✅ Email content generated successfully")
                print(f"Email content length: {len(email_content)} characters")
            except Exception as e:
                print(f"❌ Error generating email content: {str(e)}")
            
            # Check if RESEND_API_KEY is set
            resend_api_key = os.getenv('RESEND_API_KEY')
            print(f"\nRESEND_API_KEY present: {'Yes' if resend_api_key else 'No'}")
            
            # Test newsletter sending
            print("\nTesting newsletter sending...")
            try:
                email_id = newsletter_service.send_newsletter(
                    user={'email': alert['users']['email'], 'alert': alert},
                    listings=matching_listings
                )
                if email_id:
                    print(f"✅ Newsletter would be sent successfully (debug mode)")
                else:
                    print("❌ Newsletter sending failed")
            except Exception as e:
                print(f"❌ Error sending newsletter: {str(e)}")
        else:
            print("No matching listings found for this alert")
            
except Exception as e:
    print(f"Error: {str(e)}")

if __name__ == "__main__":
    print("\n📬 Checking recent newsletter logs...")
    result = db.client.table('newsletter_logs').select('*').order('created_at', desc=True).limit(10).execute()
    if result.data:
        print("\nRecent newsletter logs:")
        for log in result.data:
            print(f"\nLog ID: {log.get('id')}")
            print(f"Status: {log.get('status')}")
            print(f"Created: {log.get('created_at')}")
            print(f"User ID: {log.get('user_id')}")
            print(f"Alert ID: {log.get('alert_id')}")
            if log.get('error'):
                print(f"Error: {log.get('error')}")
    else:
        print("No newsletter logs found") 