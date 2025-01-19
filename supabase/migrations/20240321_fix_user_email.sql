-- Drop existing trigger and function
DROP TRIGGER IF EXISTS ensure_user_exists_trigger ON alerts;
DROP FUNCTION IF EXISTS ensure_user_exists;

-- Create improved trigger function that handles email
CREATE OR REPLACE FUNCTION ensure_user_exists()
RETURNS TRIGGER AS $$
BEGIN
  -- If the user doesn't exist in the users table, try to get email from auth.users
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = NEW.user_id) THEN
    INSERT INTO users (id, email)
    SELECT NEW.user_id, email
    FROM auth.users
    WHERE id::text = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER ensure_user_exists_trigger
BEFORE INSERT OR UPDATE ON alerts
FOR EACH ROW
EXECUTE FUNCTION ensure_user_exists();

-- Fix existing null emails by updating from auth.users
UPDATE users u
SET email = au.email
FROM auth.users au
WHERE u.id = au.id::text
AND u.email IS NULL; 