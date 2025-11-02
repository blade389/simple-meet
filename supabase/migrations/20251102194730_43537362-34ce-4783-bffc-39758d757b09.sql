-- Refund token to sender when a premium match request is rejected
-- This runs server-side and avoids RLS issues from the client

-- Create or replace the function
CREATE OR REPLACE FUNCTION public.refund_token_on_premium_reject()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only refund when transitioning to rejected, and only for premium requests
  IF NEW.is_premium = true AND NEW.status = 'rejected' AND (OLD.status IS DISTINCT FROM 'rejected') THEN
    -- Try to update existing token balance
    UPDATE public.tokens
      SET amount = amount + 1,
          last_updated = now()
      WHERE user_id = NEW.sender_id;

    -- If no row was updated, insert a new one
    IF NOT FOUND THEN
      INSERT INTO public.tokens (user_id, amount, last_updated)
      VALUES (NEW.sender_id, 1, now());
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create the trigger (idempotent)
DROP TRIGGER IF EXISTS refund_token_on_premium_reject_trigger ON public.match_requests;
CREATE TRIGGER refund_token_on_premium_reject_trigger
AFTER UPDATE ON public.match_requests
FOR EACH ROW
EXECUTE FUNCTION public.refund_token_on_premium_reject();