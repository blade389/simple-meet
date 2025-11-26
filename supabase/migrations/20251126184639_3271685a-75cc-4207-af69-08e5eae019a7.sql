-- Create function to recalculate all review counts
CREATE OR REPLACE FUNCTION public.recalculate_all_review_counts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Recalculate positive reviews (rating >= 3)
  UPDATE profiles p
  SET positive_reviews_count = (
    SELECT COUNT(*)
    FROM reviews r
    WHERE r.reviewed_id = p.id AND r.rating >= 3
  );
  -- Recalculate negative reviews (rating < 3)
  UPDATE profiles p
  SET negative_reviews_count = (
    SELECT COUNT(*)
    FROM reviews r
    WHERE r.reviewed_id = p.id AND r.rating < 3
  );
END;
$$;