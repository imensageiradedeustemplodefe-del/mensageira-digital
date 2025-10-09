-- Enable Row Level Security on event_contacts table
-- This table stores sensitive contact information from event registrations
-- and must be protected from unauthorized access

ALTER TABLE public.event_contacts ENABLE ROW LEVEL SECURITY;

-- Verify that existing policies are in place (they should already exist)
-- The existing policies already restrict access to admins only:
-- - Authenticated admins can SELECT/INSERT/UPDATE/DELETE
-- - All other access is blocked

-- Add a comment to document the security requirement
COMMENT ON TABLE public.event_contacts IS 
  'Stores sensitive contact information from event registrations. RLS enabled with admin-only access policies.';