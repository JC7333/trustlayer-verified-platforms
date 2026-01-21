# PATCH P0 (auto)

Contenu :
- Secrets hygiene : `.env` retiré du repo, `.env.example` ajouté, `.gitignore` renforcé, doc `docs/ENVIRONMENTS.md`
- CI unifiée : un seul workflow `.github/workflows/ci.yml` (lint + typecheck + build) sur `main` et `lovable-dev`
- Guardrail : CI échoue si `.env` est commité
- ApiDocs : placeholder `sk_live_...` remplacé
- Edge Function `validate-magic-link` : rule pack dynamique (platform -> template fallback) + retour `rules_package_id`
- Migration : RLS insert audit_logs restreinte

À faire côté GitHub :
- commit + push sur `lovable-dev`
- PR vers `main` après validation staging
