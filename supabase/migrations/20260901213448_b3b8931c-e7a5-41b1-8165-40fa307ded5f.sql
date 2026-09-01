DROP POLICY IF EXISTS "Users can view other non-blocked profiles" ON public.profiles;

CREATE POLICY "Users can view other non-blocked profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() <> id
  AND is_blocked = false
  AND COALESCE(is_paused, false) = false
  AND NOT public.is_blocked_between(auth.uid(), id)
  AND public.viewer_in_age_range(auth.uid(), id)
);

DROP POLICY IF EXISTS "Female users can create match requests" ON public.match_requests;
DROP POLICY IF EXISTS "Male users can create premium match requests" ON public.match_requests;

CREATE POLICY "Male users can create paid appointment requests"
ON public.match_requests
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND is_premium = true
  AND selected_rate_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.gender = 'male'::public.gender
  )
  AND EXISTS (
    SELECT 1 FROM public.profiles receiver
    WHERE receiver.id = match_requests.receiver_id
      AND receiver.gender = 'female'::public.gender
  )
  AND NOT public.is_blocked_between(match_requests.sender_id, match_requests.receiver_id)
);

DROP TRIGGER IF EXISTS on_verification_status_change ON public.verification_requests;
DROP TRIGGER IF EXISTS on_photo_verification_status_change ON public.profile_photo_verifications;
DROP FUNCTION IF EXISTS public.update_profile_verification();
DROP FUNCTION IF EXISTS public.update_profile_photo_verification();

UPDATE public.profile_photo_verifications
SET status = 'verified', rejection_reason = NULL, reviewed_at = NULL, reviewed_by = NULL
WHERE status IS DISTINCT FROM 'verified'::public.verification_status;

UPDATE public.profiles p
SET profile_photo_url = primary_photo.photo_url,
    photo_verification_status = 'verified'::public.verification_status
FROM (
  SELECT DISTINCT ON (user_id) user_id, photo_url
  FROM public.profile_photo_verifications
  ORDER BY user_id, is_primary DESC, created_at ASC
) AS primary_photo
WHERE p.id = primary_photo.user_id
  AND (p.profile_photo_url IS NULL OR p.photo_verification_status IS DISTINCT FROM 'verified'::public.verification_status);