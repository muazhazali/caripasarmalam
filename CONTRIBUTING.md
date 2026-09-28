# Contributing to CariPasarMalam

Thanks for helping improve the pasar malam directory. This guide covers the
common paths: fixing data, reporting bugs, and changing code.

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## Ways to contribute

| I want to…                        | Start here                                                                                    |
| --------------------------------- | --------------------------------------------------------------------------------------------- |
| Add or correct a market           | Use the [suggestion form](https://forms.gle/9sXDZYQknTszNSJfA), or the in-app `/suggest` page |
| Add a seller to a market          | Use the in-app `/suggest?type=seller` page (reviewed before publishing)                       |
| Report a bug or request a feature | Open a GitHub issue (templates provided)                                                      |
| Report a security issue           | Read [SECURITY.md](SECURITY.md) first — do not open a public issue                            |
| Fix or add code                   | This document, then open a pull request                                                       |
| Improve the underlying dataset    | [`dataset/README.md`](dataset/README.md) and [`d1/README.md`](d1/README.md)                   |

## Development setup

**Prerequisites:** Node.js 20+, pnpm 12+ (`corepack enable`).

```bash
git clone https://github.com/muazhazali/caripasarmalam.git
cd caripasarmalam
pnpm install
cp .env.example .env     # set NEXT_PUBLIC_SITE_URL and admin secrets
pnpm dev                 # http://localhost:3000
```

`pnpm dev` starts with an empty local D1 database. Seed it for realistic data:

```bash
pnpm db:migrate:local
pnpm db:seed:local
```

For anything touching D1 bindings, the API, admin login, or rate limiting, use
`pnpm preview` — it runs the app on the real Workers runtime (Miniflare) at
http://localhost:8787. See [docs/cloudflare-preview.md](docs/cloudflare-preview.md).

## Before you open a pull request

Run the same checks CI runs:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
```

`pnpm format` fixes formatting for you. A pre-commit hook formats staged files
automatically.

If your change affects the UI, data flow, or auth, also walk the relevant smoke
checks in [docs/cloudflare-preview.md](docs/cloudflare-preview.md) and say in the
PR what you verified.

## What to expect

- **No test suite yet.** Type checking, lint, the build, and manual preview checks
  are the current safety net. Adding tests is welcome — see
  [docs/roadmap.md](docs/roadmap.md).
- **Small, focused PRs review fastest.** One concern per PR; split unrelated fixes.
- **Explain the "why".** A sentence on the problem and your approach helps more
  than a long description of the diff.
- **Data changes need evidence.** When correcting a market, link the source you
  used (a Maps listing, council page, or news article).

## Conventions

- **Formatting**: Prettier, 120-column width. Let the hook or `pnpm format` handle it.
- **TypeScript**: strict mode. Prefer `type` imports; avoid `any` where reasonable.
- **Components**: server components by default; add `"use client"` only for
  interactivity. New UI primitives should come from shadcn/ui rather than being
  hand-rolled.
- **Strings**: every user-facing string goes in `lib/i18n.ts`, in **both** English
  and Malay. Never hardcode display text in a component.
- **Database**: reads and writes are server-side only. Client components reach
  data through `/api/v1` (see `lib/markets-api-client.ts` and
  `lib/sellers-api-client.ts`), never through the D1 binding.
- **Writes**: all mutations are server actions guarded by `requireAdmin()`. Keep
  `market_days` consistent with `schedule` on every market write. On every
  seller write, keep `seller_items`, `seller_locations`, `seller_location_days`,
  and `seller_fts` in sync — use the helpers in `lib/sellers-db.ts`.
- **Privacy**: seller `phone` and `social` come from the public only through
  suggestions and are published after admin review. Don't add flows that publish
  contact data without that gate.
- **Schema**: add a new file in `d1/migrations/`; never edit an applied migration.
- **Comments**: add one only when it explains non-obvious intent.
- **Secrets**: never commit `.env`, `.dev.vars`, or files under
  `docs/archive/supabase/` (they contain submitter emails).

## Commit messages

Use a short imperative subject line, optionally prefixed by a type, for example:

```
fix: correct operating hours for Pasar Malam Taman Melawati
feat(api): add district filter to /api/v1/markets
docs: document local D1 setup
```

## Changing the API

`/api/v1` is a public contract. Additive optional fields and new query parameters
are fine. Any breaking change to the response shape or existing parameters needs a
new version under `/api/v2` while v1 keeps working. Document the change in the
README API table.

## Seller directory status

The seller feature is mid-build: admin CRUD, the API, market-page seller
sections, and the suggestion flow are live; the public `/sellers` list shows a
work-in-progress banner while real seller data is collected. The design and
phased plan live in
[docs/seller-directory-plan.md](docs/seller-directory-plan.md) — read it before
touching seller code so the schema conventions stay consistent.

## Questions

If something in this guide is unclear or out of date, that is a documentation bug —
please open an issue saying which part confused you.
