-- Create a security definer function to check if a viewer is within a profile's age preferences
-- This avoids infinite recursion in the RLS policy
CREATE OR REPLACE FUNCTION public.viewer_in_age_range(_viewer_id uuid, _profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      -- If the profile doesn't have unlocked age preferences, always return true
      WHEN NOT COALESCE((SELECT age_preferences_unlocked FROM public.profiles WHERE id = _profile_id), false) THEN true
      -- If the viewer is male, always return true (males can see other males)
      WHEN (SELECT gender FROM public.profiles WHERE id = _viewer_id) = 'male' THEN true
      -- If the viewer is female, check if their age is within the profile's preferences
      WHEN (SELECT gender FROM public.profiles WHERE id = _viewer_id) = 'female' THEN
        (SELECT 
          EXTRACT(YEAR FROM age(current_date, birth_date::date)) >= COALESCE((SELECT min_age_preference FROM public.profiles WHERE id = _profile_id), 18)
          AND EXTRACT(YEAR FROM age(current_date, birth_date::date)) <= COALESCE((SELECT max_age_preference FROM public.profiles WHERE id = _profile_id), 100)
        FROM public.profiles WHERE id = _viewer_id)
      ELSE true
    END;
$$;

-- Recreate the policy using the new function to avoid infinite recursion
DROP POLICY IF EXISTS "Users can view other non-blocked profiles" ON public.profiles;

CREATE POLICY "Users can view other non-blocked profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() <> id
  AND is_blocked = false
  AND (gender = 'female' OR photo_verification_status = 'verified')
  AND NOT public.is_blocked_between(auth.uid(), profiles.id)
  AND public.viewer_in_age_range(auth.uid(), profiles.id)
);