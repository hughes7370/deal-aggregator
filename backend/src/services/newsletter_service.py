import requests
from typing import List, Dict, Optional
import os
from datetime import datetime, timedelta, UTC
import sys

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from src.database.supabase_db import SupabaseClient
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
            
            # Check if there are any matches
            exact_matches = listings.get('exact_matches', [])
            other_matches = listings.get('other_matches', [])
            if not exact_matches and not other_matches:
                print("ℹ️ No matches found, skipping newsletter")
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

    def get_matching_listings(self, preferences: Dict) -> Dict[str, List[Dict]]:
        """Get listings matching the user's preferences, separated into exact matches and other matches"""
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
            
            # Apply business age filters
            if preferences.get('min_business_age') is not None:
                print(f"- Min business age: {preferences['min_business_age']}")
                query = query.gte('business_age', preferences['min_business_age'])
            if preferences.get('max_business_age') is not None:
                print(f"- Max business age: {preferences['max_business_age']}")
                query = query.lte('business_age', preferences['max_business_age'])

            # Apply employee filters
            if preferences.get('min_employees') is not None:
                print(f"- Min employees: {preferences['min_employees']}")
                query = query.gte('employees', preferences['min_employees'])
            if preferences.get('max_employees') is not None:
                print(f"- Max employees: {preferences['max_employees']}")
                query = query.lte('employees', preferences['max_employees'])

            # Apply annual revenue filters
            if preferences.get('min_annual_revenue') is not None:
                print(f"- Min annual revenue: {preferences['min_annual_revenue']}")
                query = query.gte('annual_revenue', preferences['min_annual_revenue'])
            if preferences.get('max_annual_revenue') is not None:
                print(f"- Max annual revenue: {preferences['max_annual_revenue']}")
                query = query.lte('annual_revenue', preferences['max_annual_revenue'])

            # Apply EBITDA filters
            if preferences.get('min_ebitda') is not None:
                print(f"- Min EBITDA: {preferences['min_ebitda']}")
                query = query.gte('ebitda', preferences['min_ebitda'])
            if preferences.get('max_ebitda') is not None:
                print(f"- Max EBITDA: {preferences['max_ebitda']}")
                query = query.lte('ebitda', preferences['max_ebitda'])

            # Apply profit margin filters
            if preferences.get('min_profit_margin') is not None:
                print(f"- Min profit margin: {preferences['min_profit_margin']}")
                query = query.gte('profit_margin', preferences['min_profit_margin'])
            if preferences.get('max_profit_margin') is not None:
                print(f"- Max profit margin: {preferences['max_profit_margin']}")
                query = query.lte('profit_margin', preferences['max_profit_margin'])

            # Apply selling multiple filters
            if preferences.get('min_selling_multiple') is not None:
                print(f"- Min selling multiple: {preferences['min_selling_multiple']}")
                query = query.gte('selling_multiple', preferences['min_selling_multiple'])
            if preferences.get('max_selling_multiple') is not None:
                print(f"- Max selling multiple: {preferences['max_selling_multiple']}")
                query = query.lte('selling_multiple', preferences['max_selling_multiple'])

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
                
                # uplicates while preserving order
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
                return {'exact_matches': [], 'other_matches': []}

            # Apply keyword search filters (post-query filtering)
            listings = result.data
            exact_matches = []
            other_matches = []

            if preferences.get('search_keywords'):
                search_keywords = preferences['search_keywords']
                search_match_type = preferences.get('search_match_type', 'any')
                search_in = preferences.get('search_in', ['title', 'description'])
                exclude_keywords = preferences.get('exclude_keywords', [])
                
                print(f"\nApplying keyword filters:")
                print(f"- Keywords: {search_keywords}")
                print(f"- Match type: {search_match_type}")
                print(f"- Search in: {search_in}")
                print(f"- Exclude: {exclude_keywords}")
                
                # Calculate search scores for each listing
                scored_exact_matches = []
                for listing in listings:
                    score = 0
                    matched_keywords = set()
                    
                    # Prepare search text based on fields to search in
                    search_text = ""
                    if 'title' in search_in:
                        search_text += f" {listing.get('title', '')}"
                    if 'description' in search_in:
                        search_text += f" {listing.get('description', '')}"
                        search_text += f" {listing.get('full_description', '')}"
                    if 'location' in search_in:
                        search_text += f" {listing.get('location', '')}"
                    
                    search_text = search_text.lower()
                    
                    # Check for excluded keywords first
                    excluded = False
                    for keyword in exclude_keywords:
                        if keyword.lower() in search_text:
                            excluded = True
                            break
                    
                    if excluded:
                        continue
                    
                    # Check for search keywords
                    for keyword in search_keywords:
                        keyword = keyword.lower()
                        if keyword in search_text:
                            matched_keywords.add(keyword)
                            # Give extra weight to title matches
                            if 'title' in search_in and keyword in listing.get('title', '').lower():
                                score += 2
                            else:
                                score += 1
                    
                    # Apply match type rules
                    include_listing = False
                    if search_match_type == 'any' and len(matched_keywords) > 0:
                        include_listing = True
                    elif search_match_type == 'all' and len(matched_keywords) == len(search_keywords):
                        include_listing = True
                    elif search_match_type == 'exact':
                        # For exact match, check if the exact phrase appears
                        exact_phrase = ' '.join(search_keywords).lower()
                        if exact_phrase in search_text:
                            include_listing = True
                            score += 3  # Bonus for exact phrase match
                    
                    if include_listing:
                        scored_exact_matches.append((listing, score))
                    else:
                        other_matches.append(listing)
                
                # Sort exact matches by score (highest first)
                scored_exact_matches.sort(key=lambda x: x[1], reverse=True)
                exact_matches = [item[0] for item in scored_exact_matches]
                
                print(f"Found {len(exact_matches)} exact matches and {len(other_matches)} other matches after keyword filtering")
            else:
                # If no keywords specified, all matches go to other_matches
                other_matches = listings

            # Sort both lists by newest first and limit each to 10 listings
            exact_matches = sorted(exact_matches, key=lambda x: x.get('created_at', ''), reverse=True)[:10]
            other_matches = sorted(other_matches, key=lambda x: x.get('created_at', ''), reverse=True)[:10]
            
            # Debug: print industries of matched listings
            if exact_matches:
                print("\nExact matches industries:")
                for listing in exact_matches:
                    print(f"- {listing.get('title')}: {listing.get('industry')}")
            if other_matches:
                print("\nOther matches industries:")
                for listing in other_matches:
                    print(f"- {listing.get('title')}: {listing.get('industry')}")
            
            return {'exact_matches': exact_matches, 'other_matches': other_matches}
            
        except Exception as e:
            print(f"Error getting matching listings: {str(e)}")
            return {'exact_matches': [], 'other_matches': []}

    def format_currency(self, amount: int) -> str:
        """Format amount as currency string"""
        return "${:,.0f}".format(amount) if amount else "N/A"
    
    def generate_listing_html(self, listing: Dict) -> str:
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

        # Build table rows for metrics that have values
        metric_rows = []
        if listing.get('asking_price'):
            metric_rows.append(f"""
                <tr>
                    <td style="padding: 8px 16px 8px 0; color: #6b7280; font-size: 14px; white-space: nowrap;">Price</td>
                    <td style="padding: 8px 24px 8px 0; font-weight: 600; color: #111827; font-size: 15px;">{self.format_currency(listing.get('asking_price'))}</td>
                </tr>
            """)
        if listing.get('revenue'):
            metric_rows.append(f"""
                <tr>
                    <td style="padding: 8px 16px 8px 0; color: #6b7280; font-size: 14px; white-space: nowrap;">Revenue</td>
                    <td style="padding: 8px 24px 8px 0; font-weight: 600; color: #111827; font-size: 15px;">{self.format_currency(listing.get('revenue'))}</td>
                </tr>
            """)
        if listing.get('ebitda'):
            metric_rows.append(f"""
                <tr>
                    <td style="padding: 8px 16px 8px 0; color: #6b7280; font-size: 14px; white-space: nowrap;">EBITDA</td>
                    <td style="padding: 8px 24px 8px 0; font-weight: 600; color: #111827; font-size: 15px;">{self.format_currency(listing.get('ebitda'))}</td>
                </tr>
            """)
        if profit_margin is not None:
            metric_rows.append(f"""
                <tr>
                    <td style="padding: 8px 16px 8px 0; color: #6b7280; font-size: 14px; white-space: nowrap;">Margin</td>
                    <td style="padding: 8px 24px 8px 0; font-weight: 600; color: #111827; font-size: 15px;">{profit_margin:.1f}%</td>
                </tr>
            """)
        if selling_multiple is not None:
            metric_rows.append(f"""
                <tr>
                    <td style="padding: 8px 16px 8px 0; color: #6b7280; font-size: 14px; white-space: nowrap;">Multiple</td>
                    <td style="padding: 8px 24px 8px 0; font-weight: 600; color: #111827; font-size: 15px;">{selling_multiple:.1f}x</td>
                </tr>
            """)

        return f"""
            <div style="margin-bottom: 24px; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: white;">
                <div style="display: flex; flex-direction: column; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 600; line-height: 1.4;">
                        {listing.get('title', 'Untitled Listing')}
                    </h3>
                    <a href="{listing.get('listing_url', '#')}" 
                       style="display: inline-flex; align-items: center; justify-content: center; padding: 8px 16px; 
                              background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; 
                              font-size: 14px; font-weight: 500; transition: all 0.2s; border: 1px solid #2563eb; 
                              width: fit-content;">
                        View Details →
                    </a>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 24px;">
                    <table style="border-collapse: collapse; width: 100%; max-width: 300px;">
                        <tbody>
                            {''.join(metric_rows)}
                        </tbody>
                    </table>
                    
                    <div style="flex: 1;">
                        <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-bottom: 12px; 
                                    padding: 8px 12px; background-color: #f9fafb; border-radius: 6px;">
                            <div style="color: #4b5563; font-size: 14px;">
                                <span style="color: #6b7280;">🏢</span> {listing.get('industry', 'Not specified')}
                            </div>
                            <div style="color: #d1d5db;">|</div>
                            <div style="color: #4b5563; font-size: 14px;">
                                <span style="color: #6b7280;">🤝</span> {listing.get('source_platform', 'Not specified')}
                            </div>
                        </div>
                        
                        <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                            {(listing.get('description') or '')[:200]}...
                        </p>
                    </div>
                </div>
            </div>
        """

    def generate_html_content(self, user: Dict, listings: Dict[str, List[Dict]]) -> str:
        """Generate personalized HTML email content"""
        exact_matches = listings.get('exact_matches', [])
        other_matches = listings.get('other_matches', [])
        
        if not exact_matches and not other_matches:
            return f"""
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                            max-width: 600px; margin: 0 auto; padding: 24px;">
                    <h1 style="color: #111827; font-size: 24px; margin-bottom: 16px;">No New Matches Today</h1>
                    <p style="color: #4b5563; font-size: 16px;">There are no new listings matching your criteria today. We'll keep looking!</p>
                </div>
            """
            
        # Add the alert criteria to the search criteria section
        alert = user['alert']
        criteria_items = []
        
        # Basic criteria
        if alert.get('min_price') is not None or alert.get('max_price') is not None:
            criteria_items.append(f"Price Range: {self.format_currency(alert.get('min_price', 0))} - {self.format_currency(alert.get('max_price', 'Any'))}")
        if alert.get('industries'):
            criteria_items.append(f"Industries: {', '.join(alert.get('industries', []))}")

        # Advanced criteria
        advanced_items = []
        if alert.get('preferred_business_models') and len(alert.get('preferred_business_models', [])) > 0:
            advanced_items.append(f"Business Models: {', '.join(alert.get('preferred_business_models', []))}")
        if alert.get('min_business_age') is not None or alert.get('max_business_age') is not None:
            advanced_items.append(f"Business Age: {alert.get('min_business_age', '0')} - {alert.get('max_business_age', 'Any')} years")
        if alert.get('min_employees') is not None or alert.get('max_employees') is not None:
            advanced_items.append(f"Team Size: {alert.get('min_employees', '0')} - {alert.get('max_employees', 'Any')} employees")
        if alert.get('min_profit_margin') is not None or alert.get('max_profit_margin') is not None:
            advanced_items.append(f"Profit Margin: {alert.get('min_profit_margin', '0')}% - {alert.get('max_profit_margin', 'Any')}%")
        if alert.get('min_selling_multiple') is not None or alert.get('max_selling_multiple') is not None:
            advanced_items.append(f"Selling Multiple: {alert.get('min_selling_multiple', '0')}x - {alert.get('max_selling_multiple', 'Any')}x")
        if alert.get('min_ebitda') is not None or alert.get('max_ebitda') is not None:
            advanced_items.append(f"EBITDA: {self.format_currency(alert.get('min_ebitda', 0))} - {self.format_currency(alert.get('max_ebitda', 'Any'))}")
        if alert.get('min_annual_revenue') is not None or alert.get('max_annual_revenue') is not None:
            advanced_items.append(f"Annual Revenue: {self.format_currency(alert.get('min_annual_revenue', 0))} - {self.format_currency(alert.get('max_annual_revenue', 'Any'))}")

        search_criteria_html = f"""
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 32px;">
                <h3 style="margin: 0 0 12px 0; color: #111827; font-size: 16px;">Alert Criteria{f": {alert.get('name')}" if alert.get('name') else ''}</h3>
                <div style="color: #4b5563; font-size: 14px; line-height: 1.6;">
                    <div style="margin-bottom: 8px;">
                        <strong>Basic Criteria:</strong><br>
                        {' • '.join(criteria_items)}
                    </div>
                    {f'<div style="margin-top: 8px;"><strong>Advanced Criteria:</strong><br>{" • ".join(advanced_items)}</div>' if advanced_items else ''}
                </div>
            </div>
        """
        
        # Generate HTML for exact matches
        exact_matches_html = ""
        if exact_matches:
            exact_matches_html = f"""
                <div style="margin-top: 32px;">
                    <h2 style="color: #111827; font-size: 20px; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #2563eb;">
                        🎯 Exact Matches ({len(exact_matches)})
                    </h2>
                    <p style="color: #4b5563; font-size: 14px; margin-bottom: 16px;">
                        These listings exactly match your search keywords:
                    </p>
                    {''.join(self.generate_listing_html(listing) for listing in exact_matches)}
                </div>
            """

        # Generate HTML for other matches
        other_matches_html = ""
        if other_matches:
            other_matches_html = f"""
                <div style="margin-top: 32px;">
                    <h2 style="color: #111827; font-size: 20px; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #6b7280;">
                        📋 Other Matches ({len(other_matches)})
                    </h2>
                    <p style="color: #4b5563; font-size: 14px; margin-bottom: 16px;">
                        These listings match your industry and filter criteria:
                    </p>
                    {''.join(self.generate_listing_html(listing) for listing in other_matches)}
                </div>
            """
        
        return f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    @media only screen and (max-width: 600px) {{
                        .email-container {{
                            padding: 16px !important;
                        }}
                        .listing-container {{
                            padding: 16px !important;
                        }}
                        .metrics-container {{
                            flex-direction: column !important;
                        }}
                        .metrics-table {{
                            margin-bottom: 16px !important;
                        }}
                        .view-details-btn {{
                            width: 100% !important;
                            text-align: center !important;
                        }}
                    }}
                </style>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f3f4f6;">
                <div class="email-container" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                            max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f3f4f6;">
                    <h1 style="color: #111827; font-size: 24px; margin-bottom: 24px;">
                        {alert.get('name', 'Your')} - Deal Alert
                    </h1>
                    
                    {search_criteria_html}
                    {exact_matches_html}
                    {other_matches_html}
                    
                    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #d1d5db; color: #6b7280; font-size: 14px; text-align: center;">
                        <p style="margin-bottom: 12px;">
                            To update your preferences or unsubscribe, visit your 
                            <a href="https://dealsight.co/dashboard/preferences" 
                               style="color: #2563eb; text-decoration: none;">dashboard</a>.
                        </p>
                        <p style="color: #9ca3af; font-size: 12px;">
                            © 2024 DealSight. All rights reserved.
                        </p>
                    </div>
                </div>
            </body>
            </html>
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
                    print(f"Newsletter details:")
                    print(f"- Created: {newsletter.get('created_at')}")
                    print(f"- Scheduled for: {newsletter.get('scheduled_for')}")
                    print(f"- User ID: {newsletter.get('user_id')}")
                    print(f"- Alert ID: {newsletter.get('alert_id')}")
                    
                    # Mark as processing to prevent duplicate sends
                    self.db.update_newsletter_status(newsletter['id'], 'processing')
                    
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
                    
                    # Check if there are any matches
                    exact_matches = matching_listings.get('exact_matches', [])
                    other_matches = matching_listings.get('other_matches', [])
                    if not exact_matches and not other_matches:
                        skip_msg = f"No matching listings found for alert '{alert['name']}' since last notification at {alert.get('last_notification_sent', 'Never')}"
                        print(f"ℹ️ {skip_msg}")
                        self.db.update_newsletter_status(newsletter['id'], 'skipped', skip_msg)
                        # Update last notification sent timestamp even when skipped
                        self.db.client.table('alerts')\
                            .update({'last_notification_sent': datetime.now(UTC).isoformat()})\
                            .eq('id', alert['id'])\
                            .execute()
                        print(f"✅ Updated last notification timestamp for alert")
                        continue
                    
                    print(f"✅ Found {len(exact_matches)} exact matches and {len(other_matches)} other matches")
                    
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
                        # Update newsletter status to sent
                        self.db.update_newsletter_status(newsletter['id'], 'sent')
                        print(f"✅ Updated newsletter status to sent")
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