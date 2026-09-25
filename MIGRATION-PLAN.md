# Migration Plan: Supabase + Vercel → Cloudflare Stack

**Project:** caripasarmalam (Next.js 16 App Router, Malaysian night-market directory)
**Date:** 2026-09-23
**Decisions locked in with owner:**

| Decision | Choice |
| --- | --- |
| Hosting | Cloudflare **Workers** (not Pages — Pages is in maintenance mode) via **@opennextjs/cloudflare** adapter |
| Admin auth | Replace Supabase Auth with **single admin password + HS256 JWT HttpOnly cookie** |
| Public API | **Open read, no API keys** — `GET /api/v1/*`, CORS `*`, OpenAPI-documented |
| Rate limiting | **Durable Objects** (precise windows; Workers `ratelimit` binding only supports 10s/60s windows, GA since Sep 2025) |
| Data migration | **One-time production export** from Supabase → D1 (seed files are reference only) |
| Analytics | Replace Vercel Analytics with **Cloudflare Web Analytics** (note: `@vercel/analytics` is currently installed but **never imported** — the site already self-hosts Umami) |

---

## 1. Current-state inventory (what must migrate)

### 1.1 Stack today
- **Next.js 16.2** App Router, RSC-first, server/client split (`*-client.tsx` convention), Turbopack, PWA package present but **disabled** (`isPWAEnabled = false` in `next.config.mjs:55`).
- **Supabase (Postgres)** — 2 tables, RLS, one trigger:
  - `pasar_malams` — varchar(128) PK, `jsonb` `schedule` + `location`, GIN index on `schedule`, status CHECK constraint, `update_pasar_malams_updated_at` trigger. RLS: public SELECT, authenticated write.
  - `market_suggestions` — uuid PK, FK `target_id → pasar_malams(id)`, `data jsonb`, `reviewed_by` FK to `auth.users`.
- **Supabase Auth** — single admin, email gate (`ADMIN_EMAIL` env). Touchpoints: `proxy.ts` (Next 16 middleware, session check + `x-pathname` header), `lib/auth.ts` (`requireAdmin`), `lib/supabase.ts` (server + service-role clients), `lib/supabase-client.ts` (browser), `app/admin/login/login-client.tsx` (`signInWithPassword`), `app/admin/actions.ts` (`signOut`).
- **Server actions** (no REST routes exist today):
  - `app/suggest/actions.ts` — public suggestion submission, honeypot, **in-process rate limiter 5/hour** (comment already says "for production replace with Redis" → becomes DO).
  - `app/admin/actions.ts` — market CRUD + status, `revalidatePath`.
  - `app/admin/suggestions/actions.ts` — approve (creates/updates market) / reject.
