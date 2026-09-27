# 🏪 CariPasarMalam

> **Find and explore night markets (pasar malam) across Malaysia**

[![CI](https://github.com/muazhazali/caripasarmalam/actions/workflows/ci.yml/badge.svg)](https://github.com/muazhazali/caripasarmalam/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A community-maintained directory of pasar malam. Browse markets on a map or as a
filterable list, check which markets are open tonight, and see the details you
need to plan a visit. Built with Next.js and deployed on Cloudflare Workers with
D1, with an open, keyless JSON API.

## ✨ Features

- 🗺️ **Interactive map** — market locations with Leaflet
- 📋 **List view** — search and filter by state, day, and amenities
- 🕐 **Open now** — markets currently trading, based on their schedule
- 📍 **Near me** — find markets closest to your current location
- 🌍 **Bilingual** — full English and Bahasa Malaysia support
- 📱 **Responsive** — mobile-first UI with a PWA manifest
- 🔌 **Public API** — free, keyless, CORS-enabled read access (see below)
- 🤝 **Community suggestions** — anyone can submit a new market or a correction

## 🚀 Quick Start

**Prerequisites:** Node.js 20+ and pnpm 12+ (`corepack enable`).

```bash
git clone https://github.com/muazhazali/caripasarmalam.git
cd caripasarmalam
pnpm install
cp .env.example .env      # then edit the values
pnpm dev                  # http://localhost:3000
```

`pnpm dev` works immediately: the app reads from your local D1 database
(`.wrangler/state`), and Wrangler creates an empty one on first run. An empty
database means the app renders with no markets — seed it if you want data:

```bash
pnpm db:migrate:local   # apply d1/migrations/*
pnpm db:seed:local      # load d1/data.sql (1,139 public markets)
```

## 🛠️ Tech Stack

| Layer         | Choice                                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Framework     | [Next.js](https://nextjs.org/) (App Router, React Server Components)                                                     |
| Language      | [TypeScript](https://www.typescriptlang.org/)                                                                            |
| Hosting       | [Cloudflare Workers](https://workers.cloudflare.com/) via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) |
| Database      | [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite)                                                          |
| Rate limiting | [Durable Objects](https://developers.cloudflare.com/durable-objects/) (`workers/rate-limiter/`)                          |
| Styling       | [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)   |
| Maps          | [Leaflet](https://leafletjs.com/)                                                                                        |
| Validation    | [Zod](https://zod.dev/)                                                                                                  |

## 📁 Project Structure

```
caripasarmalam/
├── app/                      # Next.js App Router
│   ├── api/v1/               # Public JSON API route handlers
│   ├── admin/                # Admin dashboard (login, markets, suggestions)
│   ├── markets/              # List + detail pages
│   ├── map/                  # Map view
│   └── suggest/              # Public market suggestion form
├── components/
│   ├── ui/                   # shadcn/ui primitives
│   ├── admin/                # Admin-only components
│   └── *-client.tsx          # Interactive client components
├── lib/
│   ├── d1.ts                 # Cloudflare D1 binding helpers
│   ├── db.ts                 # Server-side market queries
│   ├── market-types.ts       # `Market` domain types
│   ├── i18n.ts               # English + Malay translations
│   └── api.ts                # CORS / rate limit / cache helpers
├── d1/
│   ├── migrations/           # SQLite schema migrations
│   └── data.sql              # Public market dataset
├── workers/rate-limiter/     # Durable Object rate limiter
└── docs/                     # Preview guide, roadmap, migration archive
```

### Data flow

- **Server components** query D1 directly through `lib/db.ts` (`getMarkets`,
  `getMarketById`, `getAllStates`, `getDistrictsByState`).
- **Client components** call the public API through `lib/markets-api-client.ts`;
  they never touch the database binding.
- **Writes** (admin CRUD and suggestion approval) happen only in server actions
  behind `requireAdmin()` in `lib/auth.ts`.
- `lib/db-transform.ts` maps between SQLite rows and the `Market` type.

### Internationalization

Language (`en` / `ms`) lives in a `language` cookie. `LanguageProvider`
(`components/language-provider.tsx`) exposes `useLanguage()` and
`useTranslations()`. Every user-facing string belongs in `lib/i18n.ts` — add both
translations when you add a string.

### Map components

Leaflet is browser-only. Anything importing it must be dynamically imported with
`ssr: false` (see `components/market-detail-client.tsx` for the pattern).

### Navigation

- Desktop: `components/desktop-navbar.tsx`
- Mobile: `components/mobile-tabbar.tsx` — fixed bottom bar; pages need `pb-16`
  on their main container to avoid overlap.

## 🔌 Public API (v1)

Free and keyless, CORS `*`, cached at the edge. All endpoints live under
`/api/v1/` and return `{ data, meta }` or `{ error: { code, message } }`.

| Endpoint                       | Description                                                                                                                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GET /api/v1/markets`          | Paginated markets. Filters: `state`, `district`, `day`, `status`, `q`, `amen_toilet`, `amen_prayer_room`, `parking_available`, `parking_accessible`, `limit` (≤200, default 100), `offset` |
| `GET /api/v1/markets/{id}`     | A single market, or `404`                                                                                                                                                                  |
| `GET /api/v1/states`           | Distinct states with active markets                                                                                                                                                        |
| `GET /api/v1/districts?state=` | Distinct districts within a state                                                                                                                                                          |

```bash
curl "http://localhost:3000/api/v1/markets?state=Selangor&day=sat&limit=5"
```

**Rate limits:** 60 requests/minute per IP per route. Responses include
`X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset`; breaches
return `429` with `Retry-After`. `POST` on these routes returns `405` — v1 is
read-only.

If you build on this dataset, please credit CariPasarMalam and link back to the
repository.

## 🗄️ Database

Two tables, defined in `d1/migrations/`:

- **`pasar_malams`** — market records. JSON columns (`location`, `schedule`) are
  stored as `TEXT`, so check them with `json_valid(...)`.
- **`market_suggestions`** — community submissions awaiting review. Never
  publicly readable.
- **`market_days`** — one row per market per trading day, replacing a JSON search
  so day filters stay index-backed.

### Changing the schema

```bash
pnpm exec wrangler d1 migrations create caripasarmalam add_my_column
# edit the generated file in d1/migrations/
pnpm db:migrate:local
pnpm db:migrate:remote   # when ready to deploy
```

There is no database-level access control (no RLS). Isolation comes from code:
reads are server-only through the D1 binding, and all writes sit behind
`requireAdmin()`. Keep it that way.

## ⚙️ Environment Variables

Copy `.env.example` to `.env` (see the file for descriptions).

| Variable                           | Required  | Purpose                                                        |
| ---------------------------------- | --------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`             | yes       | Absolute base URL used in metadata, sitemap, and SSR API calls |
| `ADMIN_PASSWORD`                   | for admin | Password for `/admin/login`                                    |
| `JWT_SECRET`                       | for admin | HS256 signing key for the admin session cookie                 |
| `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` | no        | Enables AdSense; leave empty to disable ads                    |
| `ADMIN_EMAIL`                      | no        | Display-only admin identity, defaults to `admin`               |

Set production secrets for the Worker with `wrangler secret put` (see
[docs/cloudflare-preview.md](docs/cloudflare-preview.md)).

## 🧪 Development Checks

```bash
pnpm dev            # development server
pnpm typecheck      # tsc --noEmit
pnpm lint           # ESLint
pnpm format         # Prettier (write)
pnpm format:check   # Prettier (verify, used by CI)
pnpm build          # production build
pnpm preview        # full-stack local run on Workers runtime (http://localhost:8787)
```

`pnpm preview` builds with OpenNext and runs the app plus the rate-limiter Worker
in Miniflare — use it to test D1 bindings, the API, admin login, and rate limits.
See [docs/cloudflare-preview.md](docs/cloudflare-preview.md).

There is no automated test suite yet. Validate changes with `pnpm typecheck`,
`pnpm lint`, `pnpm build`, and the preview smoke checks. A pre-commit hook formats
staged files.

## 🚀 Deployment

Deployment targets Cloudflare Workers and runs from a Linux machine or CI
(OpenNext has limited Windows support for production builds).

```bash
pnpm deploy:rate-limiter   # deploy the rate limiter first, once
pnpm deploy                # build and deploy the app Worker
```

D1 migrations must be applied to the remote database (`pnpm db:migrate:remote`)
before the first deploy that depends on them. Set `ADMIN_PASSWORD` and
`JWT_SECRET` on the Worker before using admin features.

## 🤝 Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) for setup,
conventions, and the pull-request checklist.

### Quickest ways to help

- **Add or fix a market (no code):** use the
  [suggestion form](https://forms.gle/9sXDZYQknTszNSJfA), or the in-app
  `/suggest` page.
- **Report a bug / request a feature:** open a GitHub issue using the templates.
- **Improve the dataset:** see [`dataset/README.md`](dataset/README.md) for the
  raw CSVs and processing script, and [`d1/README.md`](d1/README.md) for the
  import path.
- **Report a security issue:** follow [SECURITY.md](SECURITY.md) instead of
  opening a public issue.

## 🗺️ Roadmap

Planned and considered improvements live in [docs/roadmap.md](docs/roadmap.md).
The completed Supabase → Cloudflare migration is documented in
[docs/cloudflare-migration.md](docs/cloudflare-migration.md) and archived under
[docs/archive/supabase-legacy/](docs/archive/supabase-legacy/).

## 📄 License

[MIT](LICENSE) © Caripasarmalam contributors.

Market data was collected from public Google Maps listings and is provided as-is;
verify details before travelling. See [`dataset/README.md`](dataset/README.md).

## 🙏 Acknowledgments

- Everyone who submits and corrects market data
- Inspired by CariTaman, CariSTPM, CariSurau, and Sedekah.je
- Built with open-source tools, especially Next.js, Cloudflare, and Radix UI
