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
        
        # Schedule newsletters at 9 AM UTC
        self.scheduler.add_job(
            self.schedule_newsletters,
            CronTrigger(hour=9, minute=0)
        )
        
        # Process scheduled newsletters every 15 minutes
        self.scheduler.add_job(
            self.process_newsletters,
            CronTrigger(minute='*/15')
        )
        
    def run_scraper(self):
        try:
            print("🔄 Starting scraper run...")
            # Use absolute import instead of relative
            from backend.main import run_scrapers
            run_scrapers()
            print("✅ Scraper completed, instant alerts will be processed in one hour")
        except ImportError as e:
            print(f"❌ Error importing scraper module: {str(e)}")
            print(f"Current PYTHONPATH: {os.environ.get('PYTHONPATH', 'Not set')}")
            raise
        except Exception as e:
            print(f"❌ Error running scraper: {str(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            raise

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
            # Ensure UTC timezone for comparison
            last_sent_dt = datetime.fromisoformat(last_sent.replace('Z', '+00:00'))
            if last_sent_dt.tzinfo is None:
                last_sent_dt = last_sent_dt.replace(tzinfo=UTC)
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

    def schedule_newsletters(self):
        """Schedule newsletters for all users"""
        try:
            print("\n📅 Starting newsletter scheduling process...")
            
            # Get all users with alerts
            users_result = self.db.client.table('users')\
                .select('*')\
                .execute()
                
            if not users_result.data:
                print("❌ No users found in database")
                return
                
            print(f"Found {len(users_result.data)} users to process")
                
            for user in users_result.data:
                try:
                    print(f"\n👤 Processing user: {user.get('email', user['id'])}")
                    
                    # Get user's alerts
                    alerts_result = self.db.client.table('alerts')\
                        .select('*')\
                        .eq('user_id', user['id'])\
                        .execute()
                        
                    if not alerts_result.data:
                        print(f"⚠️ No alerts found for user {user['id']}")
                        continue
                        
                    print(f"Found {len(alerts_result.data)} alerts for user")
                        
                    for alert in alerts_result.data:
                        try:
                            print(f"\n🔔 Processing alert: {alert.get('name', alert['id'])}")
                            print(f"Alert settings:")
                            print(f"- Frequency: {alert.get('newsletter_frequency', 'daily')}")
                            print(f"- Industries: {alert.get('industries', [])}")
                            
                            # Format price range
                            try:
                                min_price = int(alert.get('min_price', 0))
                                max_price = alert.get('max_price')
                                max_price_str = f"${int(max_price):,}" if max_price is not None else "unlimited"
                                print(f"- Price range: ${min_price:,} - {max_price_str}")
                            except (TypeError, ValueError):
                                print("- Price range: Not specified")
                            
                            print(f"- Last sent: {alert.get('last_notification_sent', 'Never')}")
                            
                            # Check if we should send based on frequency and last sent time
                            frequency = alert.get('newsletter_frequency', 'daily')
                            last_sent = alert.get('last_notification_sent')
                            
                            if not self.should_send_newsletter(frequency, last_sent):
                                print(f"⏳ Skipping alert {alert['id']}, too soon to send next newsletter")
                                print(f"  Last sent: {last_sent}")
                                continue
                            
                            # Calculate when this newsletter should be sent
                            scheduled_time = datetime.now(UTC) + timedelta(minutes=5)  # Schedule for 5 minutes from now
                            print(f"📅 Scheduling newsletter for {scheduled_time} UTC")
                            
                            # Check for existing pending newsletters
                            pending_result = self.db.client.table('newsletter_logs')\
                                .select('id')\
                                .eq('alert_id', alert['id'])\
                                .eq('status', 'pending')\
                                .execute()
                                
                            if pending_result.data:
                                print(f"⚠️ Found existing pending newsletter for this alert, skipping")
                                continue
                            
                            # Schedule the newsletter
                            log_id = self.newsletter_service.schedule_newsletter(
                                user_id=user['id'],
                                scheduled_for=scheduled_time,
                                alert_id=alert['id']
                            )
                            if log_id:
                                print(f"✅ Successfully scheduled newsletter (Log ID: {log_id})")
                            else:
                                print(f"❌ Failed to schedule newsletter")
                            
                        except Exception as e:
                            print(f"❌ Error processing alert {alert['id']}: {str(e)}")
                            continue
                            
                except Exception as e:
                    print(f"❌ Error processing user {user['id']}: {str(e)}")
                    continue
                    
        except Exception as e:
            print(f"❌ Error in schedule_newsletters: {str(e)}")
            raise

    def process_newsletters(self):
        """Process any pending newsletters that are due"""
        try:
            print("\n📬 Processing scheduled newsletters...")
            
            # Get pending newsletters
            pending = self.db.get_pending_newsletters()
            if not pending:
                print("ℹ️ No pending newsletters to process")
                return
                
            print(f"📋 Found {len(pending)} pending newsletters")
            
            # Process each newsletter
            for newsletter in pending:
                try:
                    # Double check status hasn't changed
                    current = self.db.client.table('newsletter_logs')\
                        .select('status, sent_at')\
                        .eq('id', newsletter['id'])\
                        .single()\
                        .execute()
                        
                    if not current.data or current.data['status'] != 'pending' or current.data.get('sent_at'):
                        print(f"⚠️ Newsletter {newsletter['id']} status changed, skipping")
                        continue
                        
                    print(f"\n📨 Processing newsletter {newsletter['id']}")
                    self.newsletter_service.process_scheduled_newsletters()
                    
                except Exception as e:
                    print(f"❌ Error processing newsletter {newsletter['id']}: {str(e)}")
                    continue
                    
        except Exception as e:
            print(f"❌ Error in process_newsletters: {str(e)}")
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