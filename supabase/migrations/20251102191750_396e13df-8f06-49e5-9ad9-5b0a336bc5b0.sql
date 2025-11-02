-- Add policy to allow male users to create premium match requests
CREATE POLICY "Male users can create premium match requests"
ON match_requests
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id 
  AND is_premium = true
  AND selected_rate_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.gender = 'male'::gender
    AND profiles.photo_verification_status = 'verified'::verification_status
  )
  AND NOT EXISTS (
    SELECT 1 FROM blocked_users
    WHERE blocked_users.blocked_id = sender_id
    AND blocked_users.blocker_id = receiver_id
  )
);