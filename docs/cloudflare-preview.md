# Cloudflare local preview

Run from the repository root:

```powershell
pnpm.cmd install --frozen-lockfile
pnpm.cmd preview
```

On shells without the PowerShell script-policy restriction, `pnpm preview` also works.
Preview builds the app with OpenNext, then runs both the app and rate-limiter in
Wrangler/Miniflare at http://localhost:8787. All database access stays local.
No separate rate-limiter terminal is needed. Stop both Workers with Ctrl+C.

The current OpenNext config uses no persistent incremental/tag cache, so preview
can start Wrangler directly without OpenNext's cache-population step. Revisit
this command if an R2 or other persistent cache override is added later.

## Local data and secrets

For a **new, empty** local database only:

```powershell
pnpm.cmd exec wrangler d1 migrations apply caripasarmalam --local
pnpm.cmd exec wrangler d1 execute caripasarmalam --local --file d1/data.sql
```

Do not repeat the data import on a populated database. The export contains 1,139
markets. Local D1 storage is selected by the database ID in `wrangler.jsonc`;
changing that ID selects a different local database even when its name is unchanged.

Check the active database:

```powershell
pnpm.cmd exec wrangler d1 execute caripasarmalam --local --command "SELECT COUNT(*) AS markets FROM pasar_malams;"
```

Set `ADMIN_PASSWORD` and `JWT_SECRET` in the ignored `.env` or `.dev.vars` file.
Do not print or commit their values. Live Workers require their own configured secrets.

## Smoke checks

- `/`: markets appear in the homepage response.
- `/api/v1/markets?limit=5`: HTTP 200 and a five-item `data` array.
- `/api/v1/states`: HTTP 200 and a `data` array of states.
- `/admin/login`: password login grants access to `/admin/markets`.
- `/suggest`: a submission appears in `/admin/suggestions` after admin login.
- Anonymous access to `/admin/markets` redirects to `/admin/login`.

Inspect headers as well as the response body:

```powershell
curl.exe -i "http://localhost:8787/api/v1/markets?limit=2"
```

Expect `X-API-Version: 1`, `Access-Control-Allow-Origin: *`, and rate-limit headers.

## Windows build patch

`patches/@opennextjs__aws@4.1.4.patch` relocates absolute pnpm dependency links
into OpenNext's output and preserves directory-link types. Without this, Windows
builds can resolve the original Next.js package instead of the patched copy,
causing native Sharp bundling errors and runtime dynamic-manifest errors.
The patch is installed automatically by pnpm through `pnpm-workspace.yaml`.
Revalidate it when updating OpenNext; it is pinned to the affected package version.

## Deployment

Local success does not verify production D1 data, secrets, or service bindings.
Deploy the rate-limiter Worker before the main app:

```powershell
pnpm.cmd exec wrangler deploy --config workers/rate-limiter/wrangler.jsonc
pnpm.cmd deploy
```

Repeat the smoke checks against the printed workers.dev URL before DNS cutover.
