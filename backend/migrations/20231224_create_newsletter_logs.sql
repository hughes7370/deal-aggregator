-- Create newsletter_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS newsletter_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    analysis_id UUID,
    status TEXT DEFAULT 'pending',
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_newsletter_logs_user_id ON newsletter_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_logs_status ON newsletter_logs(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_logs_scheduled_for ON newsletter_logs(scheduled_for);

-- Add trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_newsletter_logs_updated_at ON newsletter_logs;
CREATE TRIGGER update_newsletter_logs_updated_at
    BEFORE UPDATE ON newsletter_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 