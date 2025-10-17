-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-docs', 'verification-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Create verification_requests table
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_url TEXT NOT NULL,
  status verification_status DEFAULT 'pending',
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own verification requests
CREATE POLICY "Users can view own verification requests"
ON public.verification_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own verification requests
CREATE POLICY "Users can create verification requests"
ON public.verification_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all verification requests
CREATE POLICY "Admins can view all verification requests"
ON public.verification_requests
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update verification requests
CREATE POLICY "Admins can update verification requests"
ON public.verification_requests
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Storage policies for verification documents
CREATE POLICY "Users can upload own verification docs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'verification-docs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own verification docs"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'verification-docs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all verification docs"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'verification-docs' AND
  public.has_role(auth.uid(), 'admin')
);

-- Create trigger to update profile verification status
CREATE OR REPLACE FUNCTION update_profile_verification()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET is_verified = NEW.status
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_verification_status_change
AFTER UPDATE OF status ON public.verification_requests
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION update_profile_verification();