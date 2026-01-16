# Sécurité V1 — baseline (pragmatique)

## Invariants
- Storage privé + signed URLs courtes
- RLS partout + tests d’isolement multi-tenant
- Secrets uniquement server-side (Vault/Secrets)
- Audit log append-only (no delete/update)

## Checklist release
- [ ] RLS test: un user A ne lit jamais platform_id B
- [ ] Bucket evidences privé + signed URLs 5–15 min
- [ ] Rate limit sur validate-magic-link / submit-evidence
- [ ] Anti-spam formulaires publics (captcha si besoin)
- [ ] Purge docs refusés >30j + fin relation >X mois
- [ ] MFA obligatoire pour comptes admin (si possible)
- [ ] Monitoring erreurs Edge Functions
- [ ] CGU: “outil d’aide à la décision”, responsabilité client
