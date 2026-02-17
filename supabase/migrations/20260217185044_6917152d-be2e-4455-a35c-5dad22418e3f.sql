
-- Add is_paused column to profiles
ALTER TABLE public.profiles ADD COLUMN is_paused boolean DEFAULT false;

-- Drop and recreate the policy that controls profile visibility to exclude paused males
DROP POLICY IF EXISTS "Users can view other non-blocked profiles" ON public.profiles;

CREATE POLICY "Users can view other non-blocked profiles"
ON public.profiles
FOR SELECT
USING (
  (auth.uid() <> id)
  AND (is_blocked = false)
  AND (COALESCE(is_paused, false) = false)
  AND ((gender = 'female'::gender) OR (photo_verification_status = 'verified'::verification_status))
  AND (NOT is_blocked_between(auth.uid(), id))
  AND viewer_in_age_range(auth.uid(), id)
);
