# Roadmap

Planned improvements, roughly ordered by impact. Nothing here is committed work —
if you want to pick something up, open an issue or comment on an existing one so
it can be coordinated.

## High impact

- **Email notifications for suggestions** — send a confirmation on submit and an
  approve/reject email with the reason; notify the admin when a new suggestion
  arrives instead of relying on the sidebar badge. A transactional provider with
  a free tier (for example Resend) fits the current cost profile.
- **Automated tests** — there is no test suite today; changes are validated by
  typecheck, lint, build, and manual preview smoke checks. Playwright for the
  public flows and Vitest for `lib/*` would be the highest-value additions.

## Medium impact

- **Real Open Graph images** — market pages fall back to `/placeholder.jpg`. Use
  Next.js `opengraph-image.tsx` so shared market links render a real preview.
- **Market photos** — no market has an image. Consider a community-submitted
  photo field or a Street View thumbnail on the detail page.
- **URL-synced filters everywhere** — the homepage reflects state/day in the URL;
  extend this so amenity and search filters are shareable too.
- **Improve loading states** — skeletons exist for the main list; extend them to
  the map view and detail pages.

## Lower impact

- **Suggestion status lookup** — a public page where a submitter can check the
  status of their suggestion by email.
- **Admin bulk actions** — select-all plus bulk approve/reject when suggestions
  pile up.
- **Contributor credit** — credit approved submitters on the market detail page
  or a contributors list.

## Done

- ~~Rate limiting beyond a single process~~ — replaced by the `RateLimiter`
  Durable Object in `workers/rate-limiter/`.
- ~~Global error boundary~~ — `app/error.tsx` exists.
- ~~Data-layer migration off Supabase~~ — see
  [cloudflare-migration.md](cloudflare-migration.md).
