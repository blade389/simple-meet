-- Add admin fields to reviews table
ALTER TABLE public.reviews 
ADD COLUMN admin_status TEXT DEFAULT 'pending' CHECK (admin_status IN ('pending', 'reviewed', 'dismissed')),
ADD COLUMN admin_notes TEXT;
