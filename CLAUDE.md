# Spotify Clone: project rules

Layout: `backend/` (NestJS 12, ESM), `frontend/` (Next.js 16), `docs/`. Each app has its own `package.json` and configs
**outside** `src/`; all code lives in that app's `src/`. No root package.json, no workspaces, no shared package.

## Read first
- `docs/implementation-plan.md`: phased file plan.
- `docs/implementation-progress.md`: what is done; resume from here after any interruption.
- `docs/architecture.md`: REST + socket contract, layering, data model.
- The user's global response format: `C:\Users\ompat\.claude\projects\C--Users-ompat\memory\answer-format.md`.

## Toolchain
- Node 24, TypeScript 7 (native `tsc`; no JS compiler API), so **Biome** for lint/format in each app (no ESLint/Prettier),
  no Nest CLI or Swagger compiler plugin (backend builds with plain `tsc`).
- Run scripts inside each app: `npm run dev | build | typecheck | lint | lint:fix`.

## Conventions
- New files: kebab-case words only (Nest suffixes like `.service.ts` and Next names like `page.tsx` are fine).
- Backend imports are relative with `.js` extensions (NodeNext ESM). Never import Mongoose models outside repositories.
- API types come from the contract file; `backend/src/contracts/index.ts` and `frontend/src/types/contracts.ts` stay identical.
- Responses use `id` (never `_id`). Frontend: server state only in RTK Query, no `any`.
- Git: one branch per phase, natural commit messages, PR → merge into `main`, then stop and report.
