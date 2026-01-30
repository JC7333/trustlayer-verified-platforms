This repository is a Vite + React + TypeScript frontend with Supabase serverless functions and SQL migrations. The goal of this file is to give AI coding agents just the focused, actionable knowledge they need to be productive here.

- Project type: Vite + React + TypeScript (see [package.json](package.json))
- UI: shadcn-ui components under [src/components/ui](src/components/ui)
- Styling: Tailwind CSS (config: [tailwind.config.ts](tailwind.config.ts))
- Data & auth: Supabase client + serverless functions in [integrations/supabase](integrations/supabase) and [supabase/functions](supabase/functions)
- DB migrations: SQL files in [supabase/migrations](supabase/migrations)

Quick start (development):

- Install: `npm i`
- Run dev server: `npm run dev` (Vite)
- Build: `npm run build`; Preview: `npm run preview`
- Lint/format: `npm run lint`, `npm run format`

Architecture & key patterns

- Frontend app: all React source lives in [src](src). Pages are in [src/pages](src/pages). Shared UI primitives follow shadcn-ui conventions in [src/components/ui](src/components/ui).
- Global state / async data: uses `@tanstack/react-query` (React Query) — prefer query hooks over ad-hoc fetches.
- Auth: `AuthContext` provides auth flows and consumes the Supabase client. See [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) for how auth state, magic links, and session handling are wired.
- Hooks: platform and device patterns are centralized in `src/hooks` (notably `usePlatform.tsx`, `use-mobile.tsx`, `useRequireAuth.tsx`) — add cross-cutting behavior here rather than scattering logic.

Server / integrations

- Supabase client usage and helper integrations live in [integrations/supabase](integrations/supabase). When adding API calls prefer the existing client wrappers.
- Serverless functions are in [supabase/functions](supabase/functions). Inspect existing handlers like [supabase/functions/analyze-document](supabase/functions/analyze-document) for structure and deployment expectations.
- DB schema changes: add SQL files to [supabase/migrations](supabase/migrations). Follow the existing filename timestamps and naming patterns.

Conventions and examples

- Component styling: prefer Tailwind utilities plus `class-variance-authority` patterns (see `components/ui/` usage). Reuse existing shadcn patterns rather than inventing new primitives.
- Routing: `react-router-dom` is used — add routes by updating the central router in [src/main.tsx] and adding pages under [src/pages].
- Async data: create small query hooks that use React Query; keep components focused on rendering.
- Pre-commit and formatting: Husky pre-commit is present (see [.husky/pre-commit](.husky/pre-commit)). Always run `npm run format` and `npm run typecheck` as part of PRs.

Where to look when adding features or debugging

- App entry and mounts: [src/main.tsx](src/main.tsx)
- Layouts & nav: [src/components/layout](src/components/layout)
- Auth + platform behavior: [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx), [src/hooks/usePlatform.tsx](src/hooks/usePlatform.tsx)
- Serverless examples: any folder under [supabase/functions](supabase/functions) (e.g., [supabase/functions/analyze-document](supabase/functions/analyze-document))
- Environment guidance: [docs/ENVIRONMENTS.md](docs/ENVIRONMENTS.md)

What not to change without verification

- SQL migration history in [supabase/migrations] — don't alter historical SQL, add new migrations instead.
- Supabase function signatures — maintain expected input/output shapes unless updating all callers.

Editing guidance for AI agents

- Make changes minimal and focused; follow existing naming / file placement patterns.
- Prefer adding small helper hooks or components under `src/hooks` or `src/components` rather than modifying wide-reaching files.
- When adding or updating APIs, update any affected React Query hooks and the corresponding serverless function or migration.

If anything in this document is unclear or you want more examples (e.g., a sample React Query hook + function pair), say which area and I'll add a targeted example.
