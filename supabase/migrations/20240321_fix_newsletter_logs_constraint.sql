-- Drop existing foreign key constraint
ALTER TABLE newsletter_logs
DROP CONSTRAINT IF EXISTS newsletter_logs_alert_id_fkey;

-- Add new foreign key constraint with ON DELETE CASCADE
ALTER TABLE newsletter_logs
ADD CONSTRAINT newsletter_logs_alert_id_fkey
FOREIGN KEY (alert_id)
REFERENCES alerts(id)
ON DELETE CASCADE; 