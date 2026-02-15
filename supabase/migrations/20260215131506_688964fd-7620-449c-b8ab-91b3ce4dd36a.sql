
-- Allow all authenticated users to view all referrals (for leaderboard)
CREATE POLICY "Authenticated users can view all referrals for leaderboard"
ON public.referrals FOR SELECT
USING (auth.uid() IS NOT NULL);
