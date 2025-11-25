-- Add admin fields to reviews table
ALTER TABLE public.reviews
ADD COLUMN admin_status text,
ADD COLUMN admin_notes text;