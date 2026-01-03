-- Update the trigger function to count from review_history
CREATE OR REPLACE FUNCTION public.update_review_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update reviewed user's counts from review_history
    UPDATE profiles
    SET 
      positive_reviews_count = (
        SELECT COUNT(*) FROM review_history 
        WHERE reviewed_id = NEW.reviewed_id AND rating >= 3
      ),
      negative_reviews_count = (
        SELECT COUNT(*) FROM review_history 
        WHERE reviewed_id = NEW.reviewed_id AND rating < 3
      )
    WHERE id = NEW.reviewed_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on review_history to update counts
DROP TRIGGER IF EXISTS update_review_counts_trigger ON review_history;
CREATE TRIGGER update_review_counts_trigger
AFTER INSERT OR UPDATE ON public.review_history
FOR EACH ROW
EXECUTE FUNCTION public.update_review_counts();

-- Update the recalculate function to use review_history
CREATE OR REPLACE FUNCTION public.recalculate_all_review_counts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Recalculate positive reviews (rating >= 3) from review_history
  UPDATE profiles p
  SET positive_reviews_count = (
    SELECT COUNT(*)
    FROM review_history r
    WHERE r.reviewed_id = p.id AND r.rating >= 3
  )
  WHERE TRUE;
  
  -- Recalculate negative reviews (rating < 3) from review_history
  UPDATE profiles p
  SET negative_reviews_count = (
    SELECT COUNT(*)
    FROM review_history r
    WHERE r.reviewed_id = p.id AND r.rating < 3
  )
  WHERE TRUE;
END;
$$;