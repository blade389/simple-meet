-- Add premium subscription fields to profiles
ALTER TABLE public.profiles
ADD COLUMN is_premium BOOLEAN DEFAULT false,
ADD COLUMN subscription_status TEXT,
ADD COLUMN subscription_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN stripe_subscription_id TEXT,
ADD COLUMN stripe_product_id TEXT;

-- Create premium rates table
CREATE TABLE public.premium_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duration_hours INTEGER NOT NULL,
  price_euros INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, duration_hours)
);

ALTER TABLE public.premium_rates ENABLE ROW LEVEL SECURITY;

-- Premium users can manage their own rates
CREATE POLICY "Premium users can view own rates"
ON public.premium_rates
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Premium users can insert own rates"
ON public.premium_rates
FOR INSERT
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND is_premium = true
));

CREATE POLICY "Premium users can update own rates"
ON public.premium_rates
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Premium users can delete own rates"
ON public.premium_rates
FOR DELETE
USING (auth.uid() = user_id);

-- Male users can view premium rates
CREATE POLICY "Users can view premium rates"
ON public.premium_rates
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND gender = 'male'
));

-- Add is_premium field to match_requests and appointments
ALTER TABLE public.match_requests
ADD COLUMN is_premium BOOLEAN DEFAULT false,
ADD COLUMN selected_rate_id UUID REFERENCES public.premium_rates(id);

ALTER TABLE public.appointments
ADD COLUMN is_premium BOOLEAN DEFAULT false,
ADD COLUMN selected_rate_id UUID REFERENCES public.premium_rates(id);