-- Create review_history table to permanently store reviews
CREATE TABLE public.review_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_review_id UUID,
  reviewer_id UUID NOT NULL,
  reviewed_id UUID NOT NULL,
  rating INTEGER,
  comment TEXT,
  reported BOOLEAN DEFAULT false,
  report_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.review_history ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view reviews about themselves"
ON public.review_history FOR SELECT
USING (auth.uid() = reviewed_id OR auth.uid() = reviewer_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all review history"
ON public.review_history FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to archive reviews before appointment deletion
CREATE OR REPLACE FUNCTION public.archive_reviews_before_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Copy all reviews for this appointment to history
  INSERT INTO public.review_history (original_review_id, reviewer_id, reviewed_id, rating, comment, reported, report_reason, created_at)
  SELECT id, reviewer_id, reviewed_id, rating, comment, reported, report_reason, created_at
  FROM public.reviews
  WHERE appointment_id = OLD.id;
  
  RETURN OLD;
END;
$$;

-- Create trigger on appointments table
CREATE TRIGGER archive_reviews_on_appointment_delete
BEFORE DELETE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.archive_reviews_before_delete();