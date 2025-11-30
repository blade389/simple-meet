-- Add DELETE policies for admins on verification tables

-- Allow admins to delete verification requests
CREATE POLICY "Admins can delete verification requests"
ON verification_requests FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Allow admins to delete profile photo verifications
CREATE POLICY "Admins can delete photo verification requests"
ON profile_photo_verifications FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);