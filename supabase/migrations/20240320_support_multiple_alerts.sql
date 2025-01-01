-- Add alert_id column to newsletter_logs table
ALTER TABLE newsletter_logs
ADD COLUMN IF NOT EXISTS alert_id UUID REFERENCES alerts(id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_newsletter_logs_alert_id ON newsletter_logs(alert_id); 