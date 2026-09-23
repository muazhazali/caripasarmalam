# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start development server (http://localhost:3000)
pnpm build        # Build for production (also type-checks)
pnpm lint         # Run ESLint
pnpm lint:fix     # Run ESLint with auto-fix
pnpm format       # Format all files with Prettier
pnpm format:check # Check formatting without writing

# Supabase local dev (requires Docker Desktop running)
npx supabase start   # Start local Supabase (outputs API keys to copy into .env.local)
npx supabase stop    # Stop local Supabase
npx supabase db reset  # Drop and re-apply all migrations + seed data
npx supabase gen types typescript --local > types/database.types.ts  # Regenerate types after schema changes
```

There are no automated tests. Validate changes by running `pnpm build` for TypeScript errors and `pnpm lint` for lint issues.

## Architecture

**Next.js 15 App Router** with React Server Components. The app uses a server/client split where pages fetch data server-side and pass it to `*-client.tsx` components that handle interactivity.

### Data Flow

- **Database**: Supabase (PostgreSQL). Single table: `pasar_malams`.
- **Server queries**: `lib/db.ts` — `getMarkets()`, `getMarketById()`, `getAllStates()`, `getDistrictsByState()`. Uses `lib/supabase.ts` (server-side client via `@supabase/ssr`).
- **Browser client**: `lib/supabase-client.ts` — for client components.
- **DB → App type**: `lib/db-transform.ts` transforms raw Supabase rows into the `Market` type defined in `lib/markets-data.ts`.
- **Core type**: `Market` in `lib/markets-data.ts`. `MarketSchedule[]` uses `DayCode` enum from `app/enums.ts`.

### Internationalization

Language (English/Malay) is stored in a cookie (`language: "en" | "ms"`). `LanguageProvider` (`components/language-provider.tsx`) provides context via `useLanguage()`. All translations are in `lib/i18n.ts` as a flat key-value object per language. All user-facing strings must be added there and accessed via `useTranslations()` hook.

### Map

Interactive map uses Leaflet (`components/interactive-map.tsx`, `components/markets-map.tsx`). Leaflet is client-side only — components using it must be dynamically imported with `ssr: false`.

### Navigation

- Desktop: `components/desktop-navbar.tsx`
- Mobile: `components/mobile-tabbar.tsx` (fixed bottom bar, requires `pb-16` on `<main>`)

### Key Routes

- `/` — Homepage with featured markets
- `/markets` — Filterable list view (`markets-filter-client.tsx`)
- `/markets/[id]` — Market detail page
- `/markets/map` — Map view of all markets
- `/about`, `/contributors` — Static info pages

### `lib/markets-data.ts`

Contains the `Market` TypeScript type and a static `marketsData` array (legacy/fallback data). **Primary data source is Supabase** via `lib/db.ts`.

## Environment Variables

Copy `env.local.example` to `.env.local`. After `npx supabase start`, paste the printed `anon key` and `service_role key`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase start output>
SUPABASE_SERVICE_ROLE_KEY=<from supabase start output>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUGGEST_MARKET_URL=https://forms.gle/9sXDZYQknTszNSJfA
```
