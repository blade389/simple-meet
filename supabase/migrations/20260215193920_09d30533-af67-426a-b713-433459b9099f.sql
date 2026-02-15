CREATE OR REPLACE FUNCTION public.recalculate_all_review_counts()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can recalculate review counts';
  END IF;

  UPDATE profiles p
  SET positive_reviews_count = (
    SELECT COUNT(*)
    FROM review_history r
    WHERE r.reviewed_id = p.id AND r.rating >= 3
  )
  WHERE TRUE;
  
  UPDATE profiles p
  SET negative_reviews_count = (
    SELECT COUNT(*)
    FROM review_history r
    WHERE r.reviewed_id = p.id AND r.rating < 3
  )
  WHERE TRUE;
END;
$$;