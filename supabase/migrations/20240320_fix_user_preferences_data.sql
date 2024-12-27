-- First, remove the existing foreign key if it exists
ALTER TABLE user_preferences
DROP CONSTRAINT IF EXISTS fk_user_preferences_user;

-- Clean up any orphaned preferences (preferences without a matching user)
DELETE FROM user_preferences
WHERE user_id NOT IN (SELECT id FROM users);

-- Now add the foreign key constraint
ALTER TABLE user_preferences
ADD CONSTRAINT fk_user_preferences_user
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

-- Add indexes to improve query performance
DROP INDEX IF EXISTS idx_user_preferences_user_id;
DROP INDEX IF EXISTS idx_user_preferences_newsletter_frequency;
DROP INDEX IF EXISTS idx_user_preferences_industries;
DROP INDEX IF EXISTS idx_user_preferences_preferred_business_models;

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_newsletter_frequency ON user_preferences(newsletter_frequency);
CREATE INDEX idx_user_preferences_industries ON user_preferences USING GIN (industries);
CREATE INDEX idx_user_preferences_preferred_business_models ON user_preferences USING GIN (preferred_business_models); 