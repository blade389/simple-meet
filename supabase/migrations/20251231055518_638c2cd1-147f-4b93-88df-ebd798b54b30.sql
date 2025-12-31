-- Allow admins to manage moderation flows that require reading/updating other users' data

-- match_requests: admins must be able to see match metadata referenced by conversation_reviews
CREATE POLICY "Admins can view all match requests"
ON public.match_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- match_requests: admins must be able to close/block chats after review
CREATE POLICY "Admins can update match requests"
ON public.match_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- profiles: admins need to see names/gender even if profiles are blocked/unverified
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- profiles: admins need to block users from the review screen
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- tokens: admins need to read/update token balances for moderation actions
CREATE POLICY "Admins can view all tokens"
ON public.tokens
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all tokens"
ON public.tokens
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));
