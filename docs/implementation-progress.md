# Implementation Progress

Resume point after any interruption (session limit, crash). Update at the end of every work batch.

| Phase | Branch | Status | PR |
|---|---|---|---|
| 1 Foundation & tooling | feature/project-foundation | done | #2 |
| 2 Core infrastructure & design system | feature/core-infrastructure | done | #3 |
| 3 Auth & users | feature/auth-and-users | done | #4 |
| 4 Catalog & app shell | | | |
| 5 Audio player | | | |
| 6 Discovery, search & library | | | |
| 7 Realtime presence | | | |
| 8 Chat | | | |
| 9 Admin, media & analytics | | | |
| 10 Testing, CI/CD & deploy | | | |

## Layout (corrected 2026-10-02)
`Spotify/backend`, `Spotify/frontend`, `Spotify/docs`. Each app has its own `package.json`, lockfile and config files
**outside** `src/`; all code is inside that app's `src/`. There is no root `package.json`, no workspaces, no shared package.
The first attempt used `Spotify/src/{backend,frontend,shared}` with workspaces; it was deleted and git history wiped.

## Deviations from the plan
- **No shared package.** The API contract (types, constants, socket event maps) lives in one dependency-free file mirrored
  byte-for-byte: `backend/src/contracts/index.ts` and `frontend/src/types/contracts.ts`. Rows tagged SH in the plan map to this file.
- **Biome** (one per app) replaces ESLint + Prettier: TS 7 has no JS compiler API, which typescript-eslint needs.
- **No root tooling** (husky, commitlint, lint-staged) since there is no root package.json.
- `modules/health/health.service.ts` added (controller → service layering).
- `@nestjs/swagger` has an optional TS ≤6 peer → `overrides: { typescript: "$typescript" }` in `backend/package.json`.
- Local MongoDB 8.3 is standalone (no transactions); `TransactionService` (Phase 2) falls back automatically. Atlas later.
- Next 16 writes `frontend/AGENTS.md` / `CLAUDE.md` (pointer to its bundled docs); kept.

## Log
- Phase 1: TS 7 verified with Nest 12 DI and the Next 16.3 build; both apps run independently; `/api/health` works
  through the Next proxy. Typecheck + Biome clean in both apps.
- Phase 2: backend infrastructure (validated config, pino logs with request ids, uniform error filters, rate limiting
  with a strict tier, Helmet/CORS, Swagger, Mongo connection with retry, transaction fallback, health live/ready) and
  frontend design system (store, RTK Query base, 18 UI components, error/404 pages, component showcase at `/`).
  Verified on both apps: lint, typecheck and build clean; full stack run against local MongoDB, `/api/health` through the proxy.
  Deviations: health keeps its own `{status, uptime, db}` body even on 503 (probes need it); env is validated in `main.ts`
  and in each config factory rather than via ConfigModule `validate`; frontend uses the unified `radix-ui` package;
  `app/error.tsx` uses Next 16's `retry` prop; extra files: request-id middleware, validation-errors util, request-timeout and
  strict-throttle decorators (backend), api-status and toast-demo-button (frontend).
- Phase 3: register/login/refresh/logout/logout-all/me, Google OAuth (off until credentials are set), argon2id, rotating
  refresh sessions per device with reuse detection, default-deny global guards, admin role from ADMIN_EMAILS, users list;
  frontend login/register pages, route protection in proxy.ts, single-flight 401 refresh, user menu. The Phase 2 component
  showcase moved to /design-system (dev only) after the user saw it as the first screen; `/` now redirects to /login.
  Verified: lint, typecheck, build clean in both apps from a clean checkout; full stack run with two users through the Next
  proxy (own data, device-independent sessions, rotation, logout vs logout-all, 401/409 cases). Real Google login and a
  browser hydration check were NOT done (no credentials / no browser tool).
  Fixes found by the integration check: frontend `typecheck` now runs `next typegen` first and tsconfig no longer excludes
  `.next` (global `PageProps` types were missing on a clean checkout).
