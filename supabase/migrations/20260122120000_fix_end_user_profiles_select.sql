-- 20260122120000_fix_end_user_profiles_select.sql

DROP POLICY IF EXISTS "Users can view end_user_profiles in their platforms"
ON public.end_user_profiles;

CREATE POLICY "Reviewers can view end_user_profiles in their platforms"
ON public.end_user_profiles
FOR SELECT
TO authenticated
USING (
  platform_id IN (SELECT public.get_user_platforms(auth.uid()))
  AND (
    public.has_role(auth.uid(), platform_id, 'platform_owner')
    OR public.has_role(auth.uid(), platform_id, 'platform_admin')
    OR public.has_role(auth.uid(), platform_id, 'reviewer')
  )
);
