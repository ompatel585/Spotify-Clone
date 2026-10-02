# Spotify Clone

A realtime music streaming app: listen, see what friends are playing, and chat live.

**Stack:** Next.js 16 · React 19 · RTK Query · Tailwind CSS v4 · NestJS 12 · MongoDB (Mongoose 9) · Socket.io · Cloudinary · TypeScript 7

## Structure

```
src/
  backend/    NestJS API (modules: auth, users, songs, albums, plays, discovery, search, library, realtime, chat, media, stats)
  frontend/   Next.js app (app routes → views → sections → components; RTK Query in api/, client state in store/)
  shared/     @spotify/shared — types, socket contracts, constants used by both apps
docs/         implementation plan, progress, architecture & API contract
```

## Getting started

Requirements: Node 24+, MongoDB (local or Atlas).

```bash
npm install                         # installs all workspaces and builds @spotify/shared
cp src/backend/.env.example src/backend/.env
cp src/frontend/.env.example src/frontend/.env.local
npm run seed                        # sample albums & songs
npm run dev                         # API on :5000, web on :3000
```

Open http://localhost:3000. API docs: http://localhost:5000/api/docs.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Shared (watch) + API (watch) + web (dev) together |
| `npm run build` | Production build of all workspaces |
| `npm run typecheck` | TypeScript 7 across all workspaces |
| `npm run lint` / `lint:fix` | Biome lint + format check / fix |
| `npm run test` | Unit tests |
| `npm run seed` | Seed the database |

## Docs

- [Architecture & API contract](docs/architecture.md)
- [Implementation plan](docs/implementation-plan.md)
- [Progress](docs/implementation-progress.md)
