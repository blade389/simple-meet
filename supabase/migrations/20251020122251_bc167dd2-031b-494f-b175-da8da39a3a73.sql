-- Fix RLS policy to allow users to always see their own profile
DROP POLICY IF EXISTS "Users can view non-blocked profiles" ON public.profiles;

-- Create two separate policies for better control
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can view other non-blocked profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() != id 
  AND is_blocked = false 
  AND (gender = 'female'::gender OR photo_verification_status = 'verified'::verification_status)
);