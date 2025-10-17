-- Drop trigger and function with CASCADE, then recreate with proper search_path
DROP FUNCTION IF EXISTS update_profile_verification() CASCADE;

CREATE OR REPLACE FUNCTION update_profile_verification()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET is_verified = NEW.status
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_verification_status_change
AFTER UPDATE OF status ON public.verification_requests
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION update_profile_verification();