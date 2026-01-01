-- Security-definer helper to check blocks without being affected by RLS on blocked_users
CREATE OR REPLACE FUNCTION public.is_blocked_between(_a uuid, _b uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.blocked_users bu
    WHERE (bu.blocker_id = _a AND bu.blocked_id = _b)
       OR (bu.blocker_id = _b AND bu.blocked_id = _a)
  );
$$;

-- Recreate profiles SELECT policy to use the function (so it works even when blocked_users is not selectable)
DROP POLICY IF EXISTS "Users can view other non-blocked profiles" ON public.profiles;

CREATE POLICY "Users can view other non-blocked profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() <> id
  AND is_blocked = false
  AND (gender = 'female' OR photo_verification_status = 'verified')
  AND NOT public.is_blocked_between(auth.uid(), profiles.id)
);

-- Recreate match_requests INSERT policies to use the function (so blocked users cannot send requests)
DROP POLICY IF EXISTS "Female users can create match requests" ON public.match_requests;
DROP POLICY IF EXISTS "Male users can create premium match requests" ON public.match_requests;

CREATE POLICY "Female users can create match requests"
ON public.match_requests
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.gender = 'female'::gender
      AND profiles.photo_verification_status = 'verified'::verification_status
  )
  AND NOT public.is_blocked_between(match_requests.sender_id, match_requests.receiver_id)
);

CREATE POLICY "Male users can create premium match requests"
ON public.match_requests
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND is_premium = true
  AND selected_rate_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.gender = 'male'::gender
      AND profiles.photo_verification_status = 'verified'::verification_status
  )
  AND NOT public.is_blocked_between(match_requests.sender_id, match_requests.receiver_id)
);
