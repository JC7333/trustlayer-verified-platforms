-- =============================================
-- PHASE 1: Magic Link System for VTC/Livraison
-- =============================================

-- 1. Add status to end_user_profiles if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'end_user_profiles' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.end_user_profiles 
    ADD COLUMN status text NOT NULL DEFAULT 'needs_docs';
  END IF;
END $$;

-- 2. Create magic_links table for secure token-based access
CREATE TABLE IF NOT EXISTS public.magic_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform_id uuid NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
  end_user_id uuid NOT NULL REFERENCES public.end_user_profiles(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  used_at timestamp with time zone,
  revoked_at timestamp with time zone,
  created_by uuid REFERENCES auth.users(id),
  CONSTRAINT magic_links_token_hash_unique UNIQUE (token_hash)
);

-- 3. Add indexes for magic_links
CREATE INDEX IF NOT EXISTS idx_magic_links_token_hash ON public.magic_links(token_hash);
CREATE INDEX IF NOT EXISTS idx_magic_links_end_user_id ON public.magic_links(end_user_id);
CREATE INDEX IF NOT EXISTS idx_magic_links_expires_at ON public.magic_links(expires_at);

-- 4. Enable RLS on magic_links
ALTER TABLE public.magic_links ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies for magic_links (only admins can manage)
CREATE POLICY "Admins can manage magic_links"
  ON public.magic_links
  FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), platform_id, 'platform_owner'::app_role) OR 
    has_role(auth.uid(), platform_id, 'platform_admin'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), platform_id, 'platform_owner'::app_role) OR 
    has_role(auth.uid(), platform_id, 'platform_admin'::app_role)
  );

-- 6. Add extraction fields to evidences table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'evidences' 
    AND column_name = 'issued_at'
  ) THEN
    ALTER TABLE public.evidences ADD COLUMN issued_at date;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'evidences' 
    AND column_name = 'extraction_confidence'
  ) THEN
    ALTER TABLE public.evidences ADD COLUMN extraction_confidence numeric(3,2);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'evidences' 
    AND column_name = 'flags'
  ) THEN
    ALTER TABLE public.evidences ADD COLUMN flags text[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'evidences' 
    AND column_name = 'review_status'
  ) THEN
    ALTER TABLE public.evidences ADD COLUMN review_status text DEFAULT 'pending';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'evidences' 
    AND column_name = 'reviewer_id'
  ) THEN
    ALTER TABLE public.evidences ADD COLUMN reviewer_id uuid REFERENCES auth.users(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'evidences' 
    AND column_name = 'reviewed_at'
  ) THEN
    ALTER TABLE public.evidences ADD COLUMN reviewed_at timestamp with time zone;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'evidences' 
    AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE public.evidences ADD COLUMN rejection_reason text;
  END IF;
END $$;

-- 7. Create notifications_queue table for expiration alerts
CREATE TABLE IF NOT EXISTS public.notifications_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform_id uuid NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
  end_user_id uuid REFERENCES public.end_user_profiles(id) ON DELETE CASCADE,
  evidence_id uuid REFERENCES public.evidences(id) ON DELETE CASCADE,
  notification_type text NOT NULL, -- 'expiration_30d', 'expiration_7d', 'expiration_1d', 'expired', 'doc_requested'
  recipient_email text,
  recipient_phone text,
  subject text,
  body text,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  sent_at timestamp with time zone,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- 8. Enable RLS on notifications_queue
ALTER TABLE public.notifications_queue ENABLE ROW LEVEL SECURITY;

-- 9. RLS policies for notifications_queue
CREATE POLICY "Admins can view notifications"
  ON public.notifications_queue
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), platform_id, 'platform_owner'::app_role) OR 
    has_role(auth.uid(), platform_id, 'platform_admin'::app_role)
  );

-- 10. Create VTC France rule pack (template)
INSERT INTO public.rules_packages (id, name, description, vertical, is_template, validity_days, scoring_config)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'VTC / Livraison France',
  'Pack de vérification pour chauffeurs VTC et livreurs en France. Documents obligatoires conformes à la réglementation.',
  'transport',
  true,
  365,
  '{"min_score": 100, "required_docs_weight": 100}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 11. Create VTC France rule items (required documents)
INSERT INTO public.rules_items (package_id, name, description, document_type, is_required, expiration_days, score_weight, validation_rules)
VALUES 
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid, 'Carte VTC', 'Carte professionnelle VTC délivrée par la préfecture', 'carte_vtc', true, 1825, 20, '{"check_expiry": true}'::jsonb),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid, 'Permis de conduire', 'Permis B en cours de validité', 'permis_conduire', true, 5475, 20, '{"check_expiry": true}'::jsonb),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid, 'Carte grise', 'Certificat d''immatriculation du véhicule', 'carte_grise', true, null, 15, '{}'::jsonb),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid, 'Attestation d''assurance', 'Assurance RC professionnelle en cours', 'assurance_rc', true, 365, 20, '{"check_expiry": true}'::jsonb),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid, 'Contrôle technique', 'Contrôle technique valide (véhicule < 4 ans exempté)', 'controle_technique', true, 730, 15, '{"check_expiry": true}'::jsonb),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid, 'Kbis ou INSEE', 'Extrait Kbis ou attestation INSEE de moins de 3 mois', 'kbis', false, 90, 5, '{"check_expiry": true}'::jsonb),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid, 'Casier judiciaire B2', 'Bulletin n°2 (demandé par la plateforme)', 'casier_b2', false, 365, 5, '{}'::jsonb)
ON CONFLICT DO NOTHING;

-- 12. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_evidences_expires_at ON public.evidences(expires_at);
CREATE INDEX IF NOT EXISTS idx_evidences_review_status ON public.evidences(review_status);
CREATE INDEX IF NOT EXISTS idx_end_user_profiles_status ON public.end_user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_notifications_queue_status ON public.notifications_queue(status);