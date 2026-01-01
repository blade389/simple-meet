-- Fix the update_review_counts trigger to use correct rating thresholds
-- rating >= 3 = positive (thumbs up uses 5)
-- rating < 3 = negative (thumbs down uses 1)

CREATE OR REPLACE FUNCTION public.update_review_counts()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update reviewed user's counts
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
$function$;