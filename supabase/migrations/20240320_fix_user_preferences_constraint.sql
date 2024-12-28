-- Drop existing foreign key constraint
ALTER TABLE alerts
DROP CONSTRAINT IF EXISTS alerts_user_id_fkey;

-- Drop existing index
DROP INDEX IF EXISTS idx_alerts_user_id;

-- Create trigger function to ensure user exists
CREATE OR REPLACE FUNCTION ensure_user_exists()
RETURNS TRIGGER AS $$
BEGIN
  -- If the user doesn't exist in the users table, create it
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = NEW.user_id) THEN
    INSERT INTO users (id) VALUES (NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS ensure_user_exists_trigger ON alerts;
CREATE TRIGGER ensure_user_exists_trigger
BEFORE INSERT OR UPDATE ON alerts
FOR EACH ROW
EXECUTE FUNCTION ensure_user_exists();

-- Add the foreign key constraint back
ALTER TABLE alerts
ADD CONSTRAINT alerts_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

-- Recreate the index
CREATE INDEX idx_alerts_user_id ON alerts(user_id); 