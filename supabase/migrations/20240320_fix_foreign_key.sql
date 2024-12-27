-- Drop existing foreign key constraint
ALTER TABLE user_preferences
DROP CONSTRAINT IF EXISTS fk_user_preferences_user;

-- Drop existing index
DROP INDEX IF EXISTS idx_user_preferences_user_id;

-- Create new foreign key constraint
ALTER TABLE user_preferences
ADD CONSTRAINT fk_user_preferences_user
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE
DEFERRABLE INITIALLY DEFERRED;

-- Recreate the index
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id); 