-- Add admin_archived column to profile_photo_verifications
ALTER TABLE public.profile_photo_verifications 
ADD COLUMN admin_archived boolean DEFAULT false;

-- Add admin_archived column to verification_requests
ALTER TABLE public.verification_requests 
ADD COLUMN admin_archived boolean DEFAULT false;