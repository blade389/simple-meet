
-- Create the trigger for updating review counts
CREATE TRIGGER on_review_insert_update
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_review_counts();
