from backend.src.services.newsletter_service import NewsletterService
from dotenv import load_dotenv
import asyncio

async def test_filters():
    """Test different filtering scenarios"""
    load_dotenv()
    
    newsletter_service = NewsletterService()
    
    # Test cases
    test_cases = [
        {
            "name": "Basic Price Range",
            "preferences": {
                "min_price": 1,
                "max_price": 100000,
                "industries": None
            }
        },
        {
            "name": "Wide Price Range",
            "preferences": {
                "min_price": 1,
                "max_price": 100000000,
                "industries": None
            }
        },
        {
            "name": "No Price Limits",
            "preferences": {
                "min_price": None,
                "max_price": None,
                "industries": None
            }
        }
    ]
    
    for case in test_cases:
        print(f"\n\n🧪 Testing: {case['name']}")
        print("=" * 50)
        
        listings = newsletter_service.get_matching_listings(case['preferences'])
        
        print(f"\nResults Summary:")
        print(f"Total matches: {len(listings)}")
        if listings:
            print("\nFirst 3 matches:")
            for listing in listings[:3]:
                print(f"\nTitle: {listing['title']}")
                print(f"Price: ${listing.get('asking_price', 0):,}")
                print(f"Industry: {listing.get('industry', 'Not specified')}")

if __name__ == "__main__":
    asyncio.run(test_filters()) 