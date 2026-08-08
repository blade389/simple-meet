ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS verified_badge_status text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS verified_badge_source text,
  ADD COLUMN IF NOT EXISTS verified_badge_activated_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_badge_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_badge_revoked_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_badge_revoke_reason text;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_verified_badge_status_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_verified_badge_status_check
  CHECK (verified_badge_status IN ('none','active','revoked'));

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_verified_badge_source_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_verified_badge_source_check
  CHECK (verified_badge_source IS NULL OR verified_badge_source IN ('subscription','admin'));

-- Backfill: chi ha un abbonamento attivo ottiene subito il badge
UPDATE public.profiles
SET verified_badge_status = 'active',
    verified_badge_source = 'subscription',
    verified_badge_activated_at = COALESCE(verified_badge_activated_at, now()),
    verified_badge_expires_at = subscription_end
WHERE is_premium = true
  AND subscription_status = 'active'
  AND verified_badge_status <> 'active';

-- Sincronizzazione automatica badge <-> abbonamento
CREATE OR REPLACE FUNCTION public.sync_verified_badge_with_subscription()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.is_premium IS DISTINCT FROM OLD.is_premium
     OR NEW.subscription_status IS DISTINCT FROM OLD.subscription_status
     OR NEW.subscription_end IS DISTINCT FROM OLD.subscription_end THEN

    IF COALESCE(NEW.is_premium, false) = true AND NEW.subscription_status = 'active' THEN
      NEW.verified_badge_status := 'active';
      NEW.verified_badge_source := 'subscription';
      NEW.verified_badge_activated_at := COALESCE(OLD.verified_badge_activated_at, now());
      NEW.verified_badge_expires_at := NEW.subscription_end;
      NEW.verified_badge_revoked_at := NULL;
      NEW.verified_badge_revoke_reason := NULL;
    ELSIF COALESCE(OLD.verified_badge_source, NEW.verified_badge_source) = 'subscription'
          AND OLD.verified_badge_status = 'active' THEN
      NEW.verified_badge_status := 'revoked';
      NEW.verified_badge_revoked_at := now();
      NEW.verified_badge_revoke_reason := COALESCE(NEW.verified_badge_revoke_reason, 'subscription_ended');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_verified_badge_on_profiles ON public.profiles;
CREATE TRIGGER sync_verified_badge_on_profiles
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_verified_badge_with_subscription();

-- Assegnazione / revoca manuale (solo admin)
CREATE OR REPLACE FUNCTION public.admin_set_verified_badge(_user_id uuid, _active boolean, _reason text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can manage the verified badge';
  END IF;

  IF _active THEN
    UPDATE public.profiles
    SET verified_badge_status = 'active',
        verified_badge_source = 'admin',
        verified_badge_activated_at = now(),
        verified_badge_revoked_at = NULL,
        verified_badge_revoke_reason = NULL
    WHERE id = _user_id;
  ELSE
    UPDATE public.profiles
    SET verified_badge_status = 'revoked',
        verified_badge_revoked_at = now(),
        verified_badge_revoke_reason = COALESCE(_reason, 'admin_revoked')
    WHERE id = _user_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_verified_badge(uuid, boolean, text) FROM public;
GRANT EXECUTE ON FUNCTION public.admin_set_verified_badge(uuid, boolean, text) TO authenticated;