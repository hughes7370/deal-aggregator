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
        
        # Schedule instant alerts one hour after scraping
        self.scheduler.add_job(
            self.process_instant_alerts,
            CronTrigger(hour=2, minute=0)
        )
        
        # Check for regular newsletters every hour
        self.scheduler.add_job(
            self.process_newsletters,
            CronTrigger(minute=0)
        )
        
    def run_scraper(self):
        try:
            # Import and run main scraper
            from ...main import run_scrapers
            run_scrapers()
            print("✅ Scraper completed, instant alerts will be processed in one hour")
        except Exception as e:
            print(f"Error running scraper: {str(e)}")

    def process_instant_alerts(self):
        """Process instant alerts after new listings are scraped"""
        try:
            # Get all instant alerts
            alerts_result = self.db.client.table('alerts')\
                .select('*, users!inner(*)')\
                .eq('newsletter_frequency', 'instantly')\
                .execute()

            if not alerts_result.data:
                print("No instant alerts found")
                return

            print(f"Processing {len(alerts_result.data)} instant alerts")
            
            for alert in alerts_result.data:
                try:
                    # Schedule the alert to be sent
                    next_schedule = datetime.now(UTC) + timedelta(minutes=5)
                    self.newsletter_service.schedule_newsletter(
                        alert['user_id'],
                        next_schedule,
                        alert_id=alert['id']
                    )
                except Exception as e:
                    print(f"Error scheduling instant alert {alert.get('id')}: {str(e)}")
                    continue

        except Exception as e:
            print(f"Error processing instant alerts: {str(e)}")
            
    def should_send_newsletter(self, frequency: str, last_sent: str = None) -> bool:
        """Determine if a newsletter should be sent based on frequency and last send time"""
        if not last_sent:
            return True
        
        try:
            last_sent_dt = datetime.fromisoformat(last_sent.replace('Z', '+00:00'))
            now = datetime.now(UTC)
            
            if frequency == 'instantly':
                # Instant alerts are handled separately
                return False
            elif frequency == 'daily':
                # Send if last sent was more than 20 hours ago
                return (now - last_sent_dt) > timedelta(hours=20)
            elif frequency == 'weekly':
                # Send if last sent was more than 6 days ago
                return (now - last_sent_dt) > timedelta(days=6)
            else:  # monthly
                # Send if last sent was more than 27 days ago
                return (now - last_sent_dt) > timedelta(days=27)
            
        except Exception as e:
            print(f"Error checking newsletter schedule: {e}")
            return False

    def process_newsletters(self):
        """Process newsletters for all users"""
        try:
            print("Processing newsletters...")
            
            # Get all users with alerts
            users_result = self.db.client.table('users')\
                .select('*')\
                .execute()
                
            if not users_result.data:
                print("No users found")
                return
                
            for user in users_result.data:
                try:
                    # Get user's alerts
                    alerts_result = self.db.client.table('alerts')\
                        .select('*')\
                        .eq('user_id', user['id'])\
                        .execute()
                        
                    if not alerts_result.data:
                        print(f"No alerts found for user {user['id']}")
                        continue
                        
                    for alert in alerts_result.data:
                        try:
                            # Calculate next send time based on frequency
                            frequency = alert.get('newsletter_frequency', 'daily')
                            last_sent = alert.get('last_notification_sent')
                            
                            if last_sent:
                                last_sent = datetime.fromisoformat(last_sent.replace('Z', '+00:00'))
                                
                                # Check if it's time to send based on frequency
                                if frequency == 'daily':
                                    next_send = last_sent + timedelta(days=1)
                                elif frequency == 'weekly':
                                    next_send = last_sent + timedelta(days=7)
                                else:  # monthly
                                    next_send = last_sent + timedelta(days=30)
                                    
                                if datetime.now(UTC) < next_send:
                                    print(f"Skipping alert {alert['id']}, next send at {next_send}")
                                    continue
                            
                            # Schedule newsletter
                            scheduled_time = datetime.now(UTC) + timedelta(minutes=1)
                            self.newsletter_service.schedule_newsletter(
                                user_id=user['id'],
                                scheduled_for=scheduled_time
                            )
                            print(f"Scheduled newsletter for user {user['id']}")
                            
                        except Exception as e:
                            print(f"Error processing alert {alert['id']}: {str(e)}")
                            continue
                            
                except Exception as e:
                    print(f"Error processing user {user['id']}: {str(e)}")
                    continue
                    
        except Exception as e:
            print(f"Error in process_newsletters: {str(e)}")
            raise

    def calculate_next_schedule(self, frequency: str) -> datetime:
        """Calculate the next schedule time based on frequency"""
        now = datetime.now(UTC)
        
        if frequency == 'instantly':
            # Schedule instant alerts for 5 minutes from now
            next_time = now + timedelta(minutes=5)
        elif frequency == 'daily':
            # Schedule for tomorrow at 9 AM UTC
            next_time = (now + timedelta(days=1)).replace(hour=9, minute=0, second=0, microsecond=0)
        elif frequency == 'weekly':
            # Schedule for next week at 9 AM UTC
            next_time = (now + timedelta(days=7)).replace(hour=9, minute=0, second=0, microsecond=0)
        else:  # monthly
            # Schedule for next month at 9 AM UTC
            if now.month == 12:
                next_time = now.replace(year=now.year + 1, month=1, day=1, hour=9, minute=0, second=0, microsecond=0)
            else:
                next_time = now.replace(month=now.month + 1, day=1, hour=9, minute=0, second=0, microsecond=0)
                
        return next_time

    def matches_user_preferences(self, listing: Dict, alert: Dict) -> bool:
        """Check if a listing matches alert criteria"""
        try:
            # Check price range
            if alert.get('min_price') and listing['asking_price'] < alert['min_price']:
                return False
            if alert.get('max_price') and listing['asking_price'] > alert['max_price']:
                return False
                
            # Check industries
            if alert.get('industries'):
                user_industries = [ind.strip().lower() for ind in alert['industries']]
                if listing.get('industry', '').lower() not in user_industries:
                    return False
                    
            return True
            
        except Exception as e:
            print(f"Error matching preferences: {str(e)}")
            return False

    def start(self):
        self.setup_jobs()
        self.scheduler.start()

if __name__ == "__main__":
    scheduler = SchedulerService()
    scheduler.start() 