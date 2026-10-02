# Spotify Rebuild — Implementation Plan

Rebuild of `../realtime-spotify-clone` (Vite React + Zustand + Clerk / Express + Mongoose + Socket.io) as a
production-grade **Next.js 16 + NestJS 12 + MongoDB Atlas** monorepo, TypeScript 7 on both sides, Tailwind v4,
RTK Query. Built in 10 phases. Each phase ends with a working, verifiable app and a list of the features available at that point.

## Stack (latest stable, Oct 2026)

| Layer | Choice |
|---|---|
| Runtime | Node.js 24 LTS, npm workspaces |
| Language | TypeScript 7.0.x (strict) everywhere |
| Frontend | Next.js 16.3 (App Router, RSC where useful), React 19, Tailwind CSS v4, RTK Query + Redux Toolkit, Radix primitives, react-hook-form + zod, sonner, lucide-react |
| Backend | NestJS 12 (ESM), Mongoose 9, MongoDB Atlas, Socket.io 4, nestjs-pino, @nestjs/throttler, @nestjs/terminus, @nestjs/swagger, class-validator, argon2, zod (env) |
| Media | Cloudinary: signed uploads straight from the browser |
| Testing | Vitest (unit, both sides), Supertest + mongodb-memory-server (API e2e), Playwright (web e2e) |
| Delivery | Docker (multi-stage), GitHub Actions CI |

## Repository layout

Three sibling folders. Each app is fully independent (its own `package.json`, lockfile and configs **outside** `src/`); all application code lives in that app's `src/`.

```
Spotify/
├─ backend/              NestJS API
│  ├─ package.json, tsconfig*.json, biome.json, .env.example, Dockerfile ...   (outside src)
│  └─ src/               main.ts, app.module.ts, bootstrap/, config/, common/, infrastructure/, modules/
├─ frontend/             Next.js app
│  ├─ package.json, tsconfig.json, next.config.ts, postcss.config.mjs, .env.example ...   (outside src)
│  └─ src/               app/, views/, sections/, components/, api/, store/, hooks/, providers/, services/, lib/, utils/ ...
└─ docs/                 plan, progress, architecture & API contract
```

There is no shared package. The API contract types (rows tagged **SH** below) are written once in `backend/src/contracts/`
and mirrored in `frontend/src/types/contracts/`; `docs/architecture.md` is the single source of truth if they ever differ.

### Backend layering (per module)
`controller` (HTTP / validation / Swagger) → `service` (business rules) → `repository` (only place that talks to Mongoose)
→ `schema`. `mappers` convert documents to the shared response types, so Mongoose documents never leak out of the API.
`dto` classes validate input. Guards and decorators handle auth and roles. A gateway handles socket events.

### Frontend layering
`app/` holds thin route files (metadata, params) → `views/` (one per page) → `sections/` (page regions) →
`components/` (reusable UI + domain pieces). Server state lives in `api/` (RTK Query endpoints injected into one base API).
Client state lives in `store/` (player, realtime, ui slices + listener middleware). Side-effect clients live in `services/` (socket, upload, storage).

## Key decisions (what makes it better than the reference)

| Area | Reference | This build |
|---|---|---|
| Auth | Clerk; backend calls Clerk API on every admin request | Own JWT auth: short-lived access token + rotating refresh token (httpOnly cookies, per-device sessions, reuse detection), argon2id, optional Google OAuth, role stored in DB |
| Cookies / CORS | Cross-origin, hard-coded `localhost:3000` | Next rewrites `/api/*` to the API → first-party cookies, no CORS in prod; origins come from config |
| Sockets | Client sends its own `userId` (impersonation possible); one socket per user (multi-tab breaks) | Handshake authenticated with a 60-second socket ticket; `userId → Set<socketId>` presence; per-user rooms |
| Activity | `"Playing X by Y"` string that gets parsed back | Typed payload `{ songId, title, artist, imageUrl }`, socket events typed in `shared` |
| Uploads | Files go through the server's temp folder + hourly cron cleanup | Signed direct-to-Cloudinary upload with progress; duration read in the browser; Cloudinary assets deleted with the record |
| Data integrity | Album delete is not atomic, no validation | Transactions (Atlas), DTO validation, proper indexes, mapped responses |
| Discovery | Featured / trending / made-for-you are all `$sample` (random) | Trending = plays in the last 7 days; made-for-you = top artists from your listening history; recently played; search; liked songs |
| Chat | Full history loaded in one go, no read state | Cursor-paginated (infinite scroll), optimistic send with ack, typing indicator, unread counts, deep-linkable `/chat/[userId]` |
| Player | Two components fight over `document.querySelector("audio")`; shuffle/repeat buttons do nothing | One audio engine; queue, shuffle, repeat off/all/one, persisted volume, keyboard shortcuts, Media Session (OS media keys) |
| Ops | `console.log`, generic 500s | pino structured logs with request ids, error filters, rate limiting, Helmet, health checks, Swagger, graceful shutdown, Docker, CI |
| Files | Numeric asset names (`1.mp3`) | Word-only kebab-case names everywhere |

## Conventions
- New file names: kebab-case words only (no dates or numeric prefixes). Nest suffixes (`.service.ts`) and Next reserved names (`page.tsx`, `[albumId]`) are allowed.
- Paths in the tables are relative to **BE** = `backend/src/`, **FE** = `frontend/src/`, **SH** = both `backend/src/contracts/` and `frontend/src/types/contracts/`, **Root** = `Spotify/`. Config files (package.json, tsconfig, next.config.ts, .env.example, Dockerfile, test configs) sit in `backend/` or `frontend/` **outside src**.
- "Also updates" lists existing files that a phase changes.
- No commit until all phases' files are written and verified (see the global answer-format rule).

---

## Phase 1 — Monorepo foundation & tooling

