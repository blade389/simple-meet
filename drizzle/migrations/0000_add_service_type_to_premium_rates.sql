ALTER TABLE public.premium_rates
  ADD COLUMN IF NOT EXISTS service_type TEXT NOT NULL DEFAULT 'outcall';

ALTER TABLE public.premium_rates
  ADD CONSTRAINT premium_rates_service_type_check
  CHECK (service_type IN ('incall', 'outcall'));