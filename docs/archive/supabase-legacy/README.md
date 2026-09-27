# Legacy migration archive (Supabase → Cloudflare D1)

These files are **historical**. They document and reproduce the one-time migration
from the Supabase project to Cloudflare D1 and are not part of the running app.

Nothing here is deployed, imported by application code, or covered by CI.

## Contents

| Path                                   | What it is                                                        |
| -------------------------------------- | ----------------------------------------------------------------- |
| `migrations/`                          | Original Postgres migrations (schema, suggestions, RLS hardening) |
| `config.toml`                          | Supabase CLI local-development configuration                      |
| `seed.sql`, `seed-2.sql`, `seed-2.csv` | Postgres seed data generated during dataset import                |
| `sql_to_csv.py`                        | Helper that converted Supabase SQL exports to CSV                 |
| `scripts/backup-supabase.mjs`          | One-time full-table JSON backup of the live Supabase project      |
| `scripts/export-supabase-d1.mjs`       | Converts that backup JSON into `d1/data.sql` (SQLite INSERTs)     |
| `scripts/verify-d1-parity.mjs`         | Compares local D1 row counts/fields against the backup JSON       |

The live SQLite schema is `d1/migrations/`, and the current local dataset is `d1/data.sql`.

## Why the old scripts will not run as-is

The three archived scripts depend on packages that were removed from the root
`package.json` because the running application no longer needs them:

- `backup-supabase.mjs` needs `@supabase/supabase-js` and `dotenv`
- `export-supabase-d1.mjs` and `verify-d1-parity.mjs` also read the backup that
  `backup-supabase.mjs` produced

They also expect a Supabase project that no longer exists, so they cannot be
re-run against production. They are kept for provenance and for reference if a
similar export is ever needed.

To run one anyway, install the extra packages first (do not commit them):

```bash
pnpm add -D @supabase/supabase-js dotenv
node docs/archive/supabase-legacy/scripts/verify-d1-parity.mjs
```

Run them **from the repository root** — they resolve `docs/archive/supabase/`
and `d1/data.sql` relative to the current working directory, not to the script
location.

## Data privacy

`backup-supabase.mjs` exports the `market_suggestions` table, which contains
submitter email addresses. Its output directory `/docs/archive/supabase/` is
gitignored. Do not commit those JSON files.

The committed `d1/data.sql` contains public market data only (no suggestions,
no emails).
