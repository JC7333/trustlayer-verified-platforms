-- Supprimer les anciennes policies restrictives
DROP POLICY IF EXISTS "Admins+ can manage end_user_profiles" ON public.end_user_profiles;
DROP POLICY IF EXISTS "Users can view end_user_profiles in their platforms" ON public.end_user_profiles;

-- Créer des policies PERMISSIVES avec protection explicite contre les anonymes
-- Policy SELECT: Seuls les utilisateurs authentifiés avec accès à la plateforme peuvent voir
CREATE POLICY "Authenticated users can view end_user_profiles in their platforms"
ON public.end_user_profiles
FOR SELECT
TO authenticated
USING (platform_id IN (SELECT get_user_platforms(auth.uid())));

-- Policy INSERT: Seuls les admins+ peuvent créer
CREATE POLICY "Admins can insert end_user_profiles"
ON public.end_user_profiles
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), platform_id, 'platform_owner'::app_role) OR 
  has_role(auth.uid(), platform_id, 'platform_admin'::app_role)
);

-- Policy UPDATE: Seuls les admins+ peuvent modifier
CREATE POLICY "Admins can update end_user_profiles"
ON public.end_user_profiles
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), platform_id, 'platform_owner'::app_role) OR 
  has_role(auth.uid(), platform_id, 'platform_admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), platform_id, 'platform_owner'::app_role) OR 
  has_role(auth.uid(), platform_id, 'platform_admin'::app_role)
);

-- Policy DELETE: Seuls les admins+ peuvent supprimer
CREATE POLICY "Admins can delete end_user_profiles"
ON public.end_user_profiles
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), platform_id, 'platform_owner'::app_role) OR 
  has_role(auth.uid(), platform_id, 'platform_admin'::app_role)
);