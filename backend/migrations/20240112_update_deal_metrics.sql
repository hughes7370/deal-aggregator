-- Add necessary columns to deal_tracker if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'deal_tracker' AND column_name = 'priority') THEN
        ALTER TABLE deal_tracker ADD COLUMN priority text DEFAULT 'Medium';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'deal_tracker' AND column_name = 'next_steps') THEN
        ALTER TABLE deal_tracker ADD COLUMN next_steps text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'deal_tracker' AND column_name = 'due_date') THEN
        ALTER TABLE deal_tracker ADD COLUMN due_date timestamp with time zone;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'deal_tracker' AND column_name = 'action_type') THEN
        ALTER TABLE deal_tracker ADD COLUMN action_type text;
    END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deal_tracker_priority ON deal_tracker(priority);
CREATE INDEX IF NOT EXISTS idx_deal_tracker_next_steps ON deal_tracker(next_steps);
CREATE INDEX IF NOT EXISTS idx_deal_tracker_due_date ON deal_tracker(due_date);
CREATE INDEX IF NOT EXISTS idx_listings_business_model ON listings(business_model);
CREATE INDEX IF NOT EXISTS idx_user_saved_listings_saved_at ON user_saved_listings(saved_at);

-- Drop existing deal_metrics view if it exists
DROP VIEW IF EXISTS deal_metrics;

-- Create a more comprehensive deal_metrics view
CREATE OR REPLACE VIEW deal_metrics AS
WITH stage_metrics AS (
  SELECT 
    usl.user_id,
    dt.stage,
    COUNT(*) as deal_count,
    SUM(l.asking_price) as total_value,
    AVG(l.asking_price) as avg_deal_size,
    AVG(l.selling_multiple) as avg_multiple,
    AVG(l.revenue / 12) as avg_monthly_revenue
  FROM user_saved_listings usl
  JOIN listings l ON usl.listing_id = l.id
  LEFT JOIN deal_tracker dt ON usl.listing_id = dt.listing_id
  GROUP BY usl.user_id, dt.stage
),
priority_counts AS (
  SELECT 
    usl.user_id,
    dt.priority,
    COUNT(*) as count
  FROM user_saved_listings usl
  LEFT JOIN deal_tracker dt ON usl.listing_id = dt.listing_id
  WHERE dt.priority IS NOT NULL
  GROUP BY usl.user_id, dt.priority
),
next_steps AS (
  SELECT 
    usl.user_id,
    dt.next_steps,
    COUNT(*) as count,
    MIN(dt.due_date) as next_due_date
  FROM user_saved_listings usl
  LEFT JOIN deal_tracker dt ON usl.listing_id = dt.listing_id
  WHERE dt.next_steps IS NOT NULL
  GROUP BY usl.user_id, dt.next_steps
),
business_types AS (
  SELECT 
    usl.user_id,
    l.business_model,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY usl.user_id), 2) as percentage
  FROM user_saved_listings usl
  JOIN listings l ON usl.listing_id = l.id
  GROUP BY usl.user_id, l.business_model
),
recent_activity AS (
  SELECT 
    usl.user_id,
    usl.listing_id,
    l.title as business_name,
    dt.status,
    dt.last_updated,
    dt.action_type,
    ROW_NUMBER() OVER (PARTITION BY usl.user_id ORDER BY dt.last_updated DESC) as rn
  FROM user_saved_listings usl
  JOIN listings l ON usl.listing_id = l.id
  LEFT JOIN deal_tracker dt ON usl.listing_id = dt.listing_id
  WHERE dt.last_updated >= NOW() - INTERVAL '7 days'
)
SELECT 
  usl.user_id,
  -- Overall metrics
  COUNT(DISTINCT usl.id) as total_deals,
  COUNT(DISTINCT CASE WHEN usl.saved_at >= NOW() - INTERVAL '30 days' THEN usl.id END) as recent_deals,
  
  -- Stage metrics
  jsonb_agg(DISTINCT jsonb_build_object(
    'stage', COALESCE(sm.stage, 'Interested'),
    'count', sm.deal_count,
    'value', sm.total_value
  )) as stages,
  
  -- Priority metrics
  jsonb_agg(DISTINCT jsonb_build_object(
    'priority', pc.priority,
    'count', pc.count
  )) as priorities,
  
  -- Next steps
  jsonb_agg(DISTINCT jsonb_build_object(
    'type', ns.next_steps,
    'count', ns.count,
    'next_due', ns.next_due_date
  )) as next_steps,
  
  -- Deal metrics
  ROUND(AVG(l.asking_price)) as avg_deal_size,
  ROUND(AVG(l.selling_multiple), 1) as avg_multiple,
  ROUND(AVG(l.revenue / 12)) as avg_monthly_revenue,
  
  -- Business type distribution
  jsonb_agg(DISTINCT jsonb_build_object(
    'type', bt.business_model,
    'count', bt.count,
    'percentage', bt.percentage
  )) as business_types,
  
  -- Recent activity
  jsonb_agg(DISTINCT jsonb_build_object(
    'id', ra.listing_id,
    'business_name', ra.business_name,
    'status', ra.status,
    'action_type', ra.action_type,
    'timestamp', ra.last_updated
  )) FILTER (WHERE ra.rn <= 10) as recent_activity,
  
  -- Last updated
  MAX(dt.last_updated) as last_updated
FROM user_saved_listings usl
JOIN listings l ON usl.listing_id = l.id
LEFT JOIN deal_tracker dt ON usl.listing_id = dt.listing_id
LEFT JOIN stage_metrics sm ON usl.user_id = sm.user_id
LEFT JOIN priority_counts pc ON usl.user_id = pc.user_id
LEFT JOIN next_steps ns ON usl.user_id = ns.user_id
LEFT JOIN business_types bt ON usl.user_id = bt.user_id
LEFT JOIN recent_activity ra ON usl.user_id = ra.user_id
GROUP BY usl.user_id; 