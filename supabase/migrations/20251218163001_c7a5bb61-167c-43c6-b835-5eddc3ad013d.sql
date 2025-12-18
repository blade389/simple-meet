-- Rimuovi tutte le policy esistenti per verification-docs
DROP POLICY IF EXISTS "Users can upload their own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own verification docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own verification docs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all verification docs" ON storage.objects;

-- Ricrea le policy corrette per verification-docs
CREATE POLICY "verification_docs_user_insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'verification-docs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "verification_docs_user_select"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'verification-docs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "verification_docs_admin_select"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'verification-docs'
  AND public.has_role(auth.uid(), 'admin')
);