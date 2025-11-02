-- Add foreign keys to enable relational selects for premium requests
ALTER TABLE public.match_requests
  ADD CONSTRAINT fk_match_requests_sender
    FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.match_requests
  ADD CONSTRAINT fk_match_requests_receiver
    FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.match_requests
  ADD CONSTRAINT fk_match_requests_selected_rate
    FOREIGN KEY (selected_rate_id) REFERENCES public.premium_rates(id) ON DELETE SET NULL;