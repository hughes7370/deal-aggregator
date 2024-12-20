import os
import sys
from datetime import datetime
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from src.database.supabase_db import SupabaseClient

def test_user_flow():
    """Test the user signup and preferences flow"""
    
    supabase = SupabaseClient()
    
    # Test data
    test_user = {
        'id': 'test_user_' + datetime.now().strftime('%Y%m%d_%H%M%S'),
        'email': 'test@example.com',
        'subscription_status': 'active',
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat()
    }
    
    test_preferences = {
        'user_id': test_user['id'],
        'min_price': 100000,
        'max_price': 1000000,
        'industries': ['SaaS', 'eCommerce'],
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat()
    }
    
    try:
        print("\n🚀 Starting user flow test...")
        
        # 1. Create user
        print("\n1. Creating test user...")
        user_result = supabase.client.table('users').insert(test_user).execute()
        
        if user_result.data:
            print("✅ User created successfully")
            print(f"User ID: {test_user['id']}")
        else:
            raise Exception("Failed to create user")
            
        # 2. Create user preferences
        print("\n2. Creating user preferences...")
        pref_result = supabase.client.table('user_preferences').insert(test_preferences).execute()
        
        if pref_result.data:
            print("✅ Preferences saved successfully")
            print(f"Preferences ID: {pref_result.data[0]['id']}")
        else:
            raise Exception("Failed to create preferences")
            
        # 3. Verify user preferences
        print("\n3. Verifying user preferences...")
        stored_prefs = supabase.get_user_preferences(test_user['id'])
        
        if stored_prefs:
            print("✅ Preferences retrieved successfully")
            print("Stored preferences:", stored_prefs)
        else:
            raise Exception("Failed to retrieve preferences")
            
        print("\n✨ All tests passed successfully!")
        
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        raise
    finally:
        # Cleanup
        print("\n🧹 Cleaning up test data...")
        try:
            # Delete preferences first due to foreign key constraint
            supabase.client.table('user_preferences').delete().eq('user_id', test_user['id']).execute()
            supabase.client.table('users').delete().eq('id', test_user['id']).execute()
            print("✅ Test data cleaned up successfully")
        except Exception as e:
            print(f"Warning: Cleanup failed: {str(e)}")

if __name__ == "__main__":
    test_user_flow() 