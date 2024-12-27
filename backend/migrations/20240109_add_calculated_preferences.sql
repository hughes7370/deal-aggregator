-- Add profit margin and selling multiple preference ranges
ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS min_profit_margin DECIMAL,
ADD COLUMN IF NOT EXISTS max_profit_margin DECIMAL,
ADD COLUMN IF NOT EXISTS min_selling_multiple DECIMAL,
ADD COLUMN IF NOT EXISTS max_selling_multiple DECIMAL;

-- Add check constraints for the ranges
ALTER TABLE public.user_preferences
ADD CONSTRAINT check_profit_margin_range
CHECK (min_profit_margin <= max_profit_margin),
ADD CONSTRAINT check_selling_multiple_range
CHECK (min_selling_multiple <= max_selling_multiple);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_profit_margin 
ON user_preferences(min_profit_margin, max_profit_margin);
CREATE INDEX IF NOT EXISTS idx_user_preferences_selling_multiple 
ON user_preferences(min_selling_multiple, max_selling_multiple); 