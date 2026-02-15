-- Revoke SELECT on Stripe-specific columns from authenticated users
-- These fields are only needed by edge functions using service_role_key
REVOKE SELECT (stripe_subscription_id, stripe_product_id) ON public.profiles FROM authenticated;
REVOKE SELECT (stripe_subscription_id, stripe_product_id) ON public.profiles FROM anon;