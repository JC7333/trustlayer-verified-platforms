-- Seed platform
INSERT INTO public.platforms (id, name, slug, primary_color)
VALUES ('a0000000-0000-0000-0000-000000000001', 'Plateforme Pilote', 'pilote-01', '#0F4C81')
ON CONFLICT DO NOTHING;

-- Seed user_role for existing user
INSERT INTO public.user_roles (user_id, platform_id, role)
VALUES ('1c05c026-6d6f-4fca-bf7d-a9576ebf6d7d', 'a0000000-0000-0000-0000-000000000001', 'platform_owner')
ON CONFLICT DO NOTHING;

-- Seed profile (if not already created by trigger)
INSERT INTO public.profiles (id, email, full_name)
VALUES ('1c05c026-6d6f-4fca-bf7d-a9576ebf6d7d', 'docteuraudricbugnard@gmail.com', 'Audric Bugnard')
ON CONFLICT (id) DO NOTHING;