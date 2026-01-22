-- 20260122124000_lock_audit_logs_server_only.sql

-- 1) Drop any existing INSERT policies (client-side inserts must die)
DROP POLICY IF EXISTS "System can insert audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can insert audit_logs in their platforms" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can log their own actions in their platforms" ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated users can insert their own audit logs" ON public.audit_logs;

-- 2) Explicit deny (optional but crystal-clear)
CREATE POLICY "Deny client inserts into audit_logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (false);
