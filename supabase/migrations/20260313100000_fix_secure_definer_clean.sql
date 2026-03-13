-- 20260313100000_fix_secure_definer_clean.sql
-- Clean SECURITY DEFINER functions (replaces corrupted 20260122121000)

CREATE OR REPLACE FUNCTION public.has_role(
  _user_id uuid,
  _platform_id uuid,
  _role public.app_role
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.platform_id = _platform_id
      AND ur.role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_platforms(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ur.platform_id
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id;
$$;

CREATE OR REPLACE FUNCTION public.has_platform_access(
  _user_id uuid,
  _platform_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.platform_id = _platform_id
  );
$$;
