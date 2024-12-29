async def run_test():
    try:
        # Initialize services
        supabase = SupabaseClient()
        
        print("🔍 Fetching active users...")
        # First get active users
        users_result = supabase.client.table('users')\
            .select('id, email')\
            .execute()
            
        if not users_result.data:
            print("❌ No active users found in database")
            return
            
        print(f"✅ Found {len(users_result.data)} active users")
        
        # Process each user
        for user in users_result.data:
            print(f"\n📧 Processing user: {user['email']}")
            
            # Get user preferences in a separate query
            preferences_result = supabase.client.table('alerts')\
                .select('*')\
                .eq('user_id', user['id'])\
                .execute()
            
            if not preferences_result.data:
                print(f"⚠️ No alerts found for user {user['email']}")
                continue
            
            for alert in preferences_result.data:
                try:
                    # Get user data
                    user_result = supabase.client.table('users')\
                        .select('*')\
                        .eq('id', alert['user_id'])\
                        .single()\
                        .execute()
                        
                    if not user_result.data:
                        print(f"⚠️ User not found for alert {alert['id']}")
                        continue
                        
                    print(f"Newsletter frequency: {alert['newsletter_frequency']}")
                    
                    # Get matching listings
                    listings_result = supabase.client.table('listings')\
                        .select('*')\
                        .gte('asking_price', alert['min_price'])\
                        .lte('asking_price', alert['max_price'])\
                        .in_('industry', alert['industries'])\
                        .execute()
                        
                    if not listings_result.data:
                        print(f"ℹ️ No matching listings found for user {user['email']}")
                        continue
                        
                    print(f"📑 Found {len(listings_result.data)} matching listings")
                    
                    # Initialize newsletter service with explicit from_email
                    newsletter_service = NewsletterService()
                    newsletter_service.from_email = os.getenv('RESEND_FROM_EMAIL', 'alerts@dealsight.co')
                    
                    # Send test newsletter
                    print(f"📤 Sending newsletter to {user['email']}...")
                    print(f"Using from email: {newsletter_service.from_email}")
                    email_id = newsletter_service.send_newsletter(
                        user={
                            'email': user['email'],
                            'alert': alert
                        },
                        listings=listings_result.data
                    )
                    
                    if email_id:
                        print(f"✅ Newsletter sent successfully to {user['email']}!")
                        print(f"Email ID: {email_id}")
                    else:
                        print(f"❌ Failed to send newsletter to {user['email']}")
                    
                    # Add a small delay between sends to avoid rate limits
                    await asyncio.sleep(1)
                    
                except Exception as e:
                    print(f"❌ Error processing user {alert.get('user_id')}: {str(e)}")
                    continue
                    
    except Exception as e:
        print(f"❌ Error during testing: {str(e)}")
        raise e
    finally:
        print("📝 Newsletter test completed")

if __name__ == "__main__":
    # Verify environment
    required_vars = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'RESEND_API_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"  - {var}")
        exit(1)
        
    print("🚀 Starting newsletter test...")
    asyncio.run(run_test()) 