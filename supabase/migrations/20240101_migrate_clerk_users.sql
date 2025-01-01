-- Create a function to migrate alerts for users with the same email
CREATE OR REPLACE FUNCTION migrate_user_alerts()
RETURNS void AS $$
DECLARE
    old_user RECORD;
    new_user RECORD;
BEGIN
    -- For each email in the users table that has multiple user records
    FOR old_user IN 
        SELECT DISTINCT u1.* 
        FROM users u1
        JOIN users u2 ON u1.email = u2.email AND u1.id != u2.id
        WHERE u1.created_at < u2.created_at
    LOOP
        -- Get the newest user record for this email
        SELECT * INTO new_user
        FROM users
        WHERE email = old_user.email
        ORDER BY created_at DESC
        LIMIT 1;

        -- Update alerts to use the new user ID
        UPDATE alerts
        SET user_id = new_user.id
        WHERE user_id = old_user.id;

        -- Delete the old user record
        DELETE FROM users
        WHERE id = old_user.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the migration
SELECT migrate_user_alerts(); 