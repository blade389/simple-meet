
-- Table for free premium requests from influencers
CREATE TABLE public.free_premium_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  social_platform TEXT NOT NULL, -- 'instagram' or 'onlyfans'
  social_screenshot_url TEXT NOT NULL,
  share_screenshot_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.free_premium_requests ENABLE ROW LEVEL SECURITY;

-- Users can create their own requests
CREATE POLICY "Users can create own free premium requests"
ON public.free_premium_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own requests
CREATE POLICY "Users can view own free premium requests"
ON public.free_premium_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all free premium requests"
ON public.free_premium_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update requests
CREATE POLICY "Admins can update free premium requests"
ON public.free_premium_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for the screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('premium-requests', 'premium-requests', false);

-- Storage policies
CREATE POLICY "Users can upload premium request files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'premium-requests' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own premium request files"
ON storage.objects FOR SELECT
USING (bucket_id = 'premium-requests' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all premium request files"
ON storage.objects FOR SELECT
USING (bucket_id = 'premium-requests' AND has_role(auth.uid(), 'admin'::app_role));
