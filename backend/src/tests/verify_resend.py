import os
import requests
from dotenv import load_dotenv

def verify_resend_api():
    """Verify Resend API credentials and connectivity"""
    load_dotenv()
    
    api_key = os.getenv('RESEND_API_KEY')
    from_email = os.getenv('RESEND_FROM_EMAIL', 'onboarding@resend.dev')
    
    print("\n🔍 Verifying Resend API Setup")
    print("=" * 50)
    
    # Check API key
    print(f"\nAPI Key: {'✅ Found' if api_key else '❌ Missing'}")
    if api_key:
        print(f"API Key Format: {api_key[:8]}...")
    
    # Check From Email
    print(f"From Email: {from_email}")
    
    # Test API connection
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    
    data = {
        "from": from_email,
        "to": "hughes7370@gmail.com",
        "subject": "API Test",
        "html": "<p>This is a test email to verify API connectivity.</p>"
    }
    
    try:
        print("\n📡 Testing API Connection...")
        response = requests.post('https://api.resend.com/emails', 
                               json=data, 
                               headers=headers)
        
        print(f"\nResponse Status: {response.status_code}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 200:
            print("\n✅ Resend API is working correctly!")
        else:
            print("\n❌ API test failed")
            
    except Exception as e:
        print(f"\n❌ Connection Error: {e}")

if __name__ == "__main__":
    verify_resend_api() 