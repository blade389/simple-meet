-- Add column to track review reminder sent
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS review_reminder_sent boolean DEFAULT false;