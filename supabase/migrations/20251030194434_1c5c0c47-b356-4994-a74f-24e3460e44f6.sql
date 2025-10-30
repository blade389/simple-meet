-- Create chat_messages table for match communication
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_request_id UUID NOT NULL REFERENCES public.match_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages for their match requests
CREATE POLICY "Users can view messages for their matches"
ON public.chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.match_requests
    WHERE id = chat_messages.match_request_id
    AND (sender_id = auth.uid() OR receiver_id = auth.uid())
    AND status = 'accepted'
  )
);

-- Policy: Users can send messages for accepted match requests
CREATE POLICY "Users can send messages for accepted matches"
ON public.chat_messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.match_requests
    WHERE id = chat_messages.match_request_id
    AND (sender_id = auth.uid() OR receiver_id = auth.uid())
    AND status = 'accepted'
  )
);

-- Enable realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;