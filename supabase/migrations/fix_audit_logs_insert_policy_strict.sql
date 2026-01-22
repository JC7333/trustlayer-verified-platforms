-- Fix: strict audit_logs insert policy (client-side insert allowed ONLY for self)
DROP POLICY IF EXISTS "Authenticated users can insert audit logs in their platforms" ON public.audit_logs;

CREATE POLICY "Authenticated users can insert their own audit logs"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND public.has_platform_access(platform_id, auth.uid())
  );
