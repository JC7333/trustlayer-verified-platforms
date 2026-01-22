-- 20260122123000_lock_rules_items_write.sql

CREATE POLICY "Admins can write rules_items (non-template)"
ON public.rules_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.rules_packages rp
    WHERE rp.id = rules_items.package_id
      AND rp.is_template = false
      AND (
        public.has_role(auth.uid(), rp.platform_id, 'platform_owner')
        OR public.has_role(auth.uid(), rp.platform_id, 'platform_admin')
      )
  )
);

CREATE POLICY "Admins can update rules_items (non-template)"
ON public.rules_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.rules_packages rp
    WHERE rp.id = rules_items.package_id
      AND rp.is_template = false
      AND (
        public.has_role(auth.uid(), rp.platform_id, 'platform_owner')
        OR public.has_role(auth.uid(), rp.platform_id, 'platform_admin')
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.rules_packages rp
    WHERE rp.id = rules_items.package_id
      AND rp.is_template = false
      AND (
        public.has_role(auth.uid(), rp.platform_id, 'platform_owner')
        OR public.has_role(auth.uid(), rp.platform_id, 'platform_admin')
      )
  )
);

CREATE POLICY "Admins can delete rules_items (non-template)"
ON public.rules_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.rules_packages rp
    WHERE rp.id = rules_items.package_id
      AND rp.is_template = false
      AND (
        public.has_role(auth.uid(), rp.platform_id, 'platform_owner')
        OR public.has_role(auth.uid(), rp.platform_id, 'platform_admin')
      )
  )
);
