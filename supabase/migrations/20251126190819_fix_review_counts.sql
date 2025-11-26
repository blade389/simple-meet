CREATE OR REPLACE FUNCTION update_review_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update reviewed user's counts
    -- Assuming rating 1 is negative (Thumbs Down) and rating 5 is positive (Thumbs Up)
    -- We'll use a threshold of 3 to distinguish
    UPDATE profiles
    SET 
      positive_reviews_count = (
        SELECT COUNT(*) FROM reviews 
        WHERE reviewed_id = NEW.reviewed_id AND rating >= 3
      ),
      negative_reviews_count = (
        SELECT COUNT(*) FROM reviews 
        WHERE reviewed_id = NEW.reviewed_id AND rating < 3
      )
    WHERE id = NEW.reviewed_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recalculate existing counts to fix the data
UPDATE profiles p
SET 
  positive_reviews_count = (
    SELECT COUNT(*) FROM reviews WHERE reviewed_id = p.id AND rating >= 3
  ),
  negative_reviews_count = (
    SELECT COUNT(*) FROM reviews WHERE reviewed_id = p.id AND rating < 3
  );
