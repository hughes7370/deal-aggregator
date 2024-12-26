-- First, delete any user_preferences records that don't have a matching user
DELETE FROM public.user_preferences
WHERE user_id NOT IN (SELECT id FROM public.users);

-- Now add the foreign key constraint
ALTER TABLE public.user_preferences
ADD CONSTRAINT fk_user_preferences_user
FOREIGN KEY (user_id)
REFERENCES public.users (id)
ON DELETE CASCADE;

-- Add index to improve join performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id
ON public.user_preferences(user_id); 