# Seller Directory Upgrade — Plan

Status: design agreed, awaiting go-ahead to start implementation.
Scope: each pasar malam location gets a list of sellers; sellers can appear at multiple
markets on different days; users can browse/search sellers and search for food, not just
locations.

## Agreed decisions

| Decision        | Choice                                                                  |
| --------------- | ----------------------------------------------------------------------- |
| Data model      | Standalone `sellers` table + link table to markets                      |
| Items           | Free-text item names, site-wide FTS search over items                   |
| Price           | Single optional number per item, displayed "RM 5"; empty = "Ask seller" |
| Contact privacy | Public can submit phone/social; published only after admin review       |
| Sourcing        | Admin CRUD + public suggestion flow (reviewed before publishing)        |
| Categories      | Free text (no fixed taxonomy)                                           |
| WhatsApp        | Derived from stored phone (`wa.me/60…`); no separate field              |
| Photos          | Skipped in v1 (no image hosting yet; add later, e.g. R2)                |
| v1 scope        | All of the below, built step by step in phases                          |

## Phase 1 — Schema (migration `0003_sellers.sql`)

Never edit `0001`/`0002`; add one new migration. Follows existing conventions:
jsonb → TEXT + `json_valid()` CHECK, booleans → INTEGER, timestamps → TEXT ISO-8601,
UUIDs via `crypto.randomUUID()`, `updated_at` set in app code.

- `sellers` — `id`, `name`, `category` (free text), `description`, `phone`,
  `social` (JSON `[{platform, url}]`), `status` (`Active`/`Inactive`), `created_at`,
  `updated_at`
- `seller_items` — `id`, `seller_id` FK CASCADE, `name`, `price REAL` (nullable),
  `note`, `sort_order`; index on `seller_id`
- `seller_locations` — `id`, `seller_id` FK CASCADE, `market_id` FK → `pasar_malams`
  CASCADE, `stall`, `notes`; `UNIQUE (seller_id, market_id)`; indexes on both FKs
- `seller_location_days` — join table `(seller_location_id, day)` using `DayCode`
  from `app/enums.ts`, mirroring the `market_days` pattern; index on `day` so
  "who is here today" queries stay cheap
- `seller_suggestions` — mirrors `market_suggestions`: `type` (`new`/`update`),
  `target_id`, `data` (JSON payload), `submitter_email`, `status`
  (`pending`/`approved`/`rejected`), `rejection_reason`, `reviewed_by`, timestamps
- FTS5 virtual table over item name + seller name + category, synced in app code on
  every seller write (matches the project's "set in application code" convention);
  D1 supports FTS5

## Phase 2 — Types + data layer

- `lib/seller-types.ts` — `Seller`, `SellerItem`, `SellerLocation`, `SellerSuggestion`
  (types only, like `lib/market-types.ts`)
- `lib/sellers-db.ts` — queries and writes, following `lib/suggestions-db.ts` style:
  - `getSellers(filters)` (state, district, category, q, marketId, day)
  - `getSellerById(id)` (items + locations + days)
  - `getSellersByMarket(marketId)` grouped by day for the market detail page
  - `searchSellers(q)` via FTS (item names, seller names, categories)
  - create/update/delete with `db.batch()` — D1 has no client-side transactions;
    every seller write keeps `seller_items`, `seller_locations`,
    `seller_location_days`, and the FTS table in sync (the seller equivalent of the
    "keep `market_days` in sync with `schedule`" rule)
  - seller suggestion CRUD + approve/reject

## Phase 3 — Public API

- `GET /api/v1/sellers?q=&category=&state=&district=&marketId=&day=` — only
  `Active` sellers; CORS, cache headers, rate limiting via existing `lib/api.ts`
  helpers (`RATE_LIMITER` service binding)
- `GET /api/v1/sellers/[id]`
- Response shape consistent with `/api/v1/markets`

## Phase 4 — Public pages

- `/sellers` — server page + `sellers-client.tsx`: search box matching items, seller
  names, and categories; filters for state/district/category; cards show name,
  category, top items with prices, and the markets they attend
- `/sellers/[id]` — detail page: name, public id, category, description, item +
  price list, phone (tap-to-call), WhatsApp link derived from phone, social links,
  and markets grouped by day
- Market detail page — new "Sellers" section listing sellers, grouped by day
- Homepage — food search box ("cari nasi lemak…") deep-linking to
  `/sellers?q=…`
- Navigation — Sellers entry in `desktop-navbar.tsx` and `mobile-tabbar.tsx`
- All user-facing strings added to `lib/i18n.ts` in both `en` and `ms`; pages with
  the fixed bottom tabbar get `pb-16`

## Phase 5 — Admin

- `/admin/sellers` (list), `/admin/sellers/new`, `/admin/sellers/[id]/edit`
  mirroring the markets admin, behind `requireAdmin()` (`lib/auth.ts`) via server
  actions only
- Forms: seller basics + repeatable items editor (name, price, note) + locations
  editor (market picker, day checkboxes, stall number)
- `/admin/suggestions` — Markets | Sellers tabs; approving a seller suggestion
  creates/updates the seller; rejecting requires a reason

## Phase 6 — Public suggestions

- `/suggest` — Market | Seller mode toggle; seller form: name, category, items with
  prices, target market(s) + days, submitter contact; phone/social accepted but only
  published after admin review (stored in the suggestion payload until approved)

## Phase 7 — Polish + validation

- Metadata/robots for new pages, empty states, loading states
- Seed data (`d1/data.sql`) optionally gains a few sample sellers for local dev
- Out of v1 (later ideas): seller photos (R2 uploads), seller self-service claiming,
  per-seller map pins, price-range filters ("under RM10"), structured food catalog
  with canonical dish pages

Validation per phase: `pnpm typecheck`, `pnpm lint`, `pnpm build`; final pass also
`pnpm format:check` and the preview smoke checks in `docs/cloudflare-preview.md`.

## Build order

1. Migration + types + db layer
2. API routes
3. `/sellers` list + search
4. `/sellers/[id]` detail
5. Market-page seller section + homepage food search + nav links
6. Admin seller CRUD + suggestions tabs
7. Public seller suggestions
8. FTS polish, i18n sweep, final validation

## Risks / notes

- D1 batch for multi-table writes; no true transactions
- FTS table kept in sync only via the shared seller write helpers — never write
  `seller_items` elsewhere
- Client components must not import `lib/d1.ts`/`lib/db.ts`; use
  `lib/sellers-api-client.ts` against `/api/v1/sellers` (same rule as markets)
- Personal data: phone/social only enter `sellers` after admin approval