| # | Side | Path | Purpose |
|---|---|---|---|
| 1 | Root | package.json | Workspaces (`src/*`), root scripts: dev / build / lint / typecheck / test |
| 2 | Root | .gitignore | Node, Next, dist, env, coverage |
| 3 | Root | .nvmrc | Pin Node 24 |
| 4 | Root | .editorconfig | Editor consistency |
| 5 | Root | .prettierrc | Formatting rules |
| 6 | Root | .prettierignore | Formatting exclusions |
| 7 | Root | tsconfig.base.json | Shared strict compiler options |
| 8 | Root | commitlint.config.mjs | Conventional commits |
| 9 | Root | lint-staged.config.mjs | Lint/format staged files |
| 10 | Root | .husky/pre-commit | Runs lint-staged |
| 11 | Root | .husky/commit-msg | Runs commitlint |
| 12 | Root | README.md | Setup, env, scripts |
| 13 | Root | CLAUDE.md | Project rules for AI sessions (points to answer format + this plan) |
| 14 | Root | docs/implementation-plan.md | This file |
| 15 | Root | docs/architecture.md | Architecture diagrams, request/socket flows, decisions |
| 16 | SH | package.json | `@spotify/shared` package, build to dist (ESM + d.ts) |
| 17 | SH | tsconfig.json | Library build config |
| 18 | SH | index.ts | Barrel export |
| 19 | SH | constants/roles.ts | `UserRole` values |
| 20 | SH | constants/limits.ts | Page sizes, upload size/type limits, message length |
| 21 | SH | types/pagination.types.ts | `Paginated<T>`, `CursorPage<T>` |
| 22 | BE | package.json | Nest 12 deps + scripts (tsc build, watch, start:prod) |
| 23 | BE | tsconfig.json | ESM, decorators + metadata, path aliases |
| 24 | BE | tsconfig.build.json | Excludes tests |
| 25 | BE | eslint.config.mjs | typescript-eslint flat config |
| 26 | BE | .env.example | All env vars documented |
| 27 | BE | main.ts | Bootstrap entry |
| 28 | BE | app.module.ts | Root module |
| 29 | BE | modules/health/health.module.ts | Health module |
| 30 | BE | modules/health/health.controller.ts | `GET /api/health` |
| 31 | FE | package.json | Next 16 deps + scripts |
| 32 | FE | tsconfig.json | Strict, `@/*` alias |
| 33 | FE | next.config.ts | Rewrites `/api/*` → API, image remote patterns, security headers |
| 34 | FE | postcss.config.mjs | Tailwind v4 plugin |
| 35 | FE | eslint.config.mjs | Next + TS lint |
| 36 | FE | .env.example | Public env vars |
| 37 | FE | app/layout.tsx | Root HTML layout |
| 38 | FE | app/(main)/page.tsx | Placeholder home (replaced in Phase 4) |
| 39 | FE | styles/globals.css | Tailwind v4 import + design tokens (`@theme`) |

**After Phase 1 you have:** a monorepo that installs with one `npm install`. `npm run dev` starts the API on :5000 and the web app on :3000. `GET /api/health` works through the Next proxy. Typecheck, lint, Prettier and commit hooks all run, and the shared package builds and is imported by both apps.

---

## Phase 2 — Core infrastructure & design system

| # | Side | Path | Purpose |
|---|---|---|---|
| 40 | BE | bootstrap/setup-app.ts | Global prefix, versioning, ValidationPipe, filters, interceptors, shutdown hooks |
| 41 | BE | bootstrap/setup-security.ts | Helmet, CORS from config, compression, cookie-parser, trust proxy |
| 42 | BE | bootstrap/setup-swagger.ts | OpenAPI at `/api/docs` (non-prod) |
| 43 | BE | config/env.validation.ts | Zod schema; app refuses to boot on invalid env |
| 44 | BE | config/app.config.ts | Port, env, web origin |
| 45 | BE | config/database.config.ts | Atlas URI, pool size, autoIndex per env |
| 46 | BE | config/auth.config.ts | JWT secrets/TTLs, cookie settings, admin emails, Google |
| 47 | BE | config/cloudinary.config.ts | Cloudinary credentials |
| 48 | BE | config/throttle.config.ts | Rate-limit tiers |
| 49 | BE | config/index.ts | Registers config namespaces |
| 50 | BE | infrastructure/database/database.module.ts | Mongoose async connection, retry, connection logging |
| 51 | BE | infrastructure/database/transaction.service.ts | `withTransaction()` helper |
| 52 | BE | infrastructure/logger/logger.module.ts | nestjs-pino: request ids, redaction, pretty in dev |
| 53 | BE | common/constants/app.constants.ts | App-wide constants |
| 54 | BE | common/constants/metadata-keys.constants.ts | Reflector metadata keys |
| 55 | BE | common/filters/all-exceptions.filter.ts | Uniform error body `{ statusCode, message, code, requestId }` |
| 56 | BE | common/filters/mongo-exception.filter.ts | Duplicate key → 409, CastError → 400 |
| 57 | BE | common/interceptors/timeout.interceptor.ts | Request timeout guard |
| 58 | BE | common/pipes/parse-object-id.pipe.ts | Validates ObjectId params |
| 59 | BE | common/dto/pagination-query.dto.ts | `page`, `limit` (bounded) |
| 60 | BE | common/dto/cursor-query.dto.ts | `cursor`, `limit` |
| 61 | BE | common/utils/pagination.util.ts | Builds `Paginated<T>` / `CursorPage<T>` |
| 62 | BE | common/utils/escape-regex.util.ts | Safe user-input regex |
| 63 | BE | common/repositories/base.repository.ts | Generic typed repository (find, paginate, exists, lean) |
| 64 | BE | common/decorators/api-paginated-response.decorator.ts | Swagger helper for paginated responses |
| 65 | BE | common/guards/throttler-proxy.guard.ts | Rate-limits by real client IP behind proxies |
| 66 | FE | config/env.ts | Zod-validated public env |
| 67 | FE | config/site.ts | Site name, metadata defaults |
| 68 | FE | lib/cn.ts | clsx + tailwind-merge |
| 69 | FE | lib/fonts.ts | next/font setup |
| 70 | FE | utils/format.ts | Duration, date, number formatting |
| 71 | FE | utils/errors.ts | Normalizes RTK Query errors to messages |
| 72 | FE | constants/routes.ts | Typed route builders |
| 73 | FE | api/base-query.ts | fetchBaseQuery (credentials, `/api` base) |
| 74 | FE | api/base-api.ts | `createApi` root; endpoints injected per domain |
| 75 | FE | api/tags.ts | Cache tag types |
| 76 | FE | store/index.ts | `makeStore()` (per-request safe for Next) |
| 77 | FE | store/root-reducer.ts | Combines slices + API reducer |
| 78 | FE | store/hooks.ts | Typed `useAppDispatch/useAppSelector` |
| 79 | FE | providers/store-provider.tsx | Client store provider |
| 80 | FE | providers/app-providers.tsx | Store + Toaster + Tooltip providers |
| 81 | FE | components/ui/button.tsx | Variants via cva |
| 82 | FE | components/ui/icon-button.tsx | Accessible icon button |
| 83 | FE | components/ui/input.tsx | Input |
| 84 | FE | components/ui/label.tsx | Label |
| 85 | FE | components/ui/form-field.tsx | Label + control + error wiring |
| 86 | FE | components/ui/card.tsx | Card |
| 87 | FE | components/ui/skeleton.tsx | Skeleton |
| 88 | FE | components/ui/spinner.tsx | Spinner |
| 89 | FE | components/ui/avatar.tsx | Radix avatar |
| 90 | FE | components/ui/badge.tsx | Badge |
| 91 | FE | components/ui/tooltip.tsx | Radix tooltip |
| 92 | FE | components/ui/dialog.tsx | Radix dialog |
| 93 | FE | components/ui/alert-dialog.tsx | Confirm dialogs |
| 94 | FE | components/ui/dropdown-menu.tsx | Radix dropdown |
| 95 | FE | components/ui/scroll-area.tsx | Radix scroll area |
| 96 | FE | components/ui/slider.tsx | Radix slider |
| 97 | FE | components/ui/tabs.tsx | Radix tabs |
| 98 | FE | components/ui/empty-state.tsx | Empty state block |
| 99 | FE | components/common/logo.tsx | Brand logo |
| 100 | FE | components/common/error-fallback.tsx | Shared error UI with retry |
| 101 | FE | app/error.tsx | Route error boundary |
| 102 | FE | app/global-error.tsx | Root error boundary |
| 103 | FE | app/not-found.tsx | 404 route |
| 104 | FE | views/not-found-view.tsx | 404 page UI |
| 105 | FE | app/icon.svg | Favicon |
| 106 | FE | app/manifest.ts | PWA manifest |
| 107 | FE | app/robots.ts | robots.txt |

