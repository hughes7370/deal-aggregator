-- First try to update from auth.users
UPDATE users u
SET email = au.email
FROM auth.users au
WHERE u.id = au.id::text
AND u.email IS NULL;

-- If still NULL, try to get from user_preferences
UPDATE users u
SET email = up.email
FROM user_preferences up
WHERE u.id = up.user_id
AND u.email IS NULL
AND up.email IS NOT NULL;

-- Show any remaining users with NULL emails
SELECT id, email, created_at
FROM users
WHERE email IS NULL; 