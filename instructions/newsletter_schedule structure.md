The way this will work is as follows:

1. We will need to run the scraper to get the latest deals (right now we are using main.py)

2. We will need to run the newsletter_schedule.py to get the latest deals from 'listings' table, and then send them out based on the frequency of the newsletter specified in the 'newsletter_frequency' for each user. and then filter them based on the criteria specified in the 'min_price' and 'max_price' and 'industry' for each user and send them to the newsletter subscribers.

Here are the table and field names extracted from the image:

**Table Name**: `listings`

**Fields**:
1. `id` (uuid)
2. `listing_url` (text)
3. `source_platform` (text)
4. `title` (text)
5. `asking_price` (int4)
6. `revenue` (int4)
7. `ebitda` (int4)
8. `industry` (text)
9. `location` (text)
10. `description` (text)
11. `full_description` (text)
12. `business_highlights` (jsonb)
13. `financial_details` (jsonb)
14. `business_details` (jsonb)
15. `raw_data` (jsonb)
16. `status` (text)
17. `first_seen_at` (timestamptz)
18. `last_seen_at` (timestamptz)
19. `created_at` (timestamptz)
20. `updated_at` (timestamptz)


Here are the table and field names extracted from the image:

**Table Name**: `user_preferences`

**Fields**:
1. `id` (uuid)  
2. `user_id` (text)  
3. `min_price` (int4)  
4. `max_price` (int4)  
5. `industries` (_text)  
6. `geographic_regions` (_text)  
7. `business_models` (_text)  
8. `newsletter_frequency` (text)  
9. `exclude_keywords` (_text)  
10. `include_keywords` (_text)  
11. `last_notification_sent` (timestamptz)  
12. `created_at` (timestamptz)  
13. `updated_at` (timestamptz)  


3. We will use our Resend service to send the emails to the newsletter subscribers which I believe we have the code for.

4. We will also need to make sure we are storing the newsletter logs which are in the 'newsletter_logs' table: Here are the table and field names extracted from the image for your dev:

**Table Name**: `newsletter_logs`

**Fields**:
1. `id` (uuid)
2. `user_id` (text)
3. `analysis_id` (uuid)
4. `status` (text)
5. `scheduled_for` (timestamptz)
6. `sent_at` (timestamptz)
7. `error_message` (text)
8. `created_at` (timestamptz)
9. `updated_at` (timestamptz)