-- Drop and recreate the policy to also hide profiles that the current user has blocked
DROP POLICY IF EXISTS "Users can view other non-blocked profiles" ON public.profiles;

CREATE POLICY "Users can view other non-blocked profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() <> id 
  AND is_blocked = false 
  AND (gender = 'female' OR photo_verification_status = 'verified')
  AND NOT EXISTS (
    SELECT 1 FROM public.blocked_users 
    WHERE blocked_id = auth.uid() AND blocker_id = profiles.id
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.blocked_users 
    WHERE blocker_id = auth.uid() AND blocked_id = profiles.id
  )
);