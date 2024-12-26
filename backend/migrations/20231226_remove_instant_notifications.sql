-- Update any 'instant' preferences to 'daily' (though you mentioned there aren't any)
UPDATE public.user_preferences
SET newsletter_frequency = 'daily'
WHERE newsletter_frequency = 'instant';

-- Add check constraint to ensure only valid frequencies are allowed
ALTER TABLE public.user_preferences
ADD CONSTRAINT check_newsletter_frequency
CHECK (newsletter_frequency IN ('daily', 'weekly', 'monthly')); 