-- Update the profiles SELECT policy to hide male profiles from women outside their preferred age range
-- Only applies when the male has unlocked age preferences

DROP POLICY IF EXISTS "Users can view other non-blocked profiles" ON public.profiles;

CREATE POLICY "Users can view other non-blocked profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() <> id
  AND is_blocked = false
  AND (gender = 'female' OR photo_verification_status = 'verified')
  AND NOT public.is_blocked_between(auth.uid(), profiles.id)
  -- If viewing a male profile with unlocked age preferences, check if viewer's age is within range
  AND (
    -- Not a male profile, show it
    gender = 'female'
    OR
    -- Male profile without unlocked preferences, show it
    age_preferences_unlocked = false OR age_preferences_unlocked IS NULL
    OR
    -- Male profile with unlocked preferences, check viewer's age
    (
      age_preferences_unlocked = true
      AND EXISTS (
        SELECT 1 FROM public.profiles viewer
        WHERE viewer.id = auth.uid()
        AND viewer.gender = 'female'
        AND EXTRACT(YEAR FROM age(current_date, viewer.birth_date::date)) >= COALESCE(profiles.min_age_preference, 18)
        AND EXTRACT(YEAR FROM age(current_date, viewer.birth_date::date)) <= COALESCE(profiles.max_age_preference, 100)
      )
    )
    OR
    -- Viewer is male (can see other males)
    EXISTS (
      SELECT 1 FROM public.profiles viewer
      WHERE viewer.id = auth.uid()
      AND viewer.gender = 'male'
    )
  )
);