from backend.src.database.supabase_db import SupabaseClient
from datetime import datetime

def verify_test_data():
    """Verify test data exists and print summary"""
    supabase = SupabaseClient()
    
    try:
        # Check users
        users = supabase.client.table('users')\
            .select('*, user_preferences(*)')\
            .execute()
        
        print("\n📊 Test Data Summary:")
        print("=" * 50)
        
        # Print users and their preferences
        print("\n👤 Users:")
        for user in users.data:
            print(f"\nEmail: {user['email']}")
            print(f"Status: {user['subscription_status']}")
            
            prefs = user.get('user_preferences', {})
            if prefs:
                print("Preferences:")
                print(f"- Price Range: ${prefs.get('min_price', 0):,} - ${prefs.get('max_price', 0):,}")
                print(f"- Industries: {prefs.get('industries', 'All')}")
        
        # Check listings
        listings = supabase.client.table('listings')\
            .select('*')\
            .execute()
            
        print(f"\n📑 Listings: {len(listings.data)} total")
        if listings.data:
            print("\nSample Listings:")
            for listing in listings.data[:3]:  # Show first 3
                print(f"\nTitle: {listing['title']}")
                print(f"Price: ${listing.get('asking_price', 0):,}")
                print(f"Industry: {listing.get('industry', 'Not specified')}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error verifying test data: {e}")
        return False

if __name__ == "__main__":
    verify_test_data() 