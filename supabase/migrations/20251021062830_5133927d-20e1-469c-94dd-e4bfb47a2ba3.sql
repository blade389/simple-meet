-- Create blocked_users table to track user blocks
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL,
  blocked_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Enable RLS
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blocked_users
CREATE POLICY "Users can insert own blocks"
ON public.blocked_users
FOR INSERT
WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can view own blocks"
ON public.blocked_users
FOR SELECT
USING (auth.uid() = blocker_id);

-- Update profiles RLS policy to exclude blocked users from viewing
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
);

-- Update match_requests policy to prevent blocked users from sending requests
DROP POLICY IF EXISTS "Female users can create match requests" ON public.match_requests;

CREATE POLICY "Female users can create match requests"
ON public.match_requests
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.gender = 'female' 
    AND profiles.photo_verification_status = 'verified'
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.blocked_users 
    WHERE blocked_id = sender_id AND blocker_id = receiver_id
  )
);