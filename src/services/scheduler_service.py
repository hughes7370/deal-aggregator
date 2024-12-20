import os
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from pytz import UTC
from typing import List, Dict
from ..database.supabase_db import SupabaseClient
from .newsletter_service import NewsletterService

class SchedulerService:
    def __init__(self):
        self.db = SupabaseClient()
        self.newsletter_service = NewsletterService()
        self.scheduler = BackgroundScheduler(timezone=UTC)
        
    def setup_jobs(self):
        # Run scraper daily at 1 AM UTC
        self.scheduler.add_job(
            self.run_scraper,
            CronTrigger(hour=1, minute=0)
        )
        
        # Check for newsletters every hour
        self.scheduler.add_job(
            self.process_newsletters,
            CronTrigger(minute=0)
        )
        
    def run_scraper(self):
        try:
            # Import and run main scraper
            from ...main import run_scrapers
            run_scrapers()
        except Exception as e:
            print(f"Error running scraper: {str(e)}")
            
    def process_newsletters(self):
        try:
            # Get all users with their preferences
            users = self.db.get_users_for_newsletter()
            
            for user in users:
                self.process_user_newsletter(user)
                
        except Exception as e:
            print(f"Error processing newsletters: {str(e)}")
            
    def process_user_newsletter(self, user: Dict):
        frequency = user['newsletter_frequency']
        last_sent = user['last_notification_sent']
        
        if self.should_send_newsletter(frequency, last_sent):
            # Get filtered listings based on user preferences
            listings = self.get_filtered_listings(user)
            
            if listings:
                # Send newsletter
                self.newsletter_service.send_newsletter(user, listings)
                
                # Log the newsletter
                self.log_newsletter(user['user_id'])
                
                # Update last notification sent
                self.db.update_last_notification_sent(user['user_id'])
    
    def should_send_newsletter(self, frequency: str, last_sent: datetime) -> bool:
        if not last_sent:
            return True
            
        now = datetime.now(UTC)
        time_diff = now - last_sent
        
        if frequency == 'daily':
            return time_diff.days >= 1
        elif frequency == 'weekly':
            return time_diff.days >= 7
        elif frequency == 'monthly':
            return time_diff.days >= 30
        return False
        
    def get_filtered_listings(self, user: Dict) -> List[Dict]:
        return self.db.get_filtered_listings(
            min_price=user['min_price'],
            max_price=user['max_price'],
            industries=user['industries'],
            last_sent=user['last_notification_sent']
        )
        
    def log_newsletter(self, user_id: str):
        self.db.insert_newsletter_log({
            'user_id': user_id,
            'status': 'sent',
            'sent_at': datetime.now(UTC)
        })
        
    def start(self):
        self.setup_jobs()
        self.scheduler.start()

if __name__ == "__main__":
    scheduler = SchedulerService()
    scheduler.start() 