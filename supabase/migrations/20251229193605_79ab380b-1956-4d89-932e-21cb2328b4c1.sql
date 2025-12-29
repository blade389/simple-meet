-- Update the appointment deadline trigger to use 1 hour for testing (was 48 hours)
CREATE OR REPLACE FUNCTION public.set_appointment_deadline()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    NEW.appointment_deadline = now() + interval '1 hour'; -- 1 hour for testing (was 48 hours)
    NEW.chat_status = 'active';
  END IF;
  RETURN NEW;
END;
$function$;