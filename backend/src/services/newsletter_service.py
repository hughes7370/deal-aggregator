import requests
from typing import List, Dict, Optional
import os
from datetime import datetime, timedelta, UTC
from backend.src.database.supabase_db import SupabaseClient
import json
import resend

class NewsletterService:
    def __init__(self):
        self.from_email = os.getenv('RESEND_FROM_EMAIL', 'alerts@dealsight.co')
        resend.api_key = os.getenv('RESEND_API_KEY')
        self.db = SupabaseClient()
        print(f"NewsletterService initialized with from_email: {self.from_email}")
        print(f"Resend API Key available: {'Yes' if resend.api_key else 'No'}")

    def send_personalized_newsletters(self):
        """Send personalized newsletters to all users based on their preferences"""
        try:
            # Get all alerts
            alerts_result = self.db.client.table('alerts')\
                .select('*, users!inner(*)')\
                .execute()
                
            if not alerts_result.data:
                print("ℹ️ No alerts found")
                return
                
            print(f"\n📊 Found {len(alerts_result.data)} alerts")
            
            success_count = 0
            error_count = 0
            skipped_count = 0
            
            # Process each alert
            for alert in alerts_result.data:
                try:
                    user = alert['users']
                    print(f"\n📧 Processing alert '{alert['name']}' for user: {user['email']}")
                    
                    # Get matching listings for this alert
                    matching_listings = self.get_matching_listings(alert)
                    
                    if not matching_listings:
                        print(f"ℹ️ Skipping: No matching listings found for alert '{alert['name']}'")
                        skipped_count += 1
                        continue
                        
                    print(f"📑 Found {len(matching_listings)} matching listings")
                    
                    # Send newsletter
                    print(f"📤 Sending newsletter to {user['email']}...")
                    email_id = self.send_newsletter(
                        user={
                            'email': user['email'],
                            'alert': alert
                        },
                        listings=matching_listings
                    )
                    
                    if email_id:
                        print(f"✅ Newsletter sent successfully to {user['email']}!")
                        success_count += 1
                        
                        try:
                            # Update last notification sent timestamp
                            self.db.client.table('alerts')\
                                .update({'last_notification_sent': datetime.now().isoformat()})\
                                .eq('id', alert['id'])\
                                .execute()
                        except Exception as e:
                            # If we can't update the timestamp, log it but don't count as an error
                            print(f"⚠️ Could not update last_notification_sent for alert '{alert['name']}': {str(e)}")
                    else:
                        print(f"❌ Failed to send newsletter to {user['email']}")
                        error_count += 1
                    
                except Exception as e:
                    print(f"❌ Error processing alert {alert.get('id')}: {str(e)}")
                    error_count += 1
                    continue
            
            # Print summary
            print("\n📊 Newsletter Send Summary")
            print(f"✅ Successfully sent: {success_count}")
            print(f"⚠️ Skipped: {skipped_count}")
            print(f"❌ Errors: {error_count}")
            print(f"📧 Total processed: {len(alerts_result.data)}")
            
        except Exception as e:
            print(f"❌ Error in send_personalized_newsletters: {str(e)}")
            raise

    def send_newsletter(self, user: dict, listings: list) -> str:
        """Send a newsletter to a single user"""
        try:
            # Create a newsletter log entry
            log_id = self.db.create_newsletter_log(user['alert']['user_id'])
            
            # Create email content
            email_content = self.generate_html_content(user, listings)
            
            # Prepare email parameters
            params = {
                "from": self.from_email,
                "to": [user['email']],
                "subject": f"Your {user['alert']['name']} Deal Alert",
                "html": email_content
            }
            
            try:
                # Send email using Resend
                response = resend.Emails.send(params)
                
                if response and response.get('id'):
                    # Update newsletter log as sent
                    self.db.update_newsletter_status(log_id, 'sent')
                    return response['id']
                else:
                    # Update newsletter log as failed
                    self.db.update_newsletter_status(log_id, 'failed', 'No response ID from email service')
                    return None
                    
            except Exception as e:
                # Update newsletter log with error
                error_message = str(e)
                self.db.update_newsletter_status(log_id, 'failed', error_message)
                print(f"❌ Error sending newsletter to {user['email']}: {error_message}")
                return None
            
        except Exception as e:
            print(f"❌ Error in send_newsletter: {str(e)}")
            return None

    def get_matching_listings(self, preferences: Dict) -> List[Dict]:
        """Get listings that match user preferences"""
        try:
            query = self.db.client.table('listings').select('*')
            
            # Basic Filters
            # Filter by price range if specified
            if preferences.get('min_price'):
                query = query.gte('asking_price', preferences['min_price'])
            if preferences.get('max_price'):
                query = query.lte('asking_price', preferences['max_price'])
                
            # Filter by industries if specified
            if preferences.get('industries'):
                industries = preferences['industries'] if isinstance(preferences['industries'], list) else preferences['industries'].split(',')
                query = query.in_('industry', industries)

            # Advanced Filters
            # Business Age
            if preferences.get('min_business_age') is not None:
                query = query.gte('business_age', preferences['min_business_age'])
            if preferences.get('max_business_age') is not None:
                query = query.lte('business_age', preferences['max_business_age'])

            # Number of Employees
            if preferences.get('min_employees') is not None:
                query = query.gte('number_of_employees', preferences['min_employees'])
            if preferences.get('max_employees') is not None:
                query = query.lte('number_of_employees', preferences['max_employees'])

            # Business Models
            if preferences.get('preferred_business_models') and len(preferences['preferred_business_models']) > 0:
                query = query.in_('business_model', preferences['preferred_business_models'])

            # Profit Margin
            if preferences.get('min_profit_margin') is not None:
                query = query.gte('profit_margin', preferences['min_profit_margin'])
            if preferences.get('max_profit_margin') is not None:
                query = query.lte('profit_margin', preferences['max_profit_margin'])

            # Selling Multiple
            if preferences.get('min_selling_multiple') is not None:
                query = query.gte('selling_multiple', preferences['min_selling_multiple'])
            if preferences.get('max_selling_multiple') is not None:
                query = query.lte('selling_multiple', preferences['max_selling_multiple'])

            # EBITDA
            if preferences.get('min_ebitda') is not None:
                query = query.gte('ebitda', preferences['min_ebitda'])
            if preferences.get('max_ebitda') is not None:
                query = query.lte('ebitda', preferences['max_ebitda'])

            # Annual Revenue
            if preferences.get('min_annual_revenue') is not None:
                query = query.gte('revenue', preferences['min_annual_revenue'])
            if preferences.get('max_annual_revenue') is not None:
                query = query.lte('revenue', preferences['max_annual_revenue'])
            
            # Filter by time based on newsletter frequency
            frequency = preferences.get('newsletter_frequency', 'daily')
            last_sent = preferences.get('last_notification_sent')
            
            if last_sent:
                last_sent = datetime.fromisoformat(last_sent.replace('Z', '+00:00'))
                
                if frequency == 'instantly':
                    # For instant notifications, only get listings newer than last notification
                    query = query.gt('created_at', last_sent.isoformat())
                elif frequency == 'daily':
                    # For daily, get listings from the past 24 hours
                    cutoff = datetime.now(UTC) - timedelta(days=1)
                    query = query.gt('created_at', cutoff.isoformat())
                elif frequency == 'weekly':
                    # For weekly, get listings from the past 7 days
                    cutoff = datetime.now(UTC) - timedelta(days=7)
                    query = query.gt('created_at', cutoff.isoformat())
                else:  # monthly
                    # For monthly, get listings from the past 30 days
                    cutoff = datetime.now(UTC) - timedelta(days=30)
                    query = query.gt('created_at', cutoff.isoformat())
            else:
                # If no last_sent, use frequency-based cutoff
                if frequency == 'daily':
                    cutoff = datetime.now(UTC) - timedelta(days=1)
                elif frequency == 'weekly':
                    cutoff = datetime.now(UTC) - timedelta(days=7)
                else:  # monthly
                    cutoff = datetime.now(UTC) - timedelta(days=30)
                query = query.gt('created_at', cutoff.isoformat())

            # Order by newest first and limit to reasonable number
            query = query.order('created_at', desc=True).limit(10)
            
            result = query.execute()
            return result.data if result.data else []
            
        except Exception as e:
            print(f"Error fetching matching listings: {e}")
            return []

    def format_currency(self, amount: int) -> str:
        """Format amount as currency string"""
        return "${:,.0f}".format(amount) if amount else "N/A"
    
    def generate_html_content(self, user: Dict, listings: List[Dict]) -> str:
        """Generate personalized HTML email content"""
        if not listings:
            return f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #333; padding: 20px 0;">No New Matches Today</h1>
                    <p style="color: #666;">There are no new listings matching your criteria today. We'll keep looking!</p>
                </div>
            """
            
        listings_html = ""
        for listing in listings:
            # Calculate metrics if not already present
            profit_margin = listing.get('profit_margin')
            if profit_margin is None and listing.get('revenue') and listing.get('ebitda'):
                profit_margin = (listing['ebitda'] / listing['revenue']) * 100

            selling_multiple = listing.get('selling_multiple')
            if selling_multiple is None and listing.get('asking_price') and listing.get('ebitda'):
                selling_multiple = listing['asking_price'] / listing['ebitda']

            listings_html += f"""
                <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
                    <h3 style="margin: 0 0 10px 0;">{listing.get('title', 'Untitled Listing')}</h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0;">
                        <div>
                            <strong>💰 Asking Price:</strong> {self.format_currency(listing.get('asking_price'))}
                            <br>
                            <strong>📈 Revenue:</strong> {self.format_currency(listing.get('revenue'))}
                            <br>
                            <strong>💵 EBITDA:</strong> {self.format_currency(listing.get('ebitda'))}
                            <br>
                            <strong>🏢 Industry:</strong> {listing.get('industry', 'Not specified')}
                            <br>
                            <strong>🤝 Listing Broker:</strong> {listing.get('source_platform', 'Not specified')}
                        </div>
                        <div>
                            <strong>📊 Profit Margin:</strong> {f"{profit_margin:.1f}%" if profit_margin is not None else "Not available"}
                            <br>
                            <strong>📈 Selling Multiple:</strong> {f"{selling_multiple:.1f}x" if selling_multiple is not None else "Not available"}
                            <br>
                            <strong>⏳ Business Age:</strong> {f"{listing.get('business_age')} years" if listing.get('business_age') is not None else "Not specified"}
                            <br>
                            <strong>👥 Team Size:</strong> {f"{listing.get('number_of_employees')} employees" if listing.get('number_of_employees') is not None else "Not specified"}
                        </div>
                    </div>

                    <div style="margin: 10px 0;">
                        <strong>💼 Business Model:</strong> {listing.get('business_model', 'Not specified')}
                    </div>

                    <p style="margin: 10px 0;">{listing.get('description', '')[:200]}...</p>
                    <a href="{listing.get('listing_url', '#')}" 
                       style="display: inline-block; padding: 8px 15px; background-color: #007bff; 
                              color: white; text-decoration: none; border-radius: 3px;">
                        View Listing Details
                    </a>
                </div>
            """

        # Add the alert criteria to the search criteria section
        alert = user['alert']
        advanced_criteria_html = ""
        if alert.get('preferred_business_models') and len(alert['preferred_business_models']) > 0:
            advanced_criteria_html += f"Business Models: {', '.join(alert['preferred_business_models'])}<br>"
        if alert.get('min_business_age') is not None or alert.get('max_business_age') is not None:
            advanced_criteria_html += f"Business Age: {alert.get('min_business_age', '0')} - {alert.get('max_business_age', 'Any')} years<br>"
        if alert.get('min_employees') is not None or alert.get('max_employees') is not None:
            advanced_criteria_html += f"Team Size: {alert.get('min_employees', '0')} - {alert.get('max_employees', 'Any')} employees<br>"
        if alert.get('min_profit_margin') is not None or alert.get('max_profit_margin') is not None:
            advanced_criteria_html += f"Profit Margin: {alert.get('min_profit_margin', '0')}% - {alert.get('max_profit_margin', 'Any')}%<br>"
        if alert.get('min_selling_multiple') is not None or alert.get('max_selling_multiple') is not None:
            advanced_criteria_html += f"Selling Multiple: {alert.get('min_selling_multiple', '0')}x - {alert.get('max_selling_multiple', 'Any')}x<br>"
        if alert.get('min_ebitda') is not None or alert.get('max_ebitda') is not None:
            advanced_criteria_html += f"EBITDA: {self.format_currency(alert.get('min_ebitda', 0))} - {self.format_currency(alert.get('max_ebitda', 'Any'))}<br>"
        if alert.get('min_annual_revenue') is not None or alert.get('max_annual_revenue') is not None:
            advanced_criteria_html += f"Annual Revenue: {self.format_currency(alert.get('min_annual_revenue', 0))} - {self.format_currency(alert.get('max_annual_revenue', 'Any'))}<br>"

        search_criteria_html = f"""
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0;">Alert Criteria: {alert['name']}</h3>
                <div style="margin: 5px 0;">
                    <strong>Basic Criteria:</strong><br>
                    Price Range: {self.format_currency(alert.get('min_price', 0))} - 
                               {self.format_currency(alert.get('max_price', 0))}<br>
                    Industries: {', '.join(alert.get('industries', ['All']))}<br>
                </div>
                {f'<div style="margin-top: 10px;"><strong>Advanced Criteria:</strong><br>{advanced_criteria_html}</div>' if advanced_criteria_html else ''}
            </div>
        """
        
        return f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #333; padding: 20px 0;">{alert['name']} - Deal Alert</h1>
                <p style="color: #666;">Here are new listings matching your criteria:</p>
                
                {search_criteria_html}
                
                {listings_html}
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
                    <p>To update your preferences or unsubscribe, please visit your <a href="https://dealsight.co/dashboard/preferences" style="color: #007bff; text-decoration: none;">dashboard</a>.</p>
                </div>
            </div>
        """

    def schedule_newsletter(self, user_id: str, scheduled_for: datetime, alert_id: str = None) -> str:
        """Schedule a newsletter for future delivery"""
        try:
            # Create a newsletter log entry with scheduled time and alert ID
            log_id = self.db.create_newsletter_log(user_id, scheduled_for, alert_id)
            print(f"📅 Scheduled newsletter for user {user_id} at {scheduled_for}")
            return log_id
        except Exception as e:
            print(f"❌ Error scheduling newsletter: {str(e)}")
            return None

    def process_scheduled_newsletters(self):
        """Process all pending scheduled newsletters"""
        try:
            # Get pending newsletters that are due
            pending_newsletters = self.db.get_pending_newsletters()
            
            if not pending_newsletters:
                print("No pending newsletters to process")
                return
                
            print(f"Processing {len(pending_newsletters)} pending newsletters")
            
            for newsletter in pending_newsletters:
                try:
                    # Get alert data if alert_id is present
                    alert = None
                    if newsletter.get('alert_id'):
                        alert_result = self.db.client.table('alerts')\
                            .select('*')\
                            .eq('id', newsletter['alert_id'])\
                            .single()\
                            .execute()
                        if alert_result.data:
                            alert = alert_result.data
                    
                    # Get user data
                    user_result = self.db.client.table('users')\
                        .select('*')\
                        .eq('id', newsletter['user_id'])\
                        .single()\
                        .execute()
                        
                    if not user_result.data:
                        print(f"⚠️ User not found for newsletter {newsletter['id']}")
                        self.db.update_newsletter_status(newsletter['id'], 'failed', 'User not found')
                        continue
                        
                    user = user_result.data
                    
                    if not alert:
                        print(f"⚠️ No alert found for newsletter {newsletter['id']}")
                        self.db.update_newsletter_status(newsletter['id'], 'failed', 'Alert not found')
                        continue
                    
                    # Get matching listings
                    matching_listings = self.get_matching_listings(alert)
                    
                    if not matching_listings:
                        print(f"ℹ️ No matching listings for alert '{alert['name']}'")
                        self.db.update_newsletter_status(newsletter['id'], 'skipped', 'No matching listings')
                        continue
                    
                    # Send the newsletter
                    email_id = self.send_newsletter(
                        user={'email': user['email'], 'alert': alert},
                        listings=matching_listings
                    )
                    
                    if email_id:
                        print(f"✅ Scheduled newsletter sent successfully to {user['email']}!")
                        # Update last notification sent timestamp
                        self.db.client.table('alerts')\
                            .update({'last_notification_sent': datetime.now().isoformat()})\
                            .eq('id', alert['id'])\
                            .execute()
                    else:
                        print(f"❌ Failed to send scheduled newsletter to {user['email']}")
                    
                except Exception as e:
                    print(f"❌ Error processing scheduled newsletter {newsletter['id']}: {str(e)}")
                    self.db.update_newsletter_status(newsletter['id'], 'failed', str(e))
                    continue
                    
        except Exception as e:
            print(f"❌ Error processing scheduled newsletters: {str(e)}")
            raise