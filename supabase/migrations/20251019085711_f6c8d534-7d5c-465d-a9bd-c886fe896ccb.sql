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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_photo_verification_status_change ON public.profile_photo_verifications;

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