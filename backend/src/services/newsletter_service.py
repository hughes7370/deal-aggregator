import requests
from typing import List, Dict, Optional
import os
from datetime import datetime
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
            # Get all user preferences
            preferences_result = self.db.client.table('user_preferences')\
                .select('*')\
                .execute()
                
            if not preferences_result.data:
                print("ℹ️ No user preferences found")
                return
                
            print(f"\n📊 Found {len(preferences_result.data)} users with preferences")
            
            success_count = 0
            error_count = 0
            skipped_count = 0
            
            # Process each user
            for user_preferences in preferences_result.data:
                try:
                    # Get the user data
                    user_result = self.db.client.table('users')\
                        .select('*')\
                        .eq('id', user_preferences['user_id'])\
                        .single()\
                        .execute()
                    
                    if not user_result.data:
                        print(f"ℹ️ Skipping: User not found for preferences {user_preferences['id']}")
                        skipped_count += 1
                        continue
                        
                    user = user_result.data
                    print(f"\n📧 Processing user: {user['email']}")
                    
                    # Get matching listings for this user
                    listings_result = self.db.client.table('listings')\
                        .select('*')\
                        .gte('asking_price', user_preferences.get('min_price', 0))\
                        .lte('asking_price', user_preferences.get('max_price', float('inf')))\
                        .in_('industry', user_preferences.get('industries', []))\
                        .limit(3)\
                        .execute()
                        
                    if not listings_result.data:
                        print(f"ℹ️ Skipping: No matching listings found for user {user['email']}")
                        skipped_count += 1
                        continue
                        
                    matching_listings = listings_result.data
                    print(f"📑 Found {len(matching_listings)} matching listings")
                    
                    # Send newsletter
                    print(f"📤 Sending newsletter to {user['email']}...")
                    email_id = self.send_newsletter(
                        user={
                            'email': user['email'],
                            'preferences': user_preferences
                        },
                        listings=matching_listings
                    )
                    
                    if email_id:
                        print(f"✅ Newsletter sent successfully to {user['email']}!")
                        success_count += 1
                        
                        try:
                            # Update last notification sent timestamp
                            self.db.client.table('user_preferences')\
                                .update({'last_notification_sent': datetime.now().isoformat()})\
                                .eq('id', user_preferences['id'])\
                                .execute()
                        except Exception as e:
                            # If we can't update the timestamp, log it but don't count as an error
                            print(f"⚠️ Could not update last_notification_sent for {user['email']}: {str(e)}")
                    else:
                        print(f"❌ Failed to send newsletter to {user['email']}")
                        error_count += 1
                    
                except Exception as e:
                    if 'PGRST116' in str(e):
                        print(f"ℹ️ Skipping: User data not found")
                        skipped_count += 1
                    elif 'PGRST204' in str(e):
                        print(f"⚠️ Note: last_notification_sent column not found - continuing anyway")
                        # Don't count this as an error
                    else:
                        print(f"❌ Error processing user {user_preferences.get('user_id')}: {str(e)}")
                        error_count += 1
                    continue
            
            # Print summary
            print("\n📊 Newsletter Send Summary")
            print(f"✅ Successfully sent: {success_count}")
            print(f"⚠️ Skipped: {skipped_count}")
            print(f"❌ Errors: {error_count}")
            print(f"📧 Total processed: {len(preferences_result.data)}")
            
        except Exception as e:
            print(f"❌ Error in send_personalized_newsletters: {str(e)}")
            raise

    def send_newsletter(self, user: dict, listings: list) -> str:
        """Send a newsletter to a single user"""
        try:
            # Create a newsletter log entry
            log_id = self.db.create_newsletter_log(user['preferences']['user_id'])
            
            # Create email content
            email_content = self.generate_html_content(user, listings)
            
            # Prepare email parameters
            params = {
                "from": self.from_email,
                "to": [user['email']],
                "subject": "Your Personalized Deal Updates",
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
            
            # Filter by price range if specified
            if preferences.get('min_price'):
                query = query.gte('asking_price', preferences['min_price'])
            if preferences.get('max_price'):
                query = query.lte('asking_price', preferences['max_price'])
                
            # Filter by industries if specified
            if preferences.get('industries'):
                industries = preferences['industries'].split(',')
                query = query.in_('industry', industries)
                
            # Get only active listings from last update
            if preferences.get('last_notification_sent'):
                query = query.gt('created_at', preferences['last_notification_sent'])
                
            result = query.execute()
            return result.data
            
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
            listings_html += f"""
                <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
                    <h3 style="margin: 0 0 10px 0;">{listing.get('title', 'Untitled Listing')}</h3>
                    <div style="margin: 5px 0;">
                        <strong>💰 Asking Price:</strong> {self.format_currency(listing.get('asking_price'))}
                        <br>
                        <strong>📈 Revenue:</strong> {self.format_currency(listing.get('revenue'))}
                        <br>
                        <strong>💵 EBITDA:</strong> {self.format_currency(listing.get('ebitda'))}
                        <br>
                        <strong>🏢 Industry:</strong> {listing.get('industry', 'Not specified')}
                    </div>
                    <p style="margin: 10px 0;">{listing.get('description', '')[:200]}...</p>
                    <a href="{listing.get('listing_url', '#')}" 
                       style="display: inline-block; padding: 8px 15px; background-color: #007bff; 
                              color: white; text-decoration: none; border-radius: 3px;">
                        View Listing Details
                    </a>
                </div>
            """

        return f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #333; padding: 20px 0;">Your Personalized Deal Alert</h1>
                <p style="color: #666;">Here are new listings matching your criteria:</p>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 10px 0;">Your Search Criteria:</h3>
                    <p style="margin: 5px 0;">
                        Price Range: {self.format_currency(user['preferences'].get('min_price', 0))} - 
                                   {self.format_currency(user['preferences'].get('max_price', 0))}
                        <br>
                        Industries: {user['preferences'].get('industries', 'All')}
                    </p>
                </div>
                
                {listings_html}
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
                    <p>To update your preferences or unsubscribe, please visit your dashboard.</p>
                </div>
            </div>
        """

    def schedule_newsletter(self, user_id: str, scheduled_for: datetime) -> str:
        """Schedule a newsletter for future delivery"""
        try:
            # Create a newsletter log entry with scheduled time
            log_id = self.db.create_newsletter_log(user_id, scheduled_for)
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
                    # Get user data
                    user_result = self.db.client.table('users')\
                        .select('*, user_preferences(*)')\
                        .eq('id', newsletter['user_id'])\
                        .single()\
                        .execute()
                        
                    if not user_result.data:
                        print(f"⚠️ User not found for newsletter {newsletter['id']}")
                        self.db.update_newsletter_status(newsletter['id'], 'failed', 'User not found')
                        continue
                        
                    user = user_result.data
                    preferences = user.get('user_preferences')
                    
                    if not preferences:
                        print(f"⚠️ No preferences found for user {user['email']}")
                        self.db.update_newsletter_status(newsletter['id'], 'failed', 'No user preferences found')
                        continue
                    
                    # Get matching listings
                    matching_listings = self.get_matching_listings(preferences)
                    
                    if not matching_listings:
                        print(f"ℹ️ No matching listings for user {user['email']}")
                        self.db.update_newsletter_status(newsletter['id'], 'skipped', 'No matching listings')
                        continue
                    
                    # Send the newsletter
                    email_id = self.send_newsletter(
                        user={'email': user['email'], 'preferences': preferences},
                        listings=matching_listings
                    )
                    
                    if email_id:
                        print(f"✅ Scheduled newsletter sent successfully to {user['email']}")
                    else:
                        print(f"❌ Failed to send scheduled newsletter to {user['email']}")
                    
                except Exception as e:
                    print(f"❌ Error processing scheduled newsletter {newsletter['id']}: {str(e)}")
                    self.db.update_newsletter_status(newsletter['id'], 'failed', str(e))
                    continue
                    
        except Exception as e:
            print(f"❌ Error processing scheduled newsletters: {str(e)}")