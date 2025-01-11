import unittest
from datetime import datetime, timedelta, UTC
import sys
import os
from unittest.mock import patch
from dotenv import load_dotenv

# Add the src directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# Load environment variables from .env
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env'))

from src.services.newsletter_service import NewsletterService

class TestNewsletterService(unittest.TestCase):
    def setUp(self):
        # Use actual environment variables
        self.env_patcher = patch.dict('os.environ', {
            'RESEND_API_KEY': os.getenv('RESEND_API_KEY'),
            'NEXT_PUBLIC_SUPABASE_URL': os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
            'SUPABASE_SERVICE_ROLE_KEY': os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        })
        self.env_patcher.start()

        # Initialize service with real Supabase client
        self.service = NewsletterService()

    def tearDown(self):
        self.env_patcher.stop()

    def test_unbounded_ranges(self):
        # Test data
        alert = {
            'min_business_age': 5,
            'max_business_age': None,  # Unbounded
            'min_number_of_employees': 10,
            'max_number_of_employees': None,  # Unbounded
            'min_revenue': 1000000,
            'max_revenue': None,  # Unbounded
            'min_ebitda': 500000,
            'max_ebitda': None,  # Unbounded
            'min_profit_margin': 20,
            'max_profit_margin': None,  # Unbounded
            'min_selling_multiple': 2,
            'max_selling_multiple': None,  # Unbounded,
            'last_notification_sent': (datetime.now(UTC) - timedelta(days=2)).isoformat()  # 2 days ago
        }

        # Execute
        matches = self.service.get_matching_listings(alert)

        # Assert
        self.assertTrue(len(matches) > 0, "Expected to find at least one matching listing")
        for match in matches:
            self.assertGreaterEqual(match['business_age'], alert['min_business_age'])
            self.assertGreaterEqual(match['number_of_employees'], alert['min_number_of_employees'])
            self.assertGreaterEqual(match['revenue'], alert['min_revenue'])
            self.assertGreaterEqual(match['ebitda'], alert['min_ebitda'])
            self.assertGreaterEqual(match['profit_margin'], alert['min_profit_margin'])
            self.assertGreaterEqual(match['selling_multiple'], alert['min_selling_multiple'])

    def test_keyword_search(self):
        # Test data
        alert = {
            'search_keywords': ['software', 'tech'],
            'search_match_type': 'any',
            'search_in': ['title', 'description'],
            'exclude_keywords': ['hardware'],
            'last_notification_sent': (datetime.now(UTC) - timedelta(days=2)).isoformat()  # 2 days ago
        }

        # Execute
        matches = self.service.get_matching_listings(alert)

        # Assert
        self.assertTrue(len(matches) > 0, "Expected to find at least one matching listing")
        for match in matches:
            # Check if any keyword is present
            has_keyword = any(
                keyword.lower() in match['title'].lower() or 
                keyword.lower() in match['description'].lower() 
                for keyword in alert['search_keywords']
            )
            self.assertTrue(has_keyword, f"Expected to find at least one keyword in listing: {match['title']}")

            # Check excluded keywords
            for excluded in alert['exclude_keywords']:
                self.assertNotIn(excluded.lower(), match['title'].lower())
                self.assertNotIn(excluded.lower(), match['description'].lower())

    def test_combined_filters(self):
        # Test data
        alert = {
            'search_keywords': ['software'],
            'search_match_type': 'any',
            'search_in': ['title', 'description'],
            'exclude_keywords': ['hardware'],
            'min_business_age': 5,
            'max_business_age': 20,
            'min_number_of_employees': 10,
            'max_number_of_employees': 100,
            'min_revenue': 1000000,
            'max_revenue': 10000000,
            'last_notification_sent': (datetime.now(UTC) - timedelta(days=2)).isoformat()  # 2 days ago
        }

        # Execute
        matches = self.service.get_matching_listings(alert)

        # Assert
        self.assertTrue(len(matches) > 0, "Expected to find at least one matching listing")
        for match in matches:
            # Check keyword criteria
            has_keyword = any(
                keyword.lower() in match['title'].lower() or 
                keyword.lower() in match['description'].lower() 
                for keyword in alert['search_keywords']
            )
            self.assertTrue(has_keyword, f"Expected to find keyword in listing: {match['title']}")

            # Check excluded keywords
            for excluded in alert['exclude_keywords']:
                self.assertNotIn(excluded.lower(), match['title'].lower())
                self.assertNotIn(excluded.lower(), match['description'].lower())

            # Check range criteria
            self.assertGreaterEqual(match['business_age'], alert['min_business_age'])
            self.assertLessEqual(match['business_age'], alert['max_business_age'])
            self.assertGreaterEqual(match['number_of_employees'], alert['min_number_of_employees'])
            self.assertLessEqual(match['number_of_employees'], alert['max_number_of_employees'])
            self.assertGreaterEqual(match['revenue'], alert['min_revenue'])
            self.assertLessEqual(match['revenue'], alert['max_revenue'])

if __name__ == '__main__':
    unittest.main() 