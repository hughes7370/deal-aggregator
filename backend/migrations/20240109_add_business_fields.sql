-- Add new fields to listings table
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS business_age INTEGER,
ADD COLUMN IF NOT EXISTS number_of_employees INTEGER,
ADD COLUMN IF NOT EXISTS business_model TEXT;

-- Add check constraint to ensure business_model is one of the expected values
ALTER TABLE public.listings
ADD CONSTRAINT check_business_model
CHECK (business_model IN ('SaaS', 'FBA', 'Content', 'Service', 'E-commerce', 'Marketplace', 'Other'));

-- Add new preference fields to user_preferences table
ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS min_business_age INTEGER,
ADD COLUMN IF NOT EXISTS max_business_age INTEGER,
ADD COLUMN IF NOT EXISTS min_employees INTEGER,
ADD COLUMN IF NOT EXISTS max_employees INTEGER,
ADD COLUMN IF NOT EXISTS preferred_business_models TEXT[];

-- Add check constraints for the ranges
ALTER TABLE public.user_preferences
ADD CONSTRAINT check_business_age_range
CHECK (min_business_age <= max_business_age),
ADD CONSTRAINT check_employees_range
CHECK (min_employees <= max_employees);

-- Create index for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_listings_business_model ON listings(business_model);
CREATE INDEX IF NOT EXISTS idx_listings_business_age ON listings(business_age);
CREATE INDEX IF NOT EXISTS idx_listings_employees ON listings(number_of_employees); 