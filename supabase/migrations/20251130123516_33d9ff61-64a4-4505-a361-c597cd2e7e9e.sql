-- Add RLS policies for verification-docs storage bucket
-- These policies restrict access to verification documents to admins only

-- Policy: Only admins can view verification documents
CREATE POLICY "Admins can view verification documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-docs' AND
  public.has_role(auth.uid(), 'admin')
);

-- Policy: Only admins can upload verification documents
CREATE POLICY "Admins can upload verification documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification-docs' AND
  public.has_role(auth.uid(), 'admin')
);

-- Policy: Only admins can update verification documents
CREATE POLICY "Admins can update verification documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'verification-docs' AND
  public.has_role(auth.uid(), 'admin')
);

-- Policy: Only admins can delete verification documents
CREATE POLICY "Admins can delete verification documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'verification-docs' AND
  public.has_role(auth.uid(), 'admin')
);