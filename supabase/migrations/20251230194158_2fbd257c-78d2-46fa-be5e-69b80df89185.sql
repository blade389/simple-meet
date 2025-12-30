-- Add reminder_sent column to appointments table
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS reminder_sent boolean DEFAULT NULL;