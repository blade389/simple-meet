-- Make verification-docs bucket private to prevent unauthorized direct URL access
UPDATE storage.buckets 
SET public = false 
WHERE id = 'verification-docs';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all verification documents" ON storage.objects;

-- Only authenticated users can insert their own documents
CREATE POLICY "Users can upload their own verification documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification-docs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Only authenticated users can view their own documents
CREATE POLICY "Users can view their own verification documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-docs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins can view all verification documents
CREATE POLICY "Admins can view all verification documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-docs'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);