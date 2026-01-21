# Environnements & Secrets (source de vérité)

Objectif : éviter tout secret dans Git, et rendre les environnements reproductibles.

## Règles (non négociables)
- **Jamais** de secrets (service role, tokens, clés privées) dans GitHub.
- Les variables **VITE_*** sont **publiques** (exposées navigateur) → **aucun secret**.
- Fournir uniquement `.env.example` (noms des variables), jamais `.env`.

## Variables

| Variable | Où la définir | Public ? | Commentaire |
|---|---|---:|---|
| `VITE_SUPABASE_PROJECT_ID` | Local dev (`.env`) / Lovable UI | ✅ | Identifiant projet Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Local dev (`.env`) / Lovable UI | ✅ | Clé anon/publishable Supabase (publique) |
| `VITE_SUPABASE_URL` | Local dev (`.env`) / Lovable UI | ✅ | URL Supabase |

## Secrets runtime (hors Git)
- **Supabase Edge Functions** : via `supabase secrets set ...`
- **Lovable** : secrets configurés dans l’UI Lovable (runtime), non versionnés
