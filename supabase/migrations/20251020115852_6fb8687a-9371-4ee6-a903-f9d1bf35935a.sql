-- Update verification-docs bucket to be public so admins can view documents
UPDATE storage.buckets 
SET public = true 
WHERE id = 'verification-docs';