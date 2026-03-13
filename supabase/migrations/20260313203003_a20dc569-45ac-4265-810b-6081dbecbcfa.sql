-- CORRECTIF 1 : Restreindre end_user_profiles SELECT (PII anti-scraping)
DROP POLICY IF EXISTS "Authenticated can view" ON public.end_user_profiles;
DROP POLICY IF EXISTS "Users can view end_user_profiles in their platforms" ON public.end_user_profiles;
DROP POLICY IF EXISTS "Authenticated users can view end_user_profiles in their platfor" ON public.end_user_profiles;
DROP POLICY IF EXISTS "Reviewers can view end_user_profiles in their platforms" ON public.end_user_profiles;

CREATE POLICY "Reviewers can view end_user_profiles in their platforms"
ON public.end_user_profiles
FOR SELECT
TO authenticated
USING (
  platform_id IN (SELECT public.get_user_platforms(auth.uid()))
  AND (
    public.has_role(auth.uid(), platform_id, 'platform_owner'::public.app_role)
    OR public.has_role(auth.uid(), platform_id, 'platform_admin'::public.app_role)
    OR public.has_role(auth.uid(), platform_id, 'reviewer'::public.app_role)
  )
);

-- CORRECTIF 2 : audit_logs INSERT server-only
DROP POLICY IF EXISTS "Users can log their own actions" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can log their own actions in their platforms" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated users can insert their own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Deny client inserts into audit_logs" ON public.audit_logs;

CREATE POLICY "Deny client inserts into audit_logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (false);

-- CORRECTIF 3 : rules_items write admin-only
DROP POLICY IF EXISTS "Admins can write rules_items (non-template)" ON public.rules_items;
DROP POLICY IF EXISTS "Admins can update rules_items (non-template)" ON public.rules_items;
DROP POLICY IF EXISTS "Admins can delete rules_items (non-template)" ON public.rules_items;
DROP POLICY IF EXISTS "Admins can insert rules_items" ON public.rules_items;
DROP POLICY IF EXISTS "Admins can update rules_items" ON public.rules_items;
DROP POLICY IF EXISTS "Admins can delete rules_items" ON public.rules_items;

CREATE POLICY "Admins can insert rules_items"
ON public.rules_items
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.rules_packages rp
    WHERE rp.id = rules_items.package_id
      AND rp.is_template = false
      AND (public.has_role(auth.uid(), rp.platform_id, 'platform_owner'::public.app_role)
        OR public.has_role(auth.uid(), rp.platform_id, 'platform_admin'::public.app_role))
  )
);

CREATE POLICY "Admins can update rules_items"
ON public.rules_items
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.rules_packages rp
    WHERE rp.id = rules_items.package_id
      AND rp.is_template = false
      AND (public.has_role(auth.uid(), rp.platform_id, 'platform_owner'::public.app_role)
        OR public.has_role(auth.uid(), rp.platform_id, 'platform_admin'::public.app_role))
  )
);

CREATE POLICY "Admins can delete rules_items"
ON public.rules_items
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.rules_packages rp
    WHERE rp.id = rules_items.package_id
      AND rp.is_template = false
      AND (public.has_role(auth.uid(), rp.platform_id, 'platform_owner'::public.app_role)
        OR public.has_role(auth.uid(), rp.platform_id, 'platform_admin'::public.app_role))
  )
);

-- CORRECTIF 4 : SECURITY DEFINER functions propres
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _platform_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = _user_id AND ur.platform_id = _platform_id AND ur.role = _role); $$;

CREATE OR REPLACE FUNCTION public.get_user_platforms(_user_id uuid)
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT ur.platform_id FROM public.user_roles ur WHERE ur.user_id = _user_id; $$;

CREATE OR REPLACE FUNCTION public.has_platform_access(_user_id uuid, _platform_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = _user_id AND ur.platform_id = _platform_id); $$;