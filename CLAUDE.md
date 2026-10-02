# Spotify Clone — project rules

Monorepo (npm workspaces): `src/backend` (NestJS 12, ESM), `src/frontend` (Next.js 16), `src/shared` (`@spotify/shared`).

## Read first
- `docs/implementation-plan.md`: phased file plan (source of truth for what gets built).
- `docs/implementation-progress.md`: what is done; resume from here after any interruption.
- `docs/architecture.md`: REST + socket contract, layering, data model. Keep it in sync with `src/shared`.
- The user's global response format: `C:\Users\ompat\.claude\projects\C--Users-ompat\memory\answer-format.md`.

## Toolchain
- Node 24, TypeScript 7 (native `tsc`). There is no TS JS compiler API, so: **Biome** for lint/format (no ESLint/Prettier),
  no Nest CLI or Swagger compiler plugin (backend builds with plain `tsc`), Vitest with SWC for tests.
- Root scripts: `npm run dev | build | typecheck | lint | lint:fix | test | seed`.

## Conventions
- New files: kebab-case words only (Nest suffixes like `.service.ts` and Next names like `page.tsx` are fine).
- Backend imports are relative with `.js` extensions (NodeNext ESM). Never import Mongoose models outside repositories.
- Responses are always the shared types via mappers, with `id` (never `_id`).
- Frontend: server state only in RTK Query; client state in slices; no `any`.
- Git: one branch per phase, natural commit messages, PR → merge into `main`, then stop and report.
