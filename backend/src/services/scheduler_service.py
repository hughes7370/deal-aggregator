import os
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from pytz import UTC
from typing import List, Dict
import asyncio
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
        """Process newsletters for all users"""
        try:
            # Run the newsletter sending
            self.newsletter_service.send_personalized_newsletters()
                
        except Exception as e:
            print(f"Error processing newsletters: {str(e)}")
            
    def start(self):
        self.setup_jobs()
        self.scheduler.start()

if __name__ == "__main__":
    scheduler = SchedulerService()
    scheduler.start() 