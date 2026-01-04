-- Add preferred_language column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN preferred_language TEXT DEFAULT 'it';

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.preferred_language IS 'User preferred language for emails and notifications (it, en, fr, de, es, pt, nl, pl)';