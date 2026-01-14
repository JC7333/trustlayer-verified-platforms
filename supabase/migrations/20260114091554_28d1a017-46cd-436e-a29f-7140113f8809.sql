-- Créer la table expiry_queue pour un meilleur tracking des relances
CREATE TABLE public.expiry_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform_id UUID NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
  end_user_id UUID NOT NULL REFERENCES public.end_user_profiles(id) ON DELETE CASCADE,
  evidence_id UUID NOT NULL REFERENCES public.evidences(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  next_reminder_at TIMESTAMPTZ,
  current_stage TEXT DEFAULT 'none',
  last_notified_at TIMESTAMPTZ,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expiry_queue ENABLE ROW LEVEL SECURITY;

-- RLS policies avec le bon ordre de paramètres
CREATE POLICY "Platform users can view expiry_queue" 
ON public.expiry_queue 
FOR SELECT 
USING (public.has_platform_access(platform_id, auth.uid()));

CREATE POLICY "Platform admins can manage expiry_queue" 
ON public.expiry_queue 
FOR ALL 
USING (
  public.has_role(auth.uid(), platform_id, 'platform_admin'::public.app_role) 
  OR public.has_role(auth.uid(), platform_id, 'platform_owner'::public.app_role)
);

-- Index pour les requêtes de job
CREATE INDEX idx_expiry_queue_next_reminder 
ON public.expiry_queue(next_reminder_at) 
WHERE next_reminder_at IS NOT NULL;