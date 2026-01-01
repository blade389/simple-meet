-- Add column to track if male user has unlocked age preferences editing
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS age_preferences_unlocked boolean DEFAULT false;

-- Update all existing male profiles to have default age preferences if not set
UPDATE public.profiles 
SET min_age_preference = 18, max_age_preference = 100
WHERE gender = 'male' AND (min_age_preference IS NULL OR max_age_preference IS NULL);