-- Restrict audit_logs INSERT to authenticated users within their platforms
-- (Edge Functions using service role bypass RLS by design)

DROP POLICY IF EXISTS "System can insert audit_logs" ON public.audit_logs;

CREATE POLICY "Users can insert audit_logs in their platforms" ON public.audit_logs
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND platform_id IN (SELECT public.get_user_platforms(auth.uid()))
  );
