-- Add appointment_deadline to match_requests
ALTER TABLE match_requests ADD COLUMN appointment_deadline timestamp with time zone;

-- Add chat_status to track if chat is active, blocked, or under review
ALTER TABLE match_requests ADD COLUMN chat_status text DEFAULT 'active' CHECK (chat_status IN ('active', 'blocked', 'under_review'));

-- Create conversation_reviews table for admin review
CREATE TABLE conversation_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_request_id uuid REFERENCES match_requests(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  reviewed_at timestamp with time zone,
  reviewed_by uuid REFERENCES auth.users(id),
  action_taken text CHECK (action_taken IN ('deduct_token_male', 'block_female', 'no_action')),
  admin_notes text,
  UNIQUE(match_request_id)
);

-- Enable RLS
ALTER TABLE conversation_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversation_reviews
CREATE POLICY "Admins can view all reviews"
ON conversation_reviews FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update reviews"
ON conversation_reviews FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Function to set appointment deadline when request is accepted
CREATE OR REPLACE FUNCTION set_appointment_deadline()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    NEW.appointment_deadline = now() + interval '48 hours';
    NEW.chat_status = 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to set appointment deadline
DROP TRIGGER IF EXISTS on_request_accepted ON match_requests;
CREATE TRIGGER on_request_accepted
BEFORE UPDATE ON match_requests
FOR EACH ROW
EXECUTE FUNCTION set_appointment_deadline();

-- Update existing accepted requests to have deadline
UPDATE match_requests 
SET appointment_deadline = created_at + interval '48 hours',
    chat_status = 'active'
WHERE status = 'accepted' AND appointment_deadline IS NULL;