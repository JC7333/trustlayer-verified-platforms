-- =============================================
-- TRUSTLAYER COMPLETE DATABASE SCHEMA
-- Multi-tenant B2B Verification Platform
-- =============================================

-- 1. ENUM TYPES
CREATE TYPE public.app_role AS ENUM ('platform_owner', 'platform_admin', 'reviewer', 'viewer');
CREATE TYPE public.verification_status AS ENUM ('draft', 'submitted', 'in_review', 'approved', 'rejected', 'expired');
CREATE TYPE public.evidence_status AS ENUM ('pending', 'valid', 'expired', 'rejected');

-- 2. PLATFORMS TABLE (Clients/Tenants)
CREATE TABLE public.platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#0F4C81',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;

-- 3. PROFILES TABLE (Users of TrustLayer)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. USER_ROLES TABLE (Role assignments - separate table for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform_id UUID NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 5. END_USER_PROFILES TABLE (Profiles to be verified - prestataires)
CREATE TABLE public.end_user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id UUID NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
  external_id TEXT,
  business_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  address JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
  public_badge_id TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(platform_id, external_id)
);

ALTER TABLE public.end_user_profiles ENABLE ROW LEVEL SECURITY;

-- 6. RULES_PACKAGES TABLE (Templates de vérification par secteur)
CREATE TABLE public.rules_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id UUID REFERENCES public.platforms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  vertical TEXT NOT NULL,
  is_template BOOLEAN DEFAULT false,
  validity_days INTEGER DEFAULT 365,
  scoring_config JSONB DEFAULT '{"min_score": 70}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rules_packages ENABLE ROW LEVEL SECURITY;

-- 7. RULES_ITEMS TABLE (Documents/preuves requis dans un package)
CREATE TABLE public.rules_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.rules_packages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  document_type TEXT NOT NULL,
  is_required BOOLEAN DEFAULT true,
  expiration_days INTEGER,
  score_weight INTEGER DEFAULT 10,
  validation_rules JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rules_items ENABLE ROW LEVEL SECURITY;

-- 8. VERIFICATION_REQUESTS TABLE
CREATE TABLE public.verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id UUID NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.end_user_profiles(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.rules_packages(id),
  assigned_to UUID REFERENCES auth.users(id),
  status verification_status NOT NULL DEFAULT 'draft',
  priority INTEGER DEFAULT 0,
  sla_deadline TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- 9. EVIDENCES TABLE (Documents uploadés)
CREATE TABLE public.evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id UUID NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.end_user_profiles(id) ON DELETE CASCADE,
  request_id UUID REFERENCES public.verification_requests(id) ON DELETE SET NULL,
  rules_item_id UUID REFERENCES public.rules_items(id),
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  status evidence_status NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ,
  ocr_data JSONB,
  ai_analysis JSONB,
  metadata JSONB DEFAULT '{}',
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.evidences ENABLE ROW LEVEL SECURITY;

-- 10. REVIEW_DECISIONS TABLE (Historique des décisions)
CREATE TABLE public.review_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.verification_requests(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id),
  decision TEXT NOT NULL CHECK (decision IN ('approve', 'reject', 'request_more_info')),
  notes TEXT,
  checklist JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.review_decisions ENABLE ROW LEVEL SECURITY;

-- 11. API_KEYS TABLE (Clés API par plateforme)
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id UUID NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  scopes TEXT[] DEFAULT ARRAY['read'],
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- 12. WEBHOOKS TABLE
CREATE TABLE public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id UUID NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

-- 13. AUDIT_LOGS TABLE (Traçabilité complète)
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id UUID REFERENCES public.platforms(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 14. SUBSCRIPTIONS TABLE (Abonnements Stripe)
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id UUID NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_name TEXT NOT NULL DEFAULT 'starter',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  verifications_included INTEGER DEFAULT 100,
  verifications_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 15. USAGE_EVENTS TABLE (Facturation à l'usage)
CREATE TABLE public.usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id UUID NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

-- 16. CONTACT_REQUESTS TABLE (Demandes de contact/demo)
CREATE TABLE public.contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  vertical TEXT,
  volume TEXT,
  message TEXT,
  request_type TEXT NOT NULL DEFAULT 'contact',
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SECURITY DEFINER FUNCTIONS
-- =============================================

-- Function to check if user has a specific role in a platform
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _platform_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND platform_id = _platform_id
      AND role = _role
  )
$$;

-- Function to check if user has any role in a platform
CREATE OR REPLACE FUNCTION public.has_platform_access(_user_id UUID, _platform_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND platform_id = _platform_id
  )
$$;

-- Function to get user's platform IDs
CREATE OR REPLACE FUNCTION public.get_user_platforms(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT platform_id FROM public.user_roles WHERE user_id = _user_id
$$;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- PLATFORMS POLICIES
CREATE POLICY "Users can view their platforms" ON public.platforms
  FOR SELECT USING (id IN (SELECT public.get_user_platforms(auth.uid())));

CREATE POLICY "Platform owners can update their platform" ON public.platforms
  FOR UPDATE USING (public.has_role(auth.uid(), id, 'platform_owner'));

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- USER_ROLES POLICIES
CREATE POLICY "Users can view roles in their platforms" ON public.user_roles
  FOR SELECT USING (platform_id IN (SELECT public.get_user_platforms(auth.uid())));

CREATE POLICY "Platform owners can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), platform_id, 'platform_owner'));

-- END_USER_PROFILES POLICIES
CREATE POLICY "Users can view end_user_profiles in their platforms" ON public.end_user_profiles
  FOR SELECT USING (platform_id IN (SELECT public.get_user_platforms(auth.uid())));

CREATE POLICY "Admins+ can manage end_user_profiles" ON public.end_user_profiles
  FOR ALL USING (
    public.has_role(auth.uid(), platform_id, 'platform_owner') OR
    public.has_role(auth.uid(), platform_id, 'platform_admin')
  );

-- RULES_PACKAGES POLICIES
CREATE POLICY "Anyone can view templates" ON public.rules_packages
  FOR SELECT USING (is_template = true OR platform_id IN (SELECT public.get_user_platforms(auth.uid())));

CREATE POLICY "Admins+ can manage packages" ON public.rules_packages
  FOR ALL USING (
    public.has_role(auth.uid(), platform_id, 'platform_owner') OR
    public.has_role(auth.uid(), platform_id, 'platform_admin')
  );

-- RULES_ITEMS POLICIES
CREATE POLICY "Users can view rules_items" ON public.rules_items
  FOR SELECT USING (
    package_id IN (
      SELECT id FROM public.rules_packages 
      WHERE is_template = true OR platform_id IN (SELECT public.get_user_platforms(auth.uid()))
    )
  );

-- VERIFICATION_REQUESTS POLICIES
CREATE POLICY "Users can view verification_requests in their platforms" ON public.verification_requests
  FOR SELECT USING (platform_id IN (SELECT public.get_user_platforms(auth.uid())));

CREATE POLICY "Reviewers+ can manage verification_requests" ON public.verification_requests
  FOR ALL USING (
    public.has_role(auth.uid(), platform_id, 'platform_owner') OR
    public.has_role(auth.uid(), platform_id, 'platform_admin') OR
    public.has_role(auth.uid(), platform_id, 'reviewer')
  );

-- EVIDENCES POLICIES
CREATE POLICY "Users can view evidences in their platforms" ON public.evidences
  FOR SELECT USING (platform_id IN (SELECT public.get_user_platforms(auth.uid())));

CREATE POLICY "Reviewers+ can manage evidences" ON public.evidences
  FOR ALL USING (
    public.has_role(auth.uid(), platform_id, 'platform_owner') OR
    public.has_role(auth.uid(), platform_id, 'platform_admin') OR
    public.has_role(auth.uid(), platform_id, 'reviewer')
  );

-- REVIEW_DECISIONS POLICIES
CREATE POLICY "Users can view decisions in their platforms" ON public.review_decisions
  FOR SELECT USING (
    request_id IN (
      SELECT id FROM public.verification_requests 
      WHERE platform_id IN (SELECT public.get_user_platforms(auth.uid()))
    )
  );

CREATE POLICY "Reviewers can create decisions" ON public.review_decisions
  FOR INSERT WITH CHECK (
    reviewer_id = auth.uid() AND
    request_id IN (
      SELECT id FROM public.verification_requests vr
      WHERE public.has_role(auth.uid(), vr.platform_id, 'reviewer')
         OR public.has_role(auth.uid(), vr.platform_id, 'platform_admin')
         OR public.has_role(auth.uid(), vr.platform_id, 'platform_owner')
    )
  );

-- API_KEYS POLICIES
CREATE POLICY "Owners can view api_keys" ON public.api_keys
  FOR SELECT USING (public.has_role(auth.uid(), platform_id, 'platform_owner'));

CREATE POLICY "Owners can manage api_keys" ON public.api_keys
  FOR ALL USING (public.has_role(auth.uid(), platform_id, 'platform_owner'));

-- WEBHOOKS POLICIES
CREATE POLICY "Owners can view webhooks" ON public.webhooks
  FOR SELECT USING (public.has_role(auth.uid(), platform_id, 'platform_owner'));

CREATE POLICY "Owners can manage webhooks" ON public.webhooks
  FOR ALL USING (public.has_role(auth.uid(), platform_id, 'platform_owner'));

-- AUDIT_LOGS POLICIES
CREATE POLICY "Users can view audit_logs in their platforms" ON public.audit_logs
  FOR SELECT USING (platform_id IN (SELECT public.get_user_platforms(auth.uid())));

CREATE POLICY "System can insert audit_logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- SUBSCRIPTIONS POLICIES
CREATE POLICY "Owners can view subscriptions" ON public.subscriptions
  FOR SELECT USING (public.has_role(auth.uid(), platform_id, 'platform_owner'));

-- USAGE_EVENTS POLICIES
CREATE POLICY "Owners can view usage_events" ON public.usage_events
  FOR SELECT USING (public.has_role(auth.uid(), platform_id, 'platform_owner'));

-- CONTACT_REQUESTS POLICIES (public insert, no select for non-admin)
CREATE POLICY "Anyone can submit contact requests" ON public.contact_requests
  FOR INSERT WITH CHECK (true);

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_platforms_updated_at
  BEFORE UPDATE ON public.platforms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_end_user_profiles_updated_at
  BEFORE UPDATE ON public.end_user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rules_packages_updated_at
  BEFORE UPDATE ON public.rules_packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_verification_requests_updated_at
  BEFORE UPDATE ON public.verification_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_evidences_updated_at
  BEFORE UPDATE ON public.evidences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- SEED DATA: Templates de vérification par secteur
-- =============================================

INSERT INTO public.rules_packages (id, name, description, vertical, is_template, validity_days) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Santé France', 'Vérification complète pour les professionnels de santé', 'healthcare', true, 365),
  ('22222222-2222-2222-2222-222222222222', 'Services à domicile', 'Vérification pour les artisans et prestataires', 'home-services', true, 365),
  ('33333333-3333-3333-3333-333333333333', 'Marketplace B2B', 'Vérification des vendeurs professionnels', 'marketplace', true, 365),
  ('44444444-4444-4444-4444-444444444444', 'Transport & Logistique', 'Vérification des transporteurs', 'logistics', true, 365);

-- Seed rules_items for Healthcare
INSERT INTO public.rules_items (package_id, name, description, document_type, is_required, expiration_days, score_weight) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Diplôme médical', 'Diplôme reconnu par l''Ordre', 'diploma', true, NULL, 25),
  ('11111111-1111-1111-1111-111111111111', 'Inscription à l''Ordre', 'Attestation d''inscription en cours de validité', 'order_registration', true, 365, 25),
  ('11111111-1111-1111-1111-111111111111', 'Assurance RCP', 'Responsabilité civile professionnelle', 'insurance', true, 365, 25),
  ('11111111-1111-1111-1111-111111111111', 'Pièce d''identité', 'CNI ou passeport en cours de validité', 'identity', true, 3650, 15),
  ('11111111-1111-1111-1111-111111111111', 'Justificatif de domicile', 'Moins de 3 mois', 'address_proof', false, 90, 10);

-- Seed rules_items for Home Services  
INSERT INTO public.rules_items (package_id, name, description, document_type, is_required, expiration_days, score_weight) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Kbis / Inscription', 'Extrait Kbis ou inscription répertoire des métiers', 'company_registration', true, 365, 20),
  ('22222222-2222-2222-2222-222222222222', 'Assurance décennale', 'Pour les métiers du bâtiment', 'decennial_insurance', true, 365, 25),
  ('22222222-2222-2222-2222-222222222222', 'Assurance RC Pro', 'Responsabilité civile professionnelle', 'insurance', true, 365, 20),
  ('22222222-2222-2222-2222-222222222222', 'Qualification RGE', 'Si applicable aux travaux énergétiques', 'certification', false, 365, 15),
  ('22222222-2222-2222-2222-222222222222', 'Attestation URSSAF', 'Attestation de vigilance', 'urssaf', true, 180, 20);

-- Seed rules_items for B2B Marketplace
INSERT INTO public.rules_items (package_id, name, description, document_type, is_required, expiration_days, score_weight) VALUES
  ('33333333-3333-3333-3333-333333333333', 'Kbis', 'Extrait Kbis de moins de 3 mois', 'company_registration', true, 90, 25),
  ('33333333-3333-3333-3333-333333333333', 'Attestation TVA', 'Numéro de TVA intracommunautaire', 'vat', true, NULL, 20),
  ('33333333-3333-3333-3333-333333333333', 'Certifications qualité', 'ISO 9001, etc.', 'certification', false, 365, 20),
  ('33333333-3333-3333-3333-333333333333', 'Bilan financier', 'Derniers comptes publiés', 'financial', false, 365, 15),
  ('33333333-3333-3333-3333-333333333333', 'Références clients', 'Liste de références vérifiables', 'references', false, NULL, 20);

-- Seed rules_items for Logistics
INSERT INTO public.rules_items (package_id, name, description, document_type, is_required, expiration_days, score_weight) VALUES
  ('44444444-4444-4444-4444-444444444444', 'Licence transport', 'Licence de transport de marchandises', 'license', true, 365, 25),
  ('44444444-4444-4444-4444-444444444444', 'Assurance marchandises', 'Couverture des marchandises transportées', 'cargo_insurance', true, 365, 25),
  ('44444444-4444-4444-4444-444444444444', 'Attestation de capacité', 'Capacité professionnelle de transport', 'capacity_certificate', true, NULL, 20),
  ('44444444-4444-4444-4444-444444444444', 'Contrôle technique flotte', 'Véhicules en règle', 'vehicle_inspection', true, 365, 15),
  ('44444444-4444-4444-4444-444444444444', 'Attestation URSSAF', 'Attestation de vigilance', 'urssaf', true, 180, 15);

-- =============================================
-- STORAGE BUCKET
-- =============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'evidences',
  'evidences',
  false,
  52428800,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
);

-- Storage policies
CREATE POLICY "Users can view evidences in their platforms" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'evidences' AND
    (storage.foldername(name))[1]::uuid IN (SELECT public.get_user_platforms(auth.uid()))
  );

CREATE POLICY "Reviewers can upload evidences" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'evidences' AND
    (storage.foldername(name))[1]::uuid IN (SELECT public.get_user_platforms(auth.uid()))
  );

CREATE POLICY "Admins can delete evidences" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'evidences' AND
    (storage.foldername(name))[1]::uuid IN (
      SELECT platform_id FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('platform_owner', 'platform_admin')
    )
  );