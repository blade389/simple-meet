-- Make location_city nullable since we no longer require it
ALTER TABLE public.profiles 
ALTER COLUMN location_city DROP NOT NULL;

-- Set a default empty value for existing null entries (if any in future)
ALTER TABLE public.profiles 
ALTER COLUMN location_city SET DEFAULT '';