-- Fix security issue: Recreate pg_net extension in extensions schema
-- pg_net does not support ALTER EXTENSION SET SCHEMA, so we need to drop and recreate

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant necessary permissions on extensions schema
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Drop pg_net from public schema (CASCADE will drop any dependent objects)
DROP EXTENSION IF EXISTS pg_net CASCADE;

-- Recreate pg_net in extensions schema
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant execute permissions on net.http_* functions to necessary roles
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA extensions TO postgres, service_role;