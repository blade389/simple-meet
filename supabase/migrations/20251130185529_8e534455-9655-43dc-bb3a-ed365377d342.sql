-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can insert their own push subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can view their own push subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can update their own push subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can delete their own push subscriptions" ON push_subscriptions;

-- Enable RLS on push_subscriptions if not already enabled
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own subscriptions
CREATE POLICY "Users can insert their own push subscriptions"
ON push_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own subscriptions
CREATE POLICY "Users can view their own push subscriptions"
ON push_subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to update their own subscriptions
CREATE POLICY "Users can update their own push subscriptions"
ON push_subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to delete their own subscriptions
CREATE POLICY "Users can delete their own push subscriptions"
ON push_subscriptions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);