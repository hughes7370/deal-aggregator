-- Modify users table to make email optional
ALTER TABLE users ALTER COLUMN email DROP NOT NULL; 