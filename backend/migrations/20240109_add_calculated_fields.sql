-- Add calculated fields to listings table
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS profit_margin DECIMAL GENERATED ALWAYS AS (
    CASE 
        WHEN revenue > 0 THEN (ebitda::DECIMAL / revenue::DECIMAL) * 100
        ELSE NULL 
    END
) STORED,
ADD COLUMN IF NOT EXISTS selling_multiple DECIMAL GENERATED ALWAYS AS (
    CASE 
        WHEN ebitda > 0 THEN asking_price::DECIMAL / ebitda::DECIMAL
        ELSE NULL
    END
) STORED;

-- Create indexes for the new calculated fields
CREATE INDEX IF NOT EXISTS idx_listings_profit_margin ON listings(profit_margin);
CREATE INDEX IF NOT EXISTS idx_listings_selling_multiple ON listings(selling_multiple); 