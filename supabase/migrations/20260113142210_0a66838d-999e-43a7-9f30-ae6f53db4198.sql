-- Fix: Restrict audit_logs INSERT policy to only allow users to log their own actions within their platforms
-- This prevents malicious users from injecting false audit entries or flooding logs

DROP POLICY IF EXISTS "System can insert audit_logs" ON public.audit_logs;

-- Create a more restrictive INSERT policy
-- Users can only insert audit logs where:
-- 1. The user_id matches their own ID
-- 2. The platform_id is one they have access to
CREATE POLICY "Users can log their own actions in their platforms" ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    platform_id IN (SELECT get_user_platforms(auth.uid()))
  );