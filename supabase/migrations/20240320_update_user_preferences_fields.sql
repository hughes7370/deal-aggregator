-- Drop old annual profit columns
ALTER TABLE user_preferences
DROP COLUMN IF EXISTS min_annual_profit,
DROP COLUMN IF EXISTS max_annual_profit;

-- Add EBITDA columns
ALTER TABLE user_preferences
ADD COLUMN min_ebitda numeric,
ADD COLUMN max_ebitda numeric; 