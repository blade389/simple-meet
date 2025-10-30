-- Allow users to view verified photos of other users
CREATE POLICY "Users can view verified photos of others"
ON public.profile_photo_verifications
FOR SELECT
USING (status = 'verified');