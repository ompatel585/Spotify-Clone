# Spotify Clone

A realtime music streaming app: listen, see what friends are playing, and chat live.

**Stack:** Next.js 16 · React 19 · RTK Query · Tailwind CSS v4 · NestJS 12 · MongoDB (Mongoose 9) · Socket.io · Cloudinary · TypeScript 7

## Structure

```
Spotify/
├─ backend/    NestJS API. package.json and configs here; all code in backend/src/
├─ frontend/   Next.js app. package.json and configs here; all code in frontend/src/
└─ docs/       implementation plan, progress, architecture & API contract
```

The two apps are independent: separate `package.json`, separate `node_modules`, run in separate terminals.

## Getting started

Requirements: Node 24+, MongoDB (local or Atlas).

**Backend** (http://localhost:5000/api/health)

```bash
cd backend
npm install
cp .env.example .env      # set MONGODB_URI etc.
npm run dev
```

**Frontend** (http://localhost:3000)

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Scripts (run inside `backend/` or `frontend/`)

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with reload |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript 7 check |
| `npm run lint` / `lint:fix` | Biome lint + format |
| `npm run seed` | (backend) seed the database |

## Docs

- [Architecture & API contract](docs/architecture.md)
- [Implementation plan](docs/implementation-plan.md)
- [Progress](docs/implementation-progress.md)
