from backend.src.services.newsletter_service import NewsletterService
from dotenv import load_dotenv
import asyncio

async def test_preferences():
    """Test different preference combinations"""
    load_dotenv()
    
    newsletter_service = NewsletterService()
    
    test_cases = [
        {
            "name": "All Listings (No Filters)",
            "preferences": {
                "min_price": None,
                "max_price": None,
                "industries": None
            }
        },
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
            "name": "Invalid Price Values",
            "preferences": {
                "min_price": "invalid",
                "max_price": "also invalid",
                "industries": None
            }
        },
        {
            "name": "String Numbers",
            "preferences": {
                "min_price": "1000",
                "max_price": "5000000",
                "industries": None
            }
        },
        {
            "name": "Formatted Numbers",
            "preferences": {
                "min_price": "1,000",
                "max_price": "5,000,000",
                "industries": None
            }
        }
    ]
    
    for case in test_cases:
        print(f"\n\n🧪 Testing: {case['name']}")
        print("=" * 50)
        print(f"Preferences: {case['preferences']}")
        
        try:
            listings = newsletter_service.get_matching_listings(case['preferences'])
            print(f"✅ Success! Matched {len(listings)} listings")
            if listings:
                print("\nSample matches:")
                for listing in listings[:3]:  # Show first 3 matches
                    print(f"- {listing.get('title', 'Untitled')}: ${listing.get('asking_price', 0):,}")
        except Exception as e:
            print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_preferences()) 