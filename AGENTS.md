# AGENTS.md

Guidance for AI coding agents working in this repository. Human contributors
should read [CONTRIBUTING.md](CONTRIBUTING.md) instead.

## Commands

```bash
pnpm dev            # development server (http://localhost:3000), local D1 via Wrangler
pnpm build          # production build (also type-checks)
pnpm typecheck      # tsc --noEmit, fastest type check
pnpm lint           # ESLint
pnpm lint:fix       # ESLint with auto-fix
pnpm format         # Prettier, write
pnpm format:check   # Prettier, verify (CI uses this)

# Full-stack local run on the Workers runtime (Miniflare) at http://localhost:8787
pnpm preview

# Local D1
pnpm db:migrate:local                      # apply d1/migrations
pnpm db:seed:local                         # load d1/data.sql
pnpm exec wrangler d1 migrations create caripasarmalam <name>   # new migration
```

There are no automated tests. Validate changes with `pnpm typecheck`, `pnpm lint`,
`pnpm build`, and the preview smoke checks in
[docs/cloudflare-preview.md](docs/cloudflare-preview.md). CI runs
`format:check`, `lint`, `typecheck`, and `build`.

## Architecture

**Next.js App Router** (Next 16) with React Server Components, deployed on
**Cloudflare Workers** through `@opennextjs/cloudflare`, backed by **Cloudflare
D1** (SQLite). Pages fetch data server-side and pass it to `*-client.tsx`
components that handle interactivity.

### Data flow

- **Database**: D1 binding `DB`, accessed only server-side. `lib/d1.ts` wraps
  `getCloudflareContext({ async: true })` and JSON/boolean helpers.
- **Queries**: `lib/db.ts` — `getMarkets()`, `getMarketById()`, `getAllStates()`,
  `getDistrictsByState()`, `getAdminMarkets()`, plus admin write helpers.
  `lib/suggestions-db.ts` covers suggestions.
- **Row ↔ domain mapping**: `lib/db-transform.ts` (`dbRowToMarket`,
  `marketFormToDbRow`).
- **Core type**: `Market` in `lib/market-types.ts` (types only — there is no
  static data array). `MarketSchedule[]` uses `DayCode` from `app/enums.ts`.
- **Client fetches**: `lib/markets-api-client.ts` calls `/api/v1/markets`.
  Client components must never import `lib/d1.ts` or `lib/db.ts`.
- **Writes**: server actions only, behind `requireAdmin()` (`lib/auth.ts`).
  Every market write must keep `market_days` in sync with `schedule`.
- **Public API**: `app/api/v1/*` route handlers using helpers in `lib/api.ts`
  (CORS, rate limiting via the `RATE_LIMITER` service binding, cache headers).
- **Rate limiter**: separate Worker exporting a Durable Object, in
  `workers/rate-limiter/` (outside the root tsconfig).

### Auth

Single admin: password compared in constant time against `ADMIN_PASSWORD`, then a
`jose` HS256 JWT in an HttpOnly `admin_session` cookie. `proxy.ts` (Next 16
middleware) gates `/admin/*` on that cookie and sets the `x-pathname` header.

### Internationalization

Language (`en` / `ms`) is stored in a `language` cookie. `LanguageProvider`
(`components/language-provider.tsx`) exposes `useLanguage()` and
`useTranslations()`. All user-facing strings live in `lib/i18n.ts` — add both
languages when adding a string.

### Map

Leaflet is client-only. Components importing it must be dynamically imported with
`ssr: false`.

### Navigation

- Desktop: `components/desktop-navbar.tsx`
- Mobile: `components/mobile-tabbar.tsx` (fixed bottom bar; pages need `pb-16`)

### Key routes

- `/` — homepage with featured markets and filters
- `/markets` — filterable list (`components/markets-filter-client.tsx`)
- `/markets/[id]` — market detail
- `/map` — map view (`/markets/map` redirects here)
- `/suggest` — public suggestion form; `/admin/*` — admin dashboard
- `/api/v1/{markets,markets/[id],states,districts}` — public JSON API

## Conventions

- Prettier: 120-column width. Run `pnpm format` before committing; the pre-commit
  hook formats staged files with lint-staged.
- Do not add comments unless they explain non-obvious intent.
- Prefer server components; add `"use client"` only for interactivity.
- New UI primitives should come from shadcn/ui, not hand-rolled.
- Schema changes require a new file in `d1/migrations/`; never edit an applied
  migration.
- Do not commit `.env`, `.dev.vars`, or anything under `docs/archive/supabase/`
  (it contains submitter emails).

## Environment variables

Copy `.env.example` to `.env` for `pnpm dev`; see that file for the full list and
[README.md](README.md#-environment-variables) for descriptions.

## Superseded files

`docs/cloudflare-migration.md` and `docs/archive/supabase-legacy/` document the
completed Supabase → Cloudflare migration. They are historical; do not treat them
as current architecture, and do not re-add Supabase dependencies to build the app.
