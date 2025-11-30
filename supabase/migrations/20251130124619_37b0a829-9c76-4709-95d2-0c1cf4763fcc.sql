-- Fix RLS policy for profile_photo_verifications to require authentication
-- This prevents unauthorized access to verified photos

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can view verified photos of others" ON profile_photo_verifications;

-- Create new policy that requires authentication
CREATE POLICY "Authenticated users can view verified photos"
ON profile_photo_verifications FOR SELECT
TO authenticated
USING (status = 'verified');
