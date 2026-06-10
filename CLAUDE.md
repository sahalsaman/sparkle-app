@AGENTS.md

# Sparkle — architecture

Sparkle is a **B2C mini-games app for individual users**. People sign up, play
mini games, climb a global leaderboard, join public chat rooms, and enter weekly
challenges. There is no company/tenant concept — all data is global (single
tenant).

## Roles

Exactly two roles (`src/types/index.ts` → `ROLES`):

- **`ADMIN`** — the app owner. Sees the admin area (`/admin/*`): analytics, users,
  challenge management.
- **`USER`** — a public player (the default for everyone who registers).

`isAdminRole(role)` is just `role === "ADMIN"`. The app owner is designated by the
**`ADMIN_EMAIL`** env var: whoever registers/logs in with that email becomes
`ADMIN`, everyone else is `USER` (see `src/app/actions/auth.ts`).

## Stack

- **Next.js 16** (App Router, Turbopack, React 19) — but see `AGENTS.md`: this
  version differs from training data, read `node_modules/next/dist/docs/` first.
- **Custom server** (`server.ts`, run via `tsx`) hosting Next + a **Socket.io**
  server on `/api/socket` for realtime (rooms chat, notifications). It runs behind
  a reverse proxy; Auth.js `trustHost` + `x-forwarded-*` handling is wired for that.
- **Auth.js / NextAuth v5 beta** (JWT sessions) — Credentials (bcrypt) + optional
  Google. Split config: `src/lib/auth.config.ts` (edge-safe, used by `proxy.ts`
  middleware for route gating) and `src/lib/auth.ts` (full config with the
  Credentials provider and DB access).
- **MongoDB via Mongoose** — connection is cached on `globalThis` in `src/lib/db.ts`
  (`connectDB()`). Models live in `src/models/`.
- **UI**: Tailwind v4, Radix primitives, shadcn-style components in
  `src/components/ui/`, framer-motion, next-themes, lucide icons.
- **State**: Zustand (`src/store/`).
- **Validation**: Zod on every server action / route handler.

## Layout

- `src/app/(app)/*` — authenticated app: `dashboard`, `games` (memory/sudoku/chess),
  `challenges`, `rooms`, `leaderboard`, `notifications`, `profile`, and `admin/*`
  (`admin`, `admin/users`, `admin/challenges`). Gated by `src/app/(app)/layout.tsx`
  and the middleware in `proxy.ts`/`auth.config.ts` (`/admin` requires `ADMIN`).
- `src/app/login`, `src/app/register` — auth pages. `src/app/page.tsx` → landing.
- `src/app/actions/*` — server actions (`auth`, `challenges`, `rooms`, `upload`).
- `src/app/api/*` — route handlers (`auth/[...nextauth]`, `games/sessions`).
- `src/models/` — `User`, `Game`, `GameSession`, `Challenge`, `ChallengeSubmission`,
  `Room`, `Message`, `Leaderboard`, `Notification`. **No `Company` model.** None of
  these carry a `companyId`.
- `src/lib/` — `db`, `auth`, `auth.config`, `games` (game defaults + point awards),
  `socket-server` (`emitToUser`/`emitToRoom`), `socket-client`, `chess`, `sudoku`,
  `cloudinary`, `utils`.

## Conventions

- Server actions and route handlers: `await auth()` for the session, `connectDB()`,
  validate input with Zod, then `revalidatePath` / emit socket events as needed.
- Pages that hit the DB use `export const dynamic = "force-dynamic"`.
- Leaderboard/rank queries are global (`User.find({})` sorted by `totalPoints`) —
  there is no per-tenant scoping.
- Game results POST to `/api/games/sessions`, which awards points (`src/lib/games.ts`)
  and increments `User.totalPoints`.

## Commands

- `npm run dev` — Next + Socket.io via `tsx watch server.ts` (port 3010).
- `npm run build` — `next build`.
- `npm start` — production (`NODE_ENV=production tsx server.ts`).
- `npm run lint` — eslint.

Env: copy `.env.example` → `.env.local`. Key vars: `MONGODB_URI`, `MONGODB_DB`,
`AUTH_SECRET`, `AUTH_URL`, `ADMIN_EMAIL`, optional `GOOGLE_CLIENT_ID/SECRET`,
Cloudinary, Firebase.
