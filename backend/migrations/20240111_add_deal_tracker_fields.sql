-- Add stage field to deal_tracker if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'deal_tracker' AND column_name = 'stage') THEN
        ALTER TABLE deal_tracker ADD COLUMN stage text DEFAULT 'Initial Review';
    END IF;
END $$;

-- Ensure stage has proper constraints and default value
ALTER TABLE deal_tracker 
    ALTER COLUMN stage SET NOT NULL,
    ADD CONSTRAINT deal_tracker_stage_check 
    CHECK (stage IN (
        'Initial Review',
        'Research',
        'Contact',
        'Negotiation',
        'Due Diligence',
        'Closed'
    ));

-- Add indexes for better performance on aggregated queries
CREATE INDEX IF NOT EXISTS idx_deal_tracker_stage ON deal_tracker(stage);
CREATE INDEX IF NOT EXISTS idx_deal_tracker_status ON deal_tracker(status);
CREATE INDEX IF NOT EXISTS idx_deal_tracker_last_updated ON deal_tracker(last_updated);

-- Add index on business_model for better performance on business type aggregation
CREATE INDEX IF NOT EXISTS idx_listings_business_model ON listings(business_model);

-- Add helpful view for aggregated metrics
CREATE OR REPLACE VIEW deal_metrics AS
SELECT 
    user_id,
    COUNT(*) as total_deals,
    AVG(l.asking_price) as avg_deal_size,
    COUNT(CASE WHEN usl.saved_at > NOW() - INTERVAL '30 days' THEN 1 END) as recent_deals,
    json_agg(DISTINCT l.business_model) as business_types,
    json_agg(DISTINCT dt.stage) as stages,
    json_agg(DISTINCT dt.status) as statuses
FROM user_saved_listings usl
JOIN listings l ON usl.listing_id = l.id
LEFT JOIN deal_tracker dt ON usl.listing_id = dt.listing_id
GROUP BY user_id; 