-- Add photo verification status column to profiles
ALTER TABLE public.profiles 
ADD COLUMN photo_verification_status verification_status DEFAULT 'pending';

-- Create profile photo verifications table
CREATE TABLE public.profile_photo_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  status verification_status DEFAULT 'pending',
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profile_photo_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profile_photo_verifications
CREATE POLICY "Users can create photo verification requests"
ON public.profile_photo_verifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own photo verification requests"
ON public.profile_photo_verifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all photo verification requests"
ON public.profile_photo_verifications
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update photo verification requests"
ON public.profile_photo_verifications
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Function to update profile photo verification status
CREATE OR REPLACE FUNCTION public.update_profile_photo_verification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update profile photo verification status
  UPDATE public.profiles
  SET 
    photo_verification_status = NEW.status,
    profile_photo_url = CASE 
      WHEN NEW.status = 'verified' THEN NEW.photo_url
      WHEN NEW.status = 'rejected' THEN NULL
      ELSE profile_photo_url
    END
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- Trigger to update profile when photo verification status changes
CREATE TRIGGER on_photo_verification_status_change
AFTER UPDATE ON public.profile_photo_verifications
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.update_profile_photo_verification();

-- Update match_requests policy to require verified photo for female users
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
);

-- Update profiles SELECT policy to hide male users without verified photos
DROP POLICY IF EXISTS "Users can view non-blocked profiles" ON public.profiles;

CREATE POLICY "Users can view non-blocked profiles"
ON public.profiles
FOR SELECT
USING (
  is_blocked = false 
  AND (
    gender = 'female' 
    OR photo_verification_status = 'verified'
  )
);