# D1 database

The app's database is a Cloudflare D1 (SQLite) database named `caripasarmalam`.
This directory holds its schema and the seed dataset.

| Path          | Purpose                                                    |
| ------------- | ---------------------------------------------------------- |
| `migrations/` | Schema migrations, applied in filename order               |
| `data.sql`    | Public market dataset (~1,139 markets) as SQLite `INSERT`s |

Wrangler stores local D1 state in `.wrangler/state` (gitignored), so each
developer gets a private copy.

## First-time local setup

```bash
pnpm db:migrate:local   # create tables
pnpm db:seed:local      # load d1/data.sql
```

`pnpm dev` works without this, but the app will show no markets.

## Schema overview

```
pasar_malams          id (TEXT PK), name, address, district, state, status,
                      description, area_m2, total_shop, parking_* / amen_*,
                      location (JSON), schedule (JSON), timestamps, shop_list
market_days           market_id, day   (PK: market_id + day), index on day
market_suggestions    id (TEXT PK), type, target_id, data (JSON),
                      submitter_email, status, rejection_reason, timestamps
```

- `location` is `{"latitude": number, "longitude": number, "gmaps_link": string}`.
- `schedule` is `[{"days": ["sat"], "times": [{"start": "17:00", "end": "22:00"}]}]`.
- JSON columns are `TEXT` with a `json_valid(...)` check — query them with
  SQLite's JSON functions, not Postgres operators.
- `market_days` mirrors `schedule` so day filters use an index instead of a
  full scan. Writes must keep both in sync; `lib/db.ts` handles this in one
  helper.

## Changing the schema

```bash
pnpm exec wrangler d1 migrations create caripasarmalam add_my_column
# edit the new file in d1/migrations/
pnpm db:migrate:local
```

Apply to production with `pnpm db:migrate:remote`. Migrations are append-only:
never edit an applied migration, add a new one.

## Inspecting data

```bash
pnpm exec wrangler d1 execute caripasarmalam --local --command "SELECT COUNT(*) FROM pasar_malams;"
pnpm exec wrangler d1 execute caripasarmalam --local --command "SELECT * FROM pasar_malams WHERE state = 'Selangor' LIMIT 5;"
```

Drop `--local` to inspect production (read queries only).

## Where `data.sql` came from

It was generated once from a Supabase export by the archived migration scripts
in `docs/archive/supabase-legacy/scripts/`. That pipeline is retired; treat
`data.sql` as the current source of truth for seed data.

## Free-tier budgeting

D1 bills per row read. Unbounded full-table scans are the main cost risk, which
is why:

- public API responses are edge-cached (see `lib/api.ts`),
- day filtering uses `market_days` rather than scanning `schedule` JSON,
- query functions always apply a `LIMIT`.

Keep these properties when changing query code.