- **Data access**: `lib/db.ts` (`getMarkets` w/ filters incl. JSONB contains `schedule @> '[{"days":["mon"]}]'` via GIN, `getMarketById`, `getAllStates`, `getDistrictsByState`, `getAdminMarkets` w/ exact count), `lib/suggestions-db.ts`, `lib/db-transform.ts` (row↔`Market`).
- **Browser-side direct DB access** (must be rerouted to the new API): `components/homepage-client.tsx:173`, `components/markets-filter-client.tsx:216`, `app/map/page.tsx:70` — all fetch all Active markets via `supabase-client`.
- **Vercel**: `@vercel/analytics` dep (unused in code).
- **Env vars today**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUGGEST_MARKET_URL`, `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID`.
- **No automated tests.** Validation = `pnpm build` (typecheck) + `pnpm lint` + manual smoke.

### 1.2 Constraints
- **Open source** → public, documented, keyless API is a feature; abuse protection via rate limits + caching, not keys.
- **Windows dev machine** → OpenNext has limited Windows support; builds/deploys must run in **GitHub Actions (ubuntu-latest)**; local `next dev` for UI work is fine.
- **D1 free-tier enforcement (since 2026-09-01)**: 5M rows read/day, 100K rows written/day, hard-fail at midnight UTC reset. A full scan of ~2k markets per uncached request ≈ 2k row reads → caching is mandatory, not optional.
- Worker size limit: 3 MiB gzip (free) / 10 MiB (paid).

---

## 2. Target architecture

```
                    ┌────────────────────────────────────────────┐
   Browser ───────► │  Worker: caripasarmalam (OpenNext)         │
   (site + API)     │  - Next.js app (RSC, server actions)       │
                    │  - /api/v1/* route handlers (CORS *, 429)  │
                    │  - static assets (.open-next/assets)       │
                    └───┬──────────────────────┬─────────────────┘
                        │ bindings             │ service binding
              ┌─────────▼────────┐   ┌─────────▼───────────┐   ┌──────────────────┐
              │ D1: caripasarmalam│   │ Worker: rate-limiter│   │ Cache API / CDN  │
              │ (SQLite, 2+1 tbl)│   │ DO: RateLimiter     │   │ (public GETs)    │
              └──────────────────┘   └─────────────────────┘   └──────────────────┘
```

- One main Worker runs the app **and** the public API (no HTTP hop from RSC to DB — `lib/db.ts` keeps direct D1 binding).
- A tiny second Worker exports the `RateLimiter` Durable Object (documented OpenNext multi-worker pattern; the generated OpenNext entry can't host custom DO classes cleanly).
- Public GET API responses are edge-cached (Cache API) with short TTLs to protect D1 row reads.

**New deps:** `@opennextjs/cloudflare`, `wrangler`, `jose` (JWT — Web Crypto native, edge-safe). **Removed deps:** `@supabase/ssr`, `@supabase/supabase-js`, `@vercel/analytics`.

---

## 3. Phase plan

### Phase 0 — Prep (≈0.5 day)
1. Branch `migrate/cloudflare`.
2. `wrangler login`; create resources:
   - `npx wrangler d1 create caripasarmalam`
   - `npx wrangler workers deploy rate-limiter` (Phase 5 stub first, real DO later)
3. CI: `.github/workflows/deploy.yml` (ubuntu-latest): `pnpm install` → `pnpm lint` → `pnpm build` → `opennextjs-cloudflare build` → `wrangler d1 migrations apply caripasarmalam --remote` → `wrangler deploy` (main worker) + deploy rate-limiter worker. Secrets in GH: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`; app secrets via `wrangler secret put`.
4. **Spike: deploy the unmodified app to a workers.dev URL** (OpenNext build via CI). This validates the riskiest unknown — Next 16 + Turbopack + OpenNext compatibility and Worker gzip size — before any code changes; fail fast here instead of in Phase 5.
5. Update `AGENTS.md` + `README.md` env/deploy docs as changes land.

**Validate:** CI green on the branch; unmodified app loads from workers.dev (spike).

### Phase 1 — D1 schema + data migration (≈1 day)

**`d1/migrations/0001_schema.sql`** (SQLite):

```sql
CREATE TABLE pasar_malams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active'
    CHECK (status IN ('Active','Inactive','Suspended','Closed')),
  description TEXT,
  area_m2 REAL,
  total_shop INTEGER,
  parking_available INTEGER NOT NULL DEFAULT 0,
  parking_accessible INTEGER NOT NULL DEFAULT 0,
  parking_notes TEXT,
  amen_toilet INTEGER NOT NULL DEFAULT 0,
  amen_prayer_room INTEGER NOT NULL DEFAULT 0,
  location TEXT,                -- JSON: {latitude, longitude, gmaps_link}
  schedule TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(schedule)),
  schedule_days TEXT NOT NULL DEFAULT '',  -- denormalized: 'mon,tue,sat'
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  shop_list TEXT
);
CREATE INDEX idx_pm_state ON pasar_malams(state);
CREATE INDEX idx_pm_state_district ON pasar_malams(state, district);
CREATE INDEX idx_pm_status ON pasar_malams(status);

CREATE TABLE market_days (                -- indexed day filter (replaces GIN @>)
  market_id TEXT NOT NULL REFERENCES pasar_malams(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  PRIMARY KEY (market_id, day)
);
CREATE INDEX idx_market_days_day ON market_days(day);

CREATE TABLE market_suggestions (
  id TEXT PRIMARY KEY,                    -- uuid v4 generated in app (crypto.randomUUID)
  type TEXT NOT NULL CHECK (type IN ('new','update')),
  target_id TEXT REFERENCES pasar_malams(id) ON DELETE SET NULL,
  data TEXT NOT NULL CHECK (json_valid(data)),
  submitter_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected')),
  rejection_reason TEXT,
  reviewed_by TEXT,                       -- was auth.users FK; single admin → constant or NULL
  created_at TEXT NOT NULL,
  reviewed_at TEXT
);
CREATE INDEX idx_suggestions_status ON market_suggestions(status, created_at DESC);
```

Key schema deltas vs Postgres:
- `jsonb` → `TEXT` JSON columns; **`schedule_days`/`market_days` replace the GIN `@>` query** (SQLite JSON1 `json_each` works but full-scans; the join table is index-backed and keeps API day filtering cheap on D1 row-read billing).
- `gen_random_uuid()` default → app-side `crypto.randomUUID()` (native in Workers).
- `timestamptz` → TEXT ISO-8601; `numeric/boolean` → REAL/INTEGER (0/1). **`updated_at` set in app code on every write** (SQLite can't assign NEW.* in triggers like Postgres).
- RLS → deleted; enforcement moves into code: reads are server-only via D1 binding, writes only from server actions after `requireAdmin()` (equivalent guarantees; no DB-level backstop — document this).
- `market_suggestions` gains **no** public insert path (same as today: only the validated server action writes).

**Data export (one-time, from live Supabase):**
1. `scripts/export-supabase.mjs` — pages all rows of both tables via service-role `supabase-js`, transforms rows (jsonb→JSON string, booleans→0/1, derive `schedule_days` from schedule), writes `d1/data.sql` with SQLite-flavored INSERTs (batched ~500 rows/stmt).
2. Apply: `npx wrangler d1 migrations apply caripasarmalam --remote` then `npx wrangler d1 execute caripasarmalam --remote --file=d1/data.sql`.
3. **Parity check** `scripts/verify-d1-parity.mjs`: row counts match Supabase counts; spot-check 10 random IDs field-by-field; verify every `schedule_days` entry matches schedule JSON.
4. **Backup:** `pg_dump` (or Supabase CSV exports) archived in `docs/archive/supabase/` before teardown — D1 has no point-in-time restore on free tier, and this is the only rollback path for data.

**Validate:** parity script passes; `wrangler d1 execute ... "SELECT count(*) FROM pasar_malams WHERE status='Active'"` sane.

### Phase 2 — Data-access layer swap (≈1.5 days)

Rewrite against D1 binding (`getCloudflareContext().env.DB` from `@opennextjs/cloudflare`):

- **`lib/d1.ts`** (new): typed `getDB()` wrapper; JSON helpers (`parseJson<T>(text, fallback)`), row↔`Market` reuse of `db-transform.ts` (rows already match its `DatabaseRow` shape after phase 1 transform).
- **`lib/db.ts`** — same exported signatures (zero changes in pages), internal queries become SQL:
  - `getMarkets(filters)`: parameterized WHERE (status/state/district/amenities/parking, `LIMIT ? OFFSET ?`); day filter joins `market_days`; keep `open_now` client-side note.
  - `getMarketById`, `getAllStates` (`SELECT DISTINCT state … ORDER BY state`), `getDistrictsByState`, `getAdminMarkets` (exact count = `SELECT COUNT(*)`, replacing PostgREST `count: 'exact'`).
- **`lib/suggestions-db.ts`** → D1 (getSuggestions/getSuggestionById/countPendingSuggestions).
- **Server actions**:
  - `app/suggest/actions.ts` insert → D1 (`id: crypto.randomUUID()`, `updated_at` n/a); delete in-process limiter (DO takes over in Phase 4); keep honeypot + zod validation as-is.
  - `app/admin/actions.ts`, `app/admin/suggestions/actions.ts` → D1 insert/update/delete; **maintain `market_days` + `schedule_days` inside `marketFormToDbRow`-based write helper** (`lib/market-writes.ts`) so every write path (CRUD + approve) updates them consistently; keep `revalidatePath`.
- **Browser clients**: `homepage-client.tsx`, `markets-filter-client.tsx`, `app/map/page.tsx` → `fetch("/api/v1/markets?status=Active")`. These 3 components run during SSR too — they must hit `NEXT_PUBLIC_SITE_URL` when in a server context (Worker cannot fetch its own route). **Race note:** API ships in Phase 4; for interim dev use stub route handlers returning `marketsData` (deleted in Phase 4), or land the API handlers first.
- Delete `lib/supabase.ts`, `lib/supabase-client.ts` after no remaining imports (grep gate: `rg -c "supabase" app components lib` = 0 outside `supabase/` archive).

**Local dev:** full-stack = `opennextjs-cloudflare preview` (Miniflare: real local D1 seeded from `d1/data.sql`). Pure-UI = `next dev` falls back to static `marketsData` (already exists) when the D1 binding is absent.

**Validate:** `pnpm build`, `pnpm lint`, preview smoke: list/filter/detail/suggest/admin CRUD/approve.

### Phase 3 — Auth swap (≈0.5 day)

- `lib/auth.ts` rewrite: `login(password)` server action → constant-time compare vs `ADMIN_PASSWORD` secret → issue JWT (`jose`, HS256, `SignJWT({ role: "admin" }).setExpirationTime("7d")`, secret `JWT_SECRET`) → set cookie `admin_session` (HttpOnly, Secure, SameSite=Lax, 7d). `requireAdmin()` = verify + redirect to `/admin/login` (no more redirect-on-undefined-email ambiguity).
- `proxy.ts` (Next 16 middleware): drop Supabase; keep `x-pathname` header; verify JWT with `jose` for `/admin/*` redirect logic. (`jose` runs fine on Workers runtime.)
- `app/admin/login/login-client.tsx`: call `login()` action instead of `signInWithPassword`; drop `supabase-client` import.
- `app/admin/actions.ts` `signOut()` → delete cookie, redirect (as today).
- Secrets: `wrangler secret put ADMIN_PASSWORD`, `wrangler secret put JWT_SECRET` (dev: `.env.local` for `next dev`, `.dev.vars` for preview). Remove `ADMIN_EMAIL`.
- Server-side login attempt limiter: reuse DO `login:{ip}` 5 / 15 min (Phase 4) — replaces the client-only lockout, which stays as UX sugar.

**Validate:** login → cookie issued → admin pages reachable; logout clears; forged cookie rejected; `pnpm build`.

### Phase 4 — Public API v1 + rate limiting + caching (≈2 days)

**`workers/rate-limiter/`** (separate Worker, DO):
```ts
export class RateLimiter { /* DO w/ SQLite storage: requests(key, ts) */
  async fetch(req) { /* POST {key, max, windowMs} → {success, remaining, reset} sliding window; alarm prunes */ }
}
```
- Sliding-window counters in DO SQLite; `alarm()` cleanup. Note: Workers ratelimit binding is GA but hard-limited to 10s/60s periods — insufficient for the existing 5/hour suggestion rule, hence DO.
- Binding from main worker: `"services": [{ "binding": "RATE_LIMITER", "service": "rate-limiter" }]` in `wrangler.jsonc` (+ same binding inside rate-limiter's own config for its DO).
- Access from Next: `getCloudflareContext().env.RATE_LIMITER`. Fail-open on limiter errors for GETs (log via `console.error` → Workers Logs), fail-closed for suggestion submit + login.

**Routes** (`app/api/v1/...` route handlers, Node runtime, `export const runtime = "nodejs"`):
| Endpoint | Notes |
| --- | --- |
| `GET /api/v1/markets` | Filters: `state,district,day,status,amen_toilet,amen_prayer_room,parking_available,parking_accessible,limit(≤200,def 100),offset`. Envelope `{ data: Market[], meta: { count, limit, offset } }`. `Cache-Control: public, s-maxage=60, stale-while-revalidate=300` + Cache API wrapper. |
| `GET /api/v1/markets/{id}` | 404 JSON if missing. Same cache headers. |
| `GET /api/v1/states` | Distinct active states. Long cache (`s-maxage=3600`). |
| `GET /api/v1/districts?state=` | Long cache. |
| `GET /api/v1/openapi.json` | Served from a static `public/openapi.json`; `/api` HTML docs page linking it. |
| `POST` anywhere | **405** — v1 is read-only; suggestions stay on the server action. |

Cross-cutting middleware (`withApi()` helper):
- CORS: handle `OPTIONS` preflight + `Access-Control-Allow-Origin: *` on all `/api/v1/*` (open-data requirement).
- Rate limits via DO keyed `route:ip` (`cf-connecting-ip`): API GETs **60/min**; submit action **5/hour** (preserves current rule, now cross-isolate); login **5/15min**. Response headers `X-RateLimit-Limit/Remaining/Reset`, `429` + `Retry-After` on breach. (Docs best practice: keys are per-IP+route; IP-only keys can over-block shared NATs — accepted tradeoff for a keyless API, documented in the API page.)
- Admin CRUD remains binding-direct (not public, not rate-limited).

**Validate:** curl each endpoint (incl. preflight, 429 path by hammering, cache-status header), `pnpm build`, lint.

### Phase 5 — OpenNext wiring + deploy (≈1 day)

1. `pnpm add @opennextjs/cloudflare && pnpm add -D wrangler`
2. `wrangler.jsonc`:
```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "caripasarmalam",
  "main": ".open-next/worker.js",
  "compatibility_date": "2026-09-01",
  "compatibility_flags": ["nodejs_compat"],
  "assets": { "directory": ".open-next/assets", "binding": "ASSETS" },
  "observability": { "enabled": true },
  "d1_databases": [{ "binding": "DB", "database_name": "caripasarmalam", "database_id": "<from create>" }],
  "services": [{ "binding": "RATE_LIMITER", "service": "rate-limiter" }],
  "vars": { "NEXT_PUBLIC_SITE_URL": "https://pasarmalam.app" }
}
```
3. `open-next.config.ts`: `defineCloudflareConfig()` (no ISR/KV cache needed — pages are dynamic due to the language cookie; static assets + CDN cover the rest).
4. `package.json` scripts: `preview`, `deploy`, `cf-typegen` (per OpenNext docs). Keep `dev`/`build`/`lint` unchanged.
5. Headers: `next.config.mjs headers()` (CSP, HSTS, X-Frame-Options…) — verify OpenNext emits them; if gaps, move to `public/_headers` (Workers assets support `_headers`). CSP must gain `connect-src` allowance for the CF beacon.
6. Secrets: `wrangler secret put JWT_SECRET / ADMIN_PASSWORD`.
7. Deploy to workers.dev, run full smoke (site + API + admin + suggest) against preview URL before DNS.

**Validate:** workers.dev URL end-to-end; `wrangler tail` clean; Worker gzip size < 3 MiB (else note paid-plan fallback).

### Phase 6 — Analytics + cutover + cleanup (≈0.5 day)

1. `app/layout.tsx`: add CF Web Analytics beacon (`https://static.cloudflareinsights.com/beacon.min.js`, token from `NEXT_PUBLIC_CF_ANALYTICS_TOKEN`); keep existing self-hosted Umami (owner choice). Remove `@vercel/analytics` dep (unused).
2. Cutover: Workers Custom Domain on the existing domain → lower Vercel DNS TTL → switch → keep Vercel project parked for 2 weeks as rollback (DNS revert). **During the window the Supabase project is paused, not deleted** — old Vercel deploys still work if DNS reverts.
3. Post-cutover: verify D1 metrics (dash: rows read), Workers Logs for 429s/errors, CF Web Analytics receiving.
4. Cleanup after the rollback window: archive `supabase/` → `docs/archive/supabase/` (keep `migrations` + `config.toml` for provenance), delete `supabase/` seeds from build path, prune `env.local.example`, update `README`/`AGENTS.md`, final `pnpm lint` + `pnpm build`.
5. **Rollback drill before cutover:** rehearse DNS revert + verify parked Vercel deploy still serves live data from paused Supabase (unpause if rehearsing for real). A rollback path never exercised is not a rollback path.

---

## 4. Public API contract (v1) — summary for the docs page

- **Auth:** none. **CORS:** `*` (GET/OPTIONS). **Format:** JSON, UTF-8; errors `{ error: { code, message } }`.
- **Versioning:** `/api/v1/` prefix; the `Market` shape is the existing `lib/markets-data.ts` type (schedule array, parking/amenities objects, location w/ gmaps_link) — API returns the transformed app type, not raw D1 rows. Breaking shape changes require `/api/v2/` + keeping v1 alive; additive optional fields are non-breaking. Add `X-API-Version: 1` response header.
- **Rate limits (per IP, per route):** API GETs 60/min; response headers `X-RateLimit-*`; `429` with `Retry-After`. Suggestion submission (site form): 5/hour. **Caching:** CDN-cached ≤60s — expect slight staleness after admin edits; `stale-while-revalidate=300`.
- **`Market` shape** = existing `lib/markets-data.ts` type (schedule array, parking/amenities objects, location w/ gmaps_link) — the API returns the transformed app type, not raw D1 rows, so consumers get stable JSON.
- **OpenAPI:** `public/openapi.json` hand-maintained in this migration; `/api` page renders summary + links (keeps the repo dependency-free).
- **Attribution (open-source dataset):** docs page + `X-Attribution` header linking to the repo; suggest consumers credit the source per the project license.

## 5. Risks & mitigations

| Risk | Mitigation |
| --- | --- |
| D1 free-tier row-read hard fail (5M/day) | Cache API on all public GETs + `market_days` index (no JSON full scans); monitor dashboards; upgrade path = Workers Paid ($5/mo). |
| OpenNext on Windows | All builds/deploys via GitHub Actions ubuntu; local `next dev` only for UI. |
| Next 16 + Turbopack + OpenNext incompatibility / Worker size > 3 MiB free cap | Phase 0 spike deploys the unmodified app first — fail fast, before any code changes. Fallback if blocked: trim server-only deps, or Workers Paid ($5/mo, 10 MiB). |
| Losing RLS | All reads/writes server-only through `lib/db.ts`/actions; admin writes behind `requireAdmin()`; documented in README security notes. |
| Data loss after Supabase teardown | `pg_dump`/CSV backup archived before teardown (D1 free tier has no PITR); Supabase project paused, not deleted, for the 2-week rollback window. |
| JSONB→TEXT drift | `json_valid` CHECKs + parity script gates the cutover. |
| Middleware (proxy.ts) regression | Phase 3 keeps identical matcher + adds only JWT verify; smoke admin/login/redirects. |
| Suggestion spam (rate limiter outage) | Fail-closed 429 on submit path; honeypot + zod validation remain. |
| PWA currently disabled | Out of scope; unchanged (`isPWAEnabled = false`). Revisit post-migration with a Turbopack-compatible solution. |

## 6. Env vars after migration

```
# wrangler.jsonc vars / secrets
NEXT_PUBLIC_SITE_URL          # vars
NEXT_PUBLIC_SUGGEST_MARKET_URL
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID
NEXT_PUBLIC_CF_ANALYTICS_TOKEN
JWT_SECRET                    # wrangler secret put
ADMIN_PASSWORD                # wrangler secret put

# removed
NEXT_PUBLIC_SUPABASE_URL / ANON_KEY / SUPABASE_SERVICE_ROLE_KEY / ADMIN_EMAIL
```

## 7. Validation gates (per phase, no test framework exists)

Every phase: `pnpm lint && pnpm build`. Phases 1–4 additionally: Miniflare preview smoke (list/filter/detail/map data, suggest→pending→approve, login/CRUD/logout, curl API incl. 429 + CORS preflight). Phase 5: full workers.dev E2E + `wrangler tail`. Cutover: DNS + 48h error-watch via Workers Logs before Vercel teardown.