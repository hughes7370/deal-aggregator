import requests
from typing import List, Dict, Optional
import os
from datetime import datetime, timedelta, UTC
import sys

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

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
            if not user or not user.get('email') or not user.get('alert'):
                print("❌ Invalid user data provided")
                print(f"User data: {user}")
                return None
            
            if not listings:
                print("❌ No listings provided")
                return None

            # Create a newsletter log entry
            try:
                user_id = user['alert'].get('user_id')
                alert_id = user['alert'].get('id')
                if not user_id:
                    print("❌ No user_id found in alert")
                    return None
                log_id = self.db.create_newsletter_log(user_id, alert_id=alert_id)
            except Exception as e:
                print(f"❌ Error creating newsletter log: {str(e)}")
                return None
            
            # Create email content
            try:
                email_content = self.generate_html_content(user, listings)
            except Exception as e:
                print(f"❌ Error generating email content: {str(e)}")
                self.db.update_newsletter_status(log_id, 'failed', f"Error generating content: {str(e)}")
                return None
            
            # Prepare email parameters
            params = {
                "from": self.from_email,
                "to": [user['email']],
                "subject": f"Your {user['alert'].get('name', 'Deal')} Alert",
                "html": email_content
            }
            
            try:
                # Send email using Resend (synchronously since it doesn't support async)
                response = resend.Emails.send(params)
                
                # Debug print the response
                print(f"Resend API Response: {response}")
                
                if response and isinstance(response, dict) and response.get('id'):
                    # Update newsletter log as sent
                    self.db.update_newsletter_status(log_id, 'sent')
                    
                    # Update last_notification_sent timestamp with UTC time
                    try:
                        if alert_id:
                            self.db.client.table('alerts')\
                                .update({'last_notification_sent': datetime.now(UTC).isoformat()})\
                                .eq('id', alert_id)\
                                .execute()
                    except Exception as e:
                        print(f"⚠️ Could not update last_notification_sent: {str(e)}")
                    
                    return response['id']
                else:
                    # Update newsletter log as failed with response details
                    error_msg = f"Invalid response from email service: {response}"
                    self.db.update_newsletter_status(log_id, 'failed', error_msg)
                    print(f"❌ {error_msg}")
                    return None
                    
            except Exception as e:
                # Update newsletter log with error
                error_message = str(e)
                self.db.update_newsletter_status(log_id, 'failed', error_message)
                print(f"❌ Error sending newsletter to {user['email']}: {error_message}")
                return None
            
        except Exception as e:
            print(f"❌ Error in send_newsletter: {str(e)}")
            print(f"User data: {user}")
            return None

    def normalize_industry(self, industry: str) -> str:
        """Normalize industry name to match standard categories"""
        industry = industry.lower().strip()
        
        # Software/SaaS/Technology variations
        if any(term in industry for term in ['saas', 'software', 'tech', 'app', 'plugin', 'extension', 'mobile']):
            return 'Software/SaaS'
        
        # Ecommerce variations
        elif any(term in industry for term in ['ecommerce', 'e-commerce', 'amazon', 'shopify', 'fba', 'retail', 'commerce']):
            return 'Ecommerce'
        
        # Content/Media variations
        elif any(term in industry for term in ['content', 'blog', 'media', 'digital', 'youtube', 'social media', 'newsletter', 'advertising', 'entertainment']):
            return 'Content/Media'
        
        # Service variations
        elif any(term in industry for term in ['service', 'consulting', 'agency', 'services']):
            return 'Service'
        
        # Manufacturing variations
        elif any(term in industry for term in ['manufacturing', 'factory', 'production']):
            return 'Manufacturing'
        
        # Wholesale/Distribution variations
        elif any(term in industry for term in ['distribution', 'wholesale']):
            return 'Wholesale/Distribution'
        
        # Education variations
        elif any(term in industry for term in ['education', 'learning', 'teaching', 'edtech']):
            return 'Education'
        
        # Healthcare variations
        elif any(term in industry for term in ['health', 'healthcare', 'medical']):
            return 'Healthcare Services'
        
        # Marketing variations
        elif any(term in industry for term in ['marketing', 'seo', 'ppc', 'advertising']):
            return 'Marketing'
        
        # Renewable Energy variations
        elif any(term in industry for term in ['renewable', 'energy', 'solar', 'wind']):
            return 'Renewable Energy'
        
        else:
            return 'Other'

    def get_matching_listings(self, preferences: Dict) -> List[Dict]:
        """Get listings matching the user's preferences"""
        try:
            print("\nBuilding query with filters:")
            query = self.db.client.table('listings').select('*')
            
            # Apply price filters if set
            if preferences.get('max_price'):
                print(f"- Max price: {preferences['max_price']}")
                query = query.lte('asking_price', preferences['max_price'])
            if preferences.get('min_price'):
                print(f"- Min price: {preferences['min_price']}")
                query = query.gte('asking_price', preferences['min_price'])
            
            # Apply industry filters
            if preferences.get('industries'):
                # Normalize industries
                normalized_industries = []
                for industry in preferences['industries']:
                    if industry == 'SaaS':
                        print(f"Normalized industry '{industry}' to 'Software/SaaS'")
                        normalized_industries.extend(['Software/SaaS', 'Technology'])
                    elif industry == 'E-commerce':
                        print(f"Normalized industry '{industry}' to 'Ecommerce'")
                        normalized_industries.append('Ecommerce')
                    elif industry in ['Digital Products', 'Content', 'Advertising']:
                        print(f"Normalized industry '{industry}' to 'Content/Media'")
                        normalized_industries.append('Content/Media')
                    elif industry == 'Services':
                        print(f"Normalized industry '{industry}' to 'Service'")
                        normalized_industries.append('Service')
                    elif industry == 'Mobile Apps':
                        print(f"Normalized industry '{industry}' to 'Software/SaaS'")
                        normalized_industries.extend(['Software/SaaS', 'Technology'])
                    else:
                        normalized_industries.append(industry)
                
                # Remove duplicates while preserving order
                normalized_industries = list(dict.fromkeys(normalized_industries))
                print(f"Final normalized industries: {normalized_industries}")
                
                # Apply industry filter
                query = query.in_('industry', normalized_industries)
                print(f"- Industry filter: IN {normalized_industries}")
            
            # Apply business model filters
            if preferences.get('preferred_business_models'):
                print(f"- Business models (disabled): {preferences['preferred_business_models']}")
            
            # Apply time filter based on frequency and last notification
            last_sent = preferences.get('last_notification_sent')
            frequency = preferences.get('newsletter_frequency', 'daily')
            now = datetime.now(UTC)
            
            if last_sent:
                last_sent_dt = datetime.fromisoformat(last_sent.replace('Z', '+00:00'))
                print(f"- Last notification sent: {last_sent_dt}")
                
                # Calculate the time filter based on frequency
                if frequency == 'daily':
                    # For daily, use either 24 hours ago or last notification time, whichever is more recent
                    twenty_four_hours_ago = now - timedelta(hours=24)
                    cutoff = max(twenty_four_hours_ago, last_sent_dt)
                    print(f"- Time filter: created_at > {cutoff.isoformat()} (daily - using max of 24h ago or last notification)")
                elif frequency == 'weekly':
                    # For weekly, use either 7 days ago or last notification time, whichever is more recent
                    seven_days_ago = now - timedelta(days=7)
                    cutoff = max(seven_days_ago, last_sent_dt)
                    print(f"- Time filter: created_at > {cutoff.isoformat()} (weekly)")
                else:  # monthly
                    # For monthly, use either 30 days ago or last notification time, whichever is more recent
                    thirty_days_ago = now - timedelta(days=30)
                    cutoff = max(thirty_days_ago, last_sent_dt)
                    print(f"- Time filter: created_at > {cutoff.isoformat()} (monthly)")
                
                query = query.gt('created_at', cutoff.isoformat())
            else:
                # If no last_sent, use a more lenient cutoff for testing
                cutoff = now - timedelta(days=30)  # Show last 30 days of listings
                query = query.gt('created_at', cutoff.isoformat())
                print(f"- Time filter: created_at > {cutoff.isoformat()} (default 30 days)")
            
            # Execute query and get results
            print("\nExecuting query...")
            result = query.execute()
            
            if not result.data:
                print("No listings found matching the query")
                return []
            
            # Sort by newest first and limit to 10 listings
            listings = sorted(result.data, key=lambda x: x.get('created_at', ''), reverse=True)[:10]
            
            # Debug: print industries of matched listings
            if listings:
                print("\nMatched listings industries:")
                for listing in listings:
                    print(f"- {listing.get('title')}: {listing.get('industry')}")
            
            return listings
            
        except Exception as e:
            print(f"Error getting matching listings: {str(e)}")
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
            if profit_margin is None:
                revenue = listing.get('revenue')
                ebitda = listing.get('ebitda')
                if revenue and ebitda and revenue != 0:
                    profit_margin = (ebitda / revenue) * 100

            selling_multiple = listing.get('selling_multiple')
            if selling_multiple is None:
                asking_price = listing.get('asking_price')
                ebitda = listing.get('ebitda')
                if asking_price and ebitda and ebitda != 0:
                    selling_multiple = asking_price / ebitda

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

                    <p style="margin: 10px 0;">{(listing.get('description') or '')[:200]}...</p>
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
        if alert.get('preferred_business_models') and len(alert.get('preferred_business_models', [])) > 0:
            advanced_criteria_html += f"Business Models: {', '.join(alert.get('preferred_business_models', []))}<br>"
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
                <h3 style="margin: 0 0 10px 0;">Alert Criteria{f": {alert.get('name')}" if alert.get('name') else ''}</h3>
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
                <h1 style="color: #333; padding: 20px 0;">{alert.get('name', 'Your')} - Deal Alert</h1>
                <p style="color: #666;">Here are new listings matching your criteria:</p>
                
                {search_criteria_html}
                
                {listings_html}
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
                    <p>To update your preferences or unsubscribe, please visit your <a href="https://dealsight.co/dashboard/preferences" style="color: #007bff; text-decoration: none;">dashboard</a>.</p>
                </div>
            </div>
        """

    def schedule_newsletter(self, user_id: str, scheduled_for: datetime = None, alert_id: str = None) -> str:
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
            print("\n📬 Processing scheduled newsletters...")
            
            # Get pending newsletters that are due
            pending_newsletters = self.db.get_pending_newsletters()
            
            if not pending_newsletters:
                print("ℹ️ No pending newsletters to process")
                return
                
            print(f"📋 Found {len(pending_newsletters)} pending newsletters")
            
            for newsletter in pending_newsletters:
                try:
                    print(f"\n📨 Processing newsletter {newsletter['id']}")
                    print(f"Newsletter details:")
                    print(f"- Created: {newsletter.get('created_at')}")
                    print(f"- Scheduled for: {newsletter.get('scheduled_for')}")
                    print(f"- User ID: {newsletter.get('user_id')}")
                    print(f"- Alert ID: {newsletter.get('alert_id')}")
                    
                    # Get alert data if alert_id is present
                    alert = None
                    if newsletter.get('alert_id'):
                        print(f"🔍 Fetching alert data...")
                        alert_result = self.db.client.table('alerts')\
                            .select('*')\
                            .eq('id', newsletter['alert_id'])\
                            .single()\
                            .execute()
                        if alert_result.data:
                            alert = alert_result.data
                            print(f"✅ Found alert: {alert.get('name')}")
                            print(f"Alert details:")
                            print(f"- Frequency: {alert.get('newsletter_frequency', 'daily')}")
                            print(f"- Last sent: {alert.get('last_notification_sent', 'Never')}")
                            print(f"- Industries: {alert.get('industries', [])}")
                        else:
                            error_msg = f"Alert not found for ID: {newsletter['alert_id']}"
                            print(f"❌ {error_msg}")
                            self.db.update_newsletter_status(newsletter['id'], 'failed', error_msg)
                            continue

                    # Get user data
                    print(f"🔍 Fetching user data...")
                    user_result = self.db.client.table('users')\
                        .select('*')\
                        .eq('id', newsletter['user_id'])\
                        .single()\
                        .execute()
                        
                    if not user_result.data:
                        error_msg = f"User not found for newsletter {newsletter['id']}"
                        print(f"❌ {error_msg}")
                        self.db.update_newsletter_status(newsletter['id'], 'failed', error_msg)
                        continue
                    
                    user = user_result.data
                    print(f"✅ Found user: {user.get('email')}")
                    
                    # Get user's preferences/alerts if not already fetched
                    if not alert:
                        print(f"🔍 Fetching user alerts...")
                        alerts_result = self.db.client.table('alerts')\
                            .select('*')\
                            .eq('user_id', user['id'])\
                            .execute()
                            
                        if not alerts_result.data:
                            error_msg = f"No alerts found for user {user['email']}"
                            print(f"❌ {error_msg}")
                            self.db.update_newsletter_status(newsletter['id'], 'failed', error_msg)
                            continue
                        
                        alert = alerts_result.data[0]  # Use the first alert if multiple exist
                        print(f"✅ Using alert: {alert.get('name')}")
                        print(f"Alert details:")
                        print(f"- Frequency: {alert.get('newsletter_frequency', 'daily')}")
                        print(f"- Last sent: {alert.get('last_notification_sent', 'Never')}")
                        print(f"- Industries: {alert.get('industries', [])}")

                    # Get matching listings
                    print(f"\n🔍 Finding matching listings...")
                    matching_listings = self.get_matching_listings(alert)
                    
                    if not matching_listings:
                        skip_msg = f"No matching listings found for alert '{alert['name']}' since last notification at {alert.get('last_notification_sent', 'Never')}"
                        print(f"ℹ️ {skip_msg}")
                        self.db.update_newsletter_status(newsletter['id'], 'skipped', skip_msg)
                        continue
                    
                    print(f"✅ Found {len(matching_listings)} matching listings")
                    
                    # Send the newsletter
                    print(f"\n📤 Sending newsletter to {user['email']}...")
                    email_id = self.send_newsletter(
                        user={'email': user['email'], 'alert': alert},
                        listings=matching_listings
                    )
                    
                    if email_id:
                        print(f"✅ Newsletter sent successfully! (Email ID: {email_id})")
                        # Update last notification sent timestamp
                        self.db.client.table('alerts')\
                            .update({'last_notification_sent': datetime.now(UTC).isoformat()})\
                            .eq('id', alert['id'])\
                            .execute()
                        print(f"✅ Updated last notification timestamp for alert")
                    else:
                        error_msg = f"Failed to send newsletter to {user['email']}"
                        print(f"❌ {error_msg}")
                        self.db.update_newsletter_status(newsletter['id'], 'failed', error_msg)

                except Exception as e:
                    error_msg = f"Error processing scheduled newsletter {newsletter['id']}: {str(e)}"
                    print(f"❌ {error_msg}")
                    self.db.update_newsletter_status(newsletter['id'], 'failed', error_msg)
                    continue
                    
        except Exception as e:
            print(f"❌ Error processing scheduled newsletters: {str(e)}")
            raise