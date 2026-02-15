
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service role can insert referrals" ON public.referrals;

-- Create a more restrictive insert policy - users can only create referrals where they are the referred user
CREATE POLICY "Users can create own referral record"
ON public.referrals FOR INSERT
WITH CHECK (auth.uid() = referred_user_id);
