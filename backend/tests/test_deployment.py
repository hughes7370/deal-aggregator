import os
import sys
import requests
from dotenv import load_dotenv
import time
from requests.exceptions import ConnectionError, RequestException

# Load environment variables
load_dotenv()

# Base URL for local testing
BASE_URL = "http://localhost:5000"
MAX_RETRIES = 3
RETRY_DELAY = 2

def wait_for_service(url, max_retries=MAX_RETRIES, delay=RETRY_DELAY):
    """Wait for service to be available"""
    for i in range(max_retries):
        try:
            response = requests.get(url)
            if response.status_code == 200:
                print("✅ Service is up and running")
                return True
        except ConnectionError:
            print(f"⏳ Waiting for service to start (attempt {i+1}/{max_retries})...")
            time.sleep(delay)
    return False

def test_health_endpoint():
    """Test the health check endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        data = response.json()
        assert data['status'] == 'healthy', f"Expected status 'healthy', got {data.get('status')}"
        assert data['scheduler_running'] == True, "Scheduler is not running"
        print("✅ Health check endpoint working")
    except Exception as e:
        print(f"❌ Health check failed: {str(e)}")
        raise

def test_scraper_endpoint():
    """Test the scraper endpoint"""
    try:
        response = requests.post(f"{BASE_URL}/test/scraper")
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        data = response.json()
        assert data['status'] == 'success', f"Expected status 'success', got {data.get('status')}"
        print("✅ Scraper endpoint working")
    except Exception as e:
        print(f"❌ Scraper test failed: {str(e)}")
        raise

def test_newsletter_endpoint():
    """Test the newsletter endpoint"""
    try:
        response = requests.post(f"{BASE_URL}/test/newsletter")
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        data = response.json()
        assert data['status'] == 'success', f"Expected status 'success', got {data.get('status')}"
        print("✅ Newsletter endpoint working")
    except Exception as e:
        print(f"❌ Newsletter test failed: {str(e)}")
        raise

def main():
    """Run all tests"""
    print("\n🚀 Starting deployment tests...")
    
    # Wait for service to be available
    if not wait_for_service(f"{BASE_URL}/health"):
        print("❌ Service failed to start")
        sys.exit(1)
    
    try:
        test_health_endpoint()
        test_scraper_endpoint()
        test_newsletter_endpoint()
        print("\n✨ All tests passed!")
        
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        # Print the current container logs
        print("\n📋 Container logs:")
        os.system("docker-compose logs --tail=50")
        sys.exit(1)

if __name__ == "__main__":
    main() 