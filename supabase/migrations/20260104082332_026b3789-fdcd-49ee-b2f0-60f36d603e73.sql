-- Add column to track if verification reminder was sent
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS verification_reminder_sent BOOLEAN DEFAULT false;