Also updates: BE `main.ts`, `app.module.ts`, `health.controller.ts` (Mongo health indicator); FE `app/layout.tsx`.

**After Phase 2 you have:** a hardened API foundation. Env vars are validated at boot, the API connects to Atlas, logs are structured with request ids, every error comes back in one consistent shape, and rate limiting, Helmet and Swagger at `/api/docs` are in place. The health check reports DB status. The web app has its full design system, error/404 pages, the Redux store and the RTK Query base wired in.

---

## Phase 3 — Authentication & users

| # | Side | Path | Purpose |
|---|---|---|---|
| 108 | SH | types/user.types.ts | `PublicUser`, `CurrentUser` |
| 109 | SH | types/auth.types.ts | Auth request/response types |
| 110 | BE | modules/users/users.module.ts | Users module |
| 111 | BE | modules/users/users.controller.ts | `GET/PATCH /users/me`, `GET /users` (people list) |
| 112 | BE | modules/users/users.service.ts | Profile logic, admin promotion |
| 113 | BE | modules/users/users.repository.ts | User queries |
| 114 | BE | modules/users/schemas/user.schema.ts | Email (unique), passwordHash (select:false), role, googleId, avatar |
| 115 | BE | modules/users/dto/update-profile.dto.ts | Profile update validation |
| 116 | BE | modules/users/dto/user-query.dto.ts | People search/pagination |
| 117 | BE | modules/users/mappers/user.mapper.ts | Document → shared type |
| 118 | BE | modules/auth/auth.module.ts | Auth module |
| 119 | BE | modules/auth/auth.controller.ts | register, login, refresh, logout, logout-all, me, google, google/callback, socket-ticket |
| 120 | BE | modules/auth/auth.service.ts | Auth flows |
| 121 | BE | modules/auth/services/token.service.ts | Access / refresh / socket-ticket JWTs |
| 122 | BE | modules/auth/services/cookie.service.ts | Set/clear httpOnly cookies |
| 123 | BE | modules/auth/services/password.service.ts | argon2id hash/verify |
| 124 | BE | modules/auth/sessions/session.schema.ts | Per-device refresh session, hashed token, TTL index |
| 125 | BE | modules/auth/sessions/sessions.repository.ts | Rotation + reuse detection |
| 126 | BE | modules/auth/guards/jwt-auth.guard.ts | Global guard honoring `@Public` / `@OptionalAuth` |
| 127 | BE | modules/auth/guards/roles.guard.ts | Role check |
| 128 | BE | modules/auth/guards/google-oauth.guard.ts | Google flow, 404 when not configured |
| 129 | BE | modules/auth/strategies/google.strategy.ts | Passport Google strategy |
| 130 | BE | modules/auth/dto/register.dto.ts | Register validation |
| 131 | BE | modules/auth/dto/login.dto.ts | Login validation |
| 132 | BE | modules/auth/interfaces/jwt-payload.interface.ts | Token payload types |
| 133 | BE | modules/auth/constants/auth.constants.ts | Cookie names, token audiences |
| 134 | BE | common/decorators/public.decorator.ts | `@Public()` |
| 135 | BE | common/decorators/optional-auth.decorator.ts | `@OptionalAuth()` |
| 136 | BE | common/decorators/roles.decorator.ts | `@Roles()` |
| 137 | BE | common/decorators/current-user.decorator.ts | `@CurrentUser()` |
| 138 | BE | common/interfaces/authenticated-request.interface.ts | Typed request |
| 139 | FE | api/reauth-base-query.ts | 401 → single-flight refresh (mutex) → retry; logout on failure |
| 140 | FE | api/endpoints/auth-api.ts | Auth endpoints |
| 141 | FE | api/endpoints/users-api.ts | Users endpoints |
| 142 | FE | hooks/use-auth.ts | Current user, `isAdmin`, logout |
| 143 | FE | schemas/auth-schemas.ts | Zod login/register schemas |
| 144 | FE | proxy.ts | Next 16 proxy: redirects for protected/auth routes |
| 145 | FE | app/(auth)/layout.tsx | Centered auth layout |
| 146 | FE | app/(auth)/login/page.tsx | Login route |
| 147 | FE | app/(auth)/register/page.tsx | Register route |
| 148 | FE | views/login-view.tsx | Login page |
| 149 | FE | views/register-view.tsx | Register page |
| 150 | FE | components/auth/login-form.tsx | RHF + zod form |
| 151 | FE | components/auth/register-form.tsx | RHF + zod form |
| 152 | FE | components/auth/google-button.tsx | Continue with Google |
| 153 | FE | components/auth/auth-card.tsx | Auth card shell |
| 154 | FE | components/layout/user-menu.tsx | Avatar menu: profile, admin link, logout |

Also updates: BE `app.module.ts` (global guards); FE `api/base-api.ts`.

**After Phase 3 you have:** sign-up and login with email/password or Google. Sessions refresh silently and survive reloads. You can log out on one device or on all of them. A reused refresh token revokes the session. Protected routes redirect to `/login`, and admins are set via `ADMIN_EMAILS` and stored as a role in the DB.

---

## Phase 4 — Catalog & app shell

| # | Side | Path | Purpose |
|---|---|---|---|
| 155 | SH | types/music.types.ts | `Song`, `Album`, `AlbumWithTracks` |
| 156 | BE | modules/albums/albums.module.ts | Albums module |
| 157 | BE | modules/albums/albums.controller.ts | `GET /albums` (paginated), `GET /albums/:id` (with tracks) |
| 158 | BE | modules/albums/albums.service.ts | Album logic |
| 159 | BE | modules/albums/albums.repository.ts | Album queries |
| 160 | BE | modules/albums/schemas/album.schema.ts | Album schema + indexes |
| 161 | BE | modules/albums/dto/album-query.dto.ts | List filters |
| 162 | BE | modules/albums/mappers/album.mapper.ts | Mapper |
| 163 | BE | modules/songs/songs.module.ts | Songs module |
| 164 | BE | modules/songs/songs.controller.ts | `GET /songs`, `GET /songs/:id` |
| 165 | BE | modules/songs/songs.service.ts | Song logic |
| 166 | BE | modules/songs/songs.repository.ts | Song queries |
| 167 | BE | modules/songs/schemas/song.schema.ts | albumId + trackNumber, text index, playCount, media public ids |
| 168 | BE | modules/songs/dto/song-query.dto.ts | List filters |
| 169 | BE | modules/songs/mappers/song.mapper.ts | Mapper |
| 170 | BE | infrastructure/database/seeds/seed.ts | `npm run seed` CLI (standalone app context) |
| 171 | BE | infrastructure/database/seeds/seed.module.ts | Seed module |
| 172 | BE | infrastructure/database/seeds/seed.service.ts | Idempotent upserts |
| 173 | BE | infrastructure/database/seeds/data/albums.data.ts | Album seed data |
| 174 | BE | infrastructure/database/seeds/data/songs.data.ts | Song seed data |
| 175 | FE | api/endpoints/albums-api.ts | Album endpoints |
| 176 | FE | api/endpoints/songs-api.ts | Song endpoints |
| 177 | FE | app/(main)/layout.tsx | App shell route layout |
| 178 | FE | app/(main)/loading.tsx | Shell loading state |
| 179 | FE | app/(main)/error.tsx | Shell error boundary |
| 180 | FE | app/(main)/albums/[albumId]/page.tsx | Album route + `generateMetadata` |
| 181 | FE | app/(main)/albums/[albumId]/loading.tsx | Album skeleton |
| 182 | FE | components/layout/app-shell.tsx | Resizable 3-panel layout, mobile collapse |
| 183 | FE | components/layout/left-sidebar.tsx | Sidebar container |
| 184 | FE | components/layout/sidebar-nav.tsx | Home / Search / Library / Messages |
| 185 | FE | components/layout/sidebar-library.tsx | Album list |
| 186 | FE | components/layout/topbar.tsx | Sticky topbar |
| 187 | FE | components/layout/mobile-nav.tsx | Bottom nav on mobile |
| 188 | FE | components/ui/resizable.tsx | Resizable panels |
| 189 | FE | hooks/use-media-query.ts | Breakpoint hook (SSR safe) |
| 190 | FE | hooks/use-greeting.ts | Time-of-day greeting |
| 191 | FE | views/home-view.tsx | Home page |
| 192 | FE | views/album-view.tsx | Album page |
| 193 | FE | sections/home/greeting-header.tsx | Greeting |
| 194 | FE | sections/home/albums-section.tsx | Albums grid |
| 195 | FE | sections/home/new-releases-section.tsx | Latest songs |
| 196 | FE | sections/album/album-hero-section.tsx | Cover, meta, gradient |
| 197 | FE | sections/album/album-tracks-section.tsx | Track table |
| 198 | FE | components/music/album-card.tsx | Album card |
| 199 | FE | components/music/song-card.tsx | Song card |
| 200 | FE | components/music/card-skeleton.tsx | Card skeleton |
| 201 | FE | components/music/section-header.tsx | Title + "Show all" |
| 202 | FE | components/music/track-list.tsx | Track list |
| 203 | FE | components/music/track-row.tsx | Track row |
| 204 | FE | components/common/cover-image.tsx | next/image with fallback |
| 205 | FE | public/logo.svg | Logo |
| 206 | FE | public/google.svg | Google icon |
| 207 | FE | public/media/songs/*.mp3 | **18 files**, copied from reference, renamed to word names (e.g. `city-rain.mp3`) |
| 208 | FE | public/media/covers/*.jpg | **18 files**, song covers, word names |
| 209 | FE | public/media/albums/*.jpg | **4 files**, album covers, word names |

Also updates: FE `app/(main)/page.tsx` (real home), `app/layout.tsx`.

**After Phase 4 you have:** a seeded catalog in Atlas. The full Spotify-style shell has a resizable sidebar and a mobile bottom nav. The home page shows a greeting, albums and new releases, and album pages show a hero section and track list, with skeleton loading states and SEO metadata. Nothing plays yet.

---

## Phase 5 — Audio player

| # | Side | Path | Purpose |
|---|---|---|---|
| 210 | BE | modules/plays/plays.module.ts | Plays module |
| 211 | BE | modules/plays/plays.controller.ts | `POST /plays` (counted after 30s or 50%), `GET /plays/recent` |
| 212 | BE | modules/plays/plays.service.ts | Record event + `$inc` playCount |
| 213 | BE | modules/plays/plays.repository.ts | Play queries |
| 214 | BE | modules/plays/schemas/play-event.schema.ts | userId, songId, playedAt; compound index; TTL 180 days |
| 215 | BE | modules/plays/dto/record-play.dto.ts | Validation |
| 216 | FE | api/endpoints/plays-api.ts | Plays endpoints |
| 217 | FE | types/player.types.ts | `RepeatMode`, queue item types |
| 218 | FE | constants/player.ts | Play threshold, default volume |
| 219 | FE | constants/keyboard-shortcuts.ts | Shortcut map |
| 220 | FE | utils/shuffle.ts | Fisher–Yates that keeps the current track first |
| 221 | FE | services/storage/local-storage.ts | Safe storage wrapper |
| 222 | FE | store/slices/player-slice.ts | Queue, original order, index, shuffle, repeat, volume, mute, isPlaying |
| 223 | FE | store/slices/ui-slice.ts | Queue panel / right panel visibility |
| 224 | FE | store/selectors/player-selectors.ts | Memoized selectors |
| 225 | FE | store/listeners/listener-middleware.ts | Listener middleware setup |
| 226 | FE | store/listeners/persistence-listeners.ts | Persist volume/shuffle/repeat |
| 227 | FE | providers/audio-provider.tsx | Single `HTMLAudioElement` in context |
| 228 | FE | hooks/use-audio-element.ts | Access audio element |
| 229 | FE | hooks/use-audio-progress.ts | currentTime/duration kept out of Redux |
| 230 | FE | hooks/use-media-session.ts | OS media controls + artwork |
| 231 | FE | hooks/use-keyboard-shortcuts.ts | Space, ←/→, M, S, R |
| 232 | FE | hooks/use-play-tracking.ts | Reports a play once the threshold is hit |
| 233 | FE | hooks/use-play-collection.ts | Play a list from an index / toggle if it's the same list |
| 234 | FE | components/player/audio-engine.tsx | Syncs Redux ↔ audio; ended → next/repeat |
| 235 | FE | components/player/player-bar.tsx | Bottom bar |
| 236 | FE | components/player/now-playing.tsx | Cover + title + like |
| 237 | FE | components/player/transport-controls.tsx | Shuffle/prev/play/next/repeat |
| 238 | FE | components/player/seek-bar.tsx | Seek with isolated re-renders |
| 239 | FE | components/player/volume-control.tsx | Volume + mute |
| 240 | FE | components/player/queue-panel.tsx | Up-next list, jump to a track |
| 241 | FE | components/music/play-button.tsx | Hover play/pause |
| 242 | FE | components/music/equalizer-icon.tsx | Animated "now playing" bars |

Also updates: FE `store/index.ts`, `store/root-reducer.ts`, `providers/app-providers.tsx`, `components/layout/app-shell.tsx`, `components/music/track-row.tsx`, `song-card.tsx`, `album-card.tsx`, `sections/album/album-hero-section.tsx`; BE `songs.schema.ts` (playCount use).

**After Phase 5 you have:** full playback: play any song, album or list, next/previous, shuffle, repeat off/all/one, seeking, and volume/mute that are remembered. There's a queue panel, keyboard shortcuts, and OS media keys with lock-screen artwork. Real plays are recorded in the DB.

---

## Phase 6 — Discovery, search & library

| # | Side | Path | Purpose |
|---|---|---|---|
| 243 | SH | types/search.types.ts | Search result types |
| 244 | BE | modules/discovery/discovery.module.ts | Discovery module |
| 245 | BE | modules/discovery/discovery.controller.ts | `/featured`, `/trending`, `/made-for-you`, `/recently-played` |
| 246 | BE | modules/discovery/discovery.service.ts | Trending (7-day plays), made-for-you (top artists → unheard songs, fallback) |
| 247 | BE | modules/discovery/discovery.repository.ts | Aggregation pipelines |
| 248 | BE | modules/search/search.module.ts | Search module |
| 249 | BE | modules/search/search.controller.ts | `GET /search?q=` |
| 250 | BE | modules/search/search.service.ts | `$text` + prefix-regex fallback; songs, albums, artists |
| 251 | BE | modules/search/dto/search-query.dto.ts | Validation |
| 252 | BE | modules/library/library.module.ts | Library module |
| 253 | BE | modules/library/library.controller.ts | `PUT/DELETE /library/likes/:songId`, `GET /library/likes`, `GET /library/likes/ids` |
| 254 | BE | modules/library/library.service.ts | Likes logic |
| 255 | BE | modules/library/library.repository.ts | Likes queries |
| 256 | BE | modules/library/schemas/like.schema.ts | Unique (userId, songId) |
| 257 | FE | api/endpoints/discovery-api.ts | Discovery endpoints |
| 258 | FE | api/endpoints/search-api.ts | Search endpoint |
| 259 | FE | api/endpoints/library-api.ts | Likes with optimistic updates |
| 260 | FE | hooks/use-debounce.ts | Debounce |
| 261 | FE | hooks/use-is-liked.ts | O(1) liked lookup |
| 262 | FE | app/(main)/search/page.tsx | Search route |
| 263 | FE | app/(main)/library/page.tsx | Library route |
| 264 | FE | views/search-view.tsx | Search page, `?q=` synced to URL |
| 265 | FE | views/library-view.tsx | Library page with tabs |
| 266 | FE | sections/home/featured-section.tsx | Featured tiles |
| 267 | FE | sections/home/made-for-you-section.tsx | Personalized |
| 268 | FE | sections/home/trending-section.tsx | Trending |
| 269 | FE | sections/home/recently-played-section.tsx | Recently played |
| 270 | FE | sections/search/search-results-section.tsx | Results lists |
| 271 | FE | sections/search/top-result-section.tsx | Top hit card |
| 272 | FE | sections/search/browse-section.tsx | Empty-query browse |
| 273 | FE | sections/library/liked-songs-section.tsx | Liked songs |
| 274 | FE | sections/library/recent-plays-section.tsx | History |
| 275 | FE | components/music/featured-tile.tsx | Featured tile |
| 276 | FE | components/music/like-button.tsx | Heart toggle |
| 277 | FE | components/music/search-input.tsx | Search box |

Also updates: FE `views/home-view.tsx`, `components/player/now-playing.tsx`, `components/music/track-row.tsx`, `sidebar-nav.tsx`.

**After Phase 6 you have:** a personalized home (featured, made for you, trending by real plays, recently played) and instant search across songs, albums and artists that you can bookmark via the URL. You can like songs with instant (optimistic) UI updates and browse them in a Library page with listening history.

---

## Phase 7 — Realtime presence & activity

| # | Side | Path | Purpose |
|---|---|---|---|
| 278 | SH | socket/socket-events.ts | Typed `ClientToServer` / `ServerToClient` event maps |
| 279 | SH | socket/socket-payloads.ts | Event payload types |
| 280 | BE | bootstrap/setup-socket-adapter.ts | Registers the socket adapter |
| 281 | BE | modules/realtime/realtime.module.ts | Realtime module |
| 282 | BE | modules/realtime/adapters/authenticated-io.adapter.ts | CORS, ping, buffer limits, auth middleware |
| 283 | BE | modules/realtime/middleware/socket-auth.middleware.ts | Verifies the socket ticket at handshake |
| 284 | BE | modules/realtime/gateways/presence.gateway.ts | Connect/disconnect, activity events |
| 285 | BE | modules/realtime/services/presence.service.ts | `userId → Set<socketId>` (multi-tab) |
| 286 | BE | modules/realtime/services/activity.service.ts | Structured now-playing state |
| 287 | BE | modules/realtime/services/realtime-emitter.service.ts | Emit to user rooms from any module |
| 288 | BE | modules/realtime/filters/ws-exception.filter.ts | Socket error shape |
| 289 | BE | modules/realtime/decorators/ws-current-user.decorator.ts | `@WsCurrentUser()` |
| 290 | BE | modules/realtime/interfaces/authenticated-socket.interface.ts | Typed socket |
| 291 | BE | modules/realtime/constants/realtime.constants.ts | Room names |
| 292 | BE | modules/realtime/dto/update-activity.dto.ts | Validation |
| 293 | FE | services/socket/socket-client.ts | Typed singleton; fetches a fresh ticket on every (re)connect |
| 294 | FE | services/socket/register-presence-handlers.ts | Socket → realtime slice |
| 295 | FE | providers/socket-provider.tsx | Connects when authenticated |
| 296 | FE | hooks/use-socket.ts | Socket access + status |
| 297 | FE | store/slices/realtime-slice.ts | Online ids, activities, connection status |
| 298 | FE | store/selectors/realtime-selectors.ts | Selectors |
| 299 | FE | store/listeners/activity-listeners.ts | Player changes → emit activity (debounced) |
| 300 | FE | components/layout/right-panel.tsx | Right panel (friends / queue) |
| 301 | FE | components/social/friends-activity.tsx | Friends list |
| 302 | FE | components/social/friend-activity-item.tsx | Friend row; click to play their song |
| 303 | FE | components/social/online-indicator.tsx | Presence dot |
| 304 | FE | components/social/login-prompt.tsx | Logged-out prompt |
| 305 | FE | components/social/connection-status.tsx | Reconnecting banner |

Also updates: BE `main.ts`, `app.module.ts`, `auth.controller.ts`; FE `store/index.ts`, `root-reducer.ts`, `app-providers.tsx`, `app-shell.tsx`, `shared/index.ts`.

**After Phase 7 you have:** an authenticated realtime connection. Online/offline status stays correct across multiple tabs and devices, and a live "Friends activity" panel shows what everyone is playing. You can click a friend's track to play it, and there's a reconnect indicator.

---

## Phase 8 — Chat

| # | Side | Path | Purpose |
|---|---|---|---|
| 306 | SH | types/chat.types.ts | `Message`, `Conversation` |
| 307 | BE | modules/chat/chat.module.ts | Chat module |
| 308 | BE | modules/chat/chat.controller.ts | Conversations, cursor messages, REST send fallback, mark read |
| 309 | BE | modules/chat/chat.service.ts | Chat logic |
| 310 | BE | modules/chat/gateways/chat.gateway.ts | `message:send` (ack), typing start/stop, `message:read` |
| 311 | BE | modules/chat/repositories/conversations.repository.ts | Conversation queries |
| 312 | BE | modules/chat/repositories/messages.repository.ts | Cursor pagination by `_id` |
| 313 | BE | modules/chat/schemas/conversation.schema.ts | Sorted participant key, last message, unread counts |
| 314 | BE | modules/chat/schemas/message.schema.ts | Message + indexes |
| 315 | BE | modules/chat/dto/send-message.dto.ts | Validation (length, clientId) |
| 316 | BE | modules/chat/dto/message-query.dto.ts | Cursor query |
| 317 | BE | modules/chat/mappers/message.mapper.ts | Mapper |
| 318 | BE | modules/chat/mappers/conversation.mapper.ts | Mapper |
| 319 | FE | api/endpoints/chat-api.ts | Conversations + infinite messages query |
| 320 | FE | services/socket/register-chat-handlers.ts | Socket events → RTK cache (`updateQueryData`) |
| 321 | FE | hooks/use-typing.ts | Throttled typing events |
| 322 | FE | hooks/use-infinite-scroll.ts | Load older messages on scroll |
| 323 | FE | hooks/use-send-message.ts | Optimistic send + ack reconciliation |
| 324 | FE | app/(main)/chat/layout.tsx | Chat two-pane layout |
| 325 | FE | app/(main)/chat/page.tsx | No-selection route |
| 326 | FE | app/(main)/chat/[userId]/page.tsx | Conversation route |
| 327 | FE | views/chat-view.tsx | Chat page |
| 328 | FE | sections/chat/conversations-section.tsx | Conversation list |
| 329 | FE | sections/chat/thread-section.tsx | Message thread |
| 330 | FE | components/chat/conversation-item.tsx | Row with unread + presence |
| 331 | FE | components/chat/chat-header.tsx | Header with status/activity |
| 332 | FE | components/chat/message-bubble.tsx | Bubble with pending/sent/read state |
| 333 | FE | components/chat/message-composer.tsx | Composer |
| 334 | FE | components/chat/typing-indicator.tsx | "typing…" |
| 335 | FE | components/chat/no-conversation.tsx | Empty state |
| 336 | FE | components/chat/unread-badge.tsx | Unread count badge |

Also updates: FE `providers/socket-provider.tsx`, `sidebar-nav.tsx` (unread total); SH `socket-events.ts`, `index.ts`; BE `app.module.ts`.

**After Phase 8 you have:** real-time direct messages with deep links (`/chat/[userId]`), infinite-scroll history, optimistic sending with delivered/read states, a typing indicator, unread badges in the sidebar, and a REST fallback when the socket is down.

---

## Phase 9 — Admin, media uploads & analytics

| # | Side | Path | Purpose |
|---|---|---|---|
| 337 | SH | types/stats.types.ts | Dashboard types |
| 338 | SH | types/media.types.ts | Upload signature types |
| 339 | BE | modules/media/media.module.ts | Media module |
| 340 | BE | modules/media/media.controller.ts | `POST /media/signature` (admin) |
| 341 | BE | modules/media/media.service.ts | Signed params, folders, delete by public id, URL ownership check |
| 342 | BE | modules/media/providers/cloudinary.provider.ts | Configured Cloudinary client |
| 343 | BE | modules/media/dto/upload-signature.dto.ts | Validation |
| 344 | BE | modules/media/enums/upload-kind.enum.ts | audio / cover |
| 345 | BE | modules/songs/dto/create-song.dto.ts | Validation |
| 346 | BE | modules/songs/dto/update-song.dto.ts | Validation |
| 347 | BE | modules/albums/dto/create-album.dto.ts | Validation |
| 348 | BE | modules/albums/dto/update-album.dto.ts | Validation |
| 349 | BE | modules/songs/songs-admin.controller.ts | Admin song CRUD (`@Roles(admin)`) |
| 350 | BE | modules/albums/albums-admin.controller.ts | Admin album CRUD |
| 351 | BE | modules/stats/stats.module.ts | Stats module |
| 352 | BE | modules/stats/stats.controller.ts | `GET /stats/overview`, `/stats/plays`, `/stats/top-songs` |
| 353 | BE | modules/stats/stats.service.ts | Totals, plays per day, top songs, active users |
| 354 | BE | modules/stats/stats.repository.ts | Aggregations |
| 355 | BE | modules/stats/dto/stats-range.dto.ts | Date range validation |
| 356 | FE | api/endpoints/media-api.ts | Signature endpoint |
| 357 | FE | api/endpoints/stats-api.ts | Stats endpoints |
| 358 | FE | api/endpoints/admin-catalog-api.ts | Song/album CRUD with tag invalidation |
| 359 | FE | services/upload/cloudinary-upload.ts | XHR upload with progress + abort |
| 360 | FE | services/audio/read-audio-duration.ts | Duration read from file metadata |
| 361 | FE | hooks/use-cloudinary-upload.ts | Upload state hook |
| 362 | FE | schemas/song-schema.ts | Zod song form |
| 363 | FE | schemas/album-schema.ts | Zod album form |
| 364 | FE | app/admin/layout.tsx | Admin layout + server role check |
| 365 | FE | app/admin/page.tsx | Dashboard route |
| 366 | FE | app/admin/songs/page.tsx | Songs route |
| 367 | FE | app/admin/albums/page.tsx | Albums route |
| 368 | FE | views/admin-dashboard-view.tsx | Dashboard |
| 369 | FE | views/admin-songs-view.tsx | Songs management |
| 370 | FE | views/admin-albums-view.tsx | Albums management |
| 371 | FE | sections/admin/stats-overview-section.tsx | KPI cards |
| 372 | FE | sections/admin/plays-chart-section.tsx | Plays over time |
| 373 | FE | sections/admin/top-songs-section.tsx | Top songs |
| 374 | FE | sections/admin/songs-table-section.tsx | Songs table + search + pagination |
| 375 | FE | sections/admin/albums-table-section.tsx | Albums table |
| 376 | FE | components/layout/admin-sidebar.tsx | Admin nav |
| 377 | FE | components/layout/admin-header.tsx | Admin header |
| 378 | FE | components/admin/stat-card.tsx | KPI card |
| 379 | FE | components/admin/plays-chart.tsx | Chart |
| 380 | FE | components/admin/song-form-dialog.tsx | Create/edit song |
| 381 | FE | components/admin/album-form-dialog.tsx | Create/edit album |
| 382 | FE | components/admin/file-dropzone.tsx | Drag & drop with type/size checks |
| 383 | FE | components/admin/upload-progress.tsx | Progress display |
| 384 | FE | components/admin/delete-confirm-dialog.tsx | Confirm destructive actions |
| 385 | FE | components/ui/table.tsx | Table |
| 386 | FE | components/ui/select.tsx | Radix select |
| 387 | FE | components/ui/pagination.tsx | Pagination |
| 388 | FE | components/ui/progress.tsx | Progress bar |
| 389 | FE | hooks/use-pagination-params.ts | URL-synced page/limit |

Also updates: BE `songs.service.ts`, `albums.service.ts` (transactional delete + Cloudinary cleanup), `songs.module.ts`, `albums.module.ts`, `app.module.ts`; FE `user-menu.tsx`, `proxy.ts`.

**After Phase 9 you have:** an admin dashboard with KPIs, a plays-over-time chart and top songs. Admins can create, edit and delete songs and albums, with drag-and-drop uploads that go straight to Cloudinary with live progress and automatic duration detection. Album deletes are atomic and also clean up Cloudinary files, and admin routes are protected on both server and client.

---

## Phase 10 — Testing, CI/CD & deployment

| # | Side | Path | Purpose |
|---|---|---|---|
| 390 | BE | vitest.config.ts | Unit test config (SWC for decorators) |
| 391 | BE | vitest.e2e.config.ts | E2E config |
| 392 | BE | test/utils/test-app.factory.ts | Boots app for e2e |
| 393 | BE | test/utils/mongo-memory.ts | In-memory MongoDB replica set |
| 394 | BE | test/e2e/auth.e2e-spec.ts | Register/login/refresh/reuse detection |
| 395 | BE | test/e2e/catalog.e2e-spec.ts | Albums/songs/search/admin CRUD |
| 396 | BE | test/e2e/chat.e2e-spec.ts | Conversations, pagination, read |
| 397 | BE | test/e2e/realtime.e2e-spec.ts | Socket auth, presence, multi-tab |
| 398 | BE | modules/auth/auth.service.spec.ts | Unit |
| 399 | BE | modules/auth/services/token.service.spec.ts | Unit |
| 400 | BE | modules/realtime/services/presence.service.spec.ts | Unit |
| 401 | BE | modules/discovery/discovery.service.spec.ts | Unit |
| 402 | BE | modules/chat/chat.service.spec.ts | Unit |
| 403 | BE | modules/library/library.service.spec.ts | Unit |
| 404 | BE | Dockerfile | Multi-stage, non-root, healthcheck |
| 405 | BE | .dockerignore | Docker context exclusions |
| 406 | FE | vitest.config.ts | Unit test config (jsdom) |
| 407 | FE | vitest.setup.ts | Testing Library setup |
| 408 | FE | playwright.config.ts | E2E config |
| 409 | FE | store/slices/player-slice.test.ts | Queue/shuffle/repeat logic |
| 410 | FE | api/reauth-base-query.test.ts | Single-flight refresh |
| 411 | FE | utils/shuffle.test.ts | Shuffle |
| 412 | FE | utils/format.test.ts | Formatting |
| 413 | FE | components/music/track-row.test.tsx | Component |
| 414 | FE | components/player/transport-controls.test.tsx | Component |
| 415 | FE | tests/e2e/auth.spec.ts | Login flow |
| 416 | FE | tests/e2e/playback.spec.ts | Play/next/shuffle |
| 417 | FE | tests/e2e/chat.spec.ts | Two-browser chat |
| 418 | FE | Dockerfile | Next standalone output, multi-stage |
| 419 | FE | .dockerignore | Docker context exclusions |
| 420 | Root | .github/workflows/ci.yml | Install, typecheck, lint, unit + API e2e, build |
| 421 | Root | .github/workflows/e2e.yml | Playwright |
| 422 | Root | .github/dependabot.yml | Dependency updates |
| 423 | Root | docker-compose.yml | Run web + api locally against Atlas |
| 424 | Root | docs/deployment.md | Atlas, Cloudinary, Render/Railway + Vercel guide |
| 425 | Root | docs/security.md | Threat model & checklist |

Also updates: root `package.json`, BE/FE `package.json` (test scripts), FE `next.config.ts` (`output: "standalone"`), `README.md`.

**After Phase 10 you have:** a production-ready app. Unit, API e2e and browser e2e tests cover the critical flows, CI runs on every PR, and both apps have Docker images and a documented path to deploy on Atlas + Cloudinary + Vercel/Render, plus a security checklist.

---

## Totals

| Phase | Files |
|---|---|
| 1 Foundation | 39 |
| 2 Core infrastructure | 68 |
| 3 Auth & users | 47 |
| 4 Catalog & shell | 55 rows (52 code + 40 media assets in 3 batch rows) |
| 5 Player | 33 |
| 6 Discovery/search/library | 35 |
| 7 Realtime | 28 |
| 8 Chat | 31 |
| 9 Admin/media/analytics | 53 |
| 10 Testing & delivery | 36 |
| **Total** | **425 numbered rows = 462 files** (plus "also updates" edits) |

## Verification gate per phase
Each phase is done only when: `npm run typecheck` and `npm run lint` pass in both apps, both apps build, and that phase's features are smoke-tested live (API via Swagger/curl, web in the browser). Phases 1–9 add tests where cheap; Phase 10 completes coverage.

## Known risk
TypeScript 7 (native compiler) + Nest decorators: Nest needs `experimentalDecorators` + `emitDecoratorMetadata`. Phase 1 verifies this first with a real DI + ValidationPipe smoke test. The backend builds with `tsc` directly rather than the Nest CLI, whose compiler-API integration targets TS 6. If metadata emission fails under TS 7, work stops and the user is asked before any fallback.
