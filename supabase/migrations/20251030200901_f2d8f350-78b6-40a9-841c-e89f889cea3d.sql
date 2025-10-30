-- Add review counts to profiles
ALTER TABLE profiles 
ADD COLUMN positive_reviews_count INTEGER DEFAULT 0,
ADD COLUMN negative_reviews_count INTEGER DEFAULT 0;

-- Update appointment status after completion
ALTER TABLE appointments 
ADD COLUMN review_deadline TIMESTAMP WITH TIME ZONE;

-- Create trigger to update review counts
CREATE OR REPLACE FUNCTION update_review_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update reviewed user's counts
    UPDATE profiles
    SET 
      positive_reviews_count = (
        SELECT COUNT(*) FROM reviews 
        WHERE reviewed_id = NEW.reviewed_id AND rating > 0
      ),
      negative_reviews_count = (
        SELECT COUNT(*) FROM reviews 
        WHERE reviewed_id = NEW.reviewed_id AND rating <= 0
      )
    WHERE id = NEW.reviewed_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER review_counts_trigger
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_review_counts();

-- Update existing review counts
UPDATE profiles p
SET 
  positive_reviews_count = (
    SELECT COUNT(*) FROM reviews WHERE reviewed_id = p.id AND rating > 0
  ),
  negative_reviews_count = (
    SELECT COUNT(*) FROM reviews WHERE reviewed_id = p.id AND rating <= 0
  );