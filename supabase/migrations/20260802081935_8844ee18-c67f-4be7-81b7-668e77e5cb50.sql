CREATE TABLE public.chat_contact_violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_request_id uuid NOT NULL,
  user_id uuid NOT NULL,
  message text NOT NULL,
  detected_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.chat_contact_violations TO authenticated;
GRANT ALL ON public.chat_contact_violations TO service_role;

ALTER TABLE public.chat_contact_violations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can log their own violations"
ON public.chat_contact_violations FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all violations"
ON public.chat_contact_violations FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_chat_contact_violations_created_at ON public.chat_contact_violations (created_at DESC);