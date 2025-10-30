-- Add is_primary field to profile_photo_verifications to mark the main photo
ALTER TABLE profile_photo_verifications 
ADD COLUMN is_primary BOOLEAN DEFAULT false;

-- Update the trigger to only set profile_photo_url for primary verified photos
CREATE OR REPLACE FUNCTION public.update_profile_photo_verification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only update profile_photo_url if this is a primary photo being verified
  IF NEW.status = 'verified' AND NEW.is_primary = true THEN
    UPDATE public.profiles
    SET 
      photo_verification_status = NEW.status,
      profile_photo_url = NEW.photo_url
    WHERE id = NEW.user_id;
  ELSIF NEW.status = 'verified' AND NEW.is_primary = false THEN
    -- Just update the verification status, not the photo URL
    UPDATE public.profiles
    SET photo_verification_status = NEW.status
    WHERE id = NEW.user_id;
  ELSIF NEW.status = 'rejected' AND NEW.is_primary = true THEN
    -- If primary photo is rejected, clear it
    UPDATE public.profiles
    SET 
      photo_verification_status = NEW.status,
      profile_photo_url = NULL
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$function$;