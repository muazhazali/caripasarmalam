<!-- 5513671d-2736-461a-b82b-ee43a5911d3a 6efc3e57-d367-4f2c-ae26-a8c5f987cbb8 -->
# Supabase Migration and Server-Side Filtering Implementation Plan

## Phase 1: Dependencies and Setup

### 1.1 Install Supabase Client

- Add `@supabase/supabase-js` to package.json
- Create `.env.local` template with Supabase environment variables
- Document required env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### 1.2 Create Supabase Client Utility

- Create `lib/supabase.ts` for client and server-side Supabase clients
- Follow pattern from existing `lib/appwrite.ts` (singleton pattern for Next.js)
- Export both browser and server clients

## Phase 2: Database Schema Setup

### 2.1 Run Optimized Schema

- Use `scripts/create-markets-table-jsonb-optimized.sql` (free tier optimized)
- Create migration checklist document
- Verify table creation and indexes in Supabase dashboard

### 2.2 Coordinate-to-State Mapping

- Create `lib/geolocation.ts` with `getStateFromCoordinates()` function
- Implement bounding box detection for Malaysian states
- Use simple bounding boxes initially (can enhance later with proper geolocation library)

## Phase 3: Database Helper Functions

### 3.1 Create Database Access Layer

- Create `lib/db.ts` with:
- `getMarkets(filters)` - main query function with filtering
- `getMarketById(id)` - single market lookup
- `isMarketOpenNow(market)` - client-side open status check
- `MarketFilters` interface for type safety
- Import and use `dbRowToMarket` from `scripts/migrate-typescript-to-db.ts`
- Implement server-side filtering for: state, district, day, status, amenities, parking
- Implement client-side filtering for: "open now" (complex timezone logic)

### 3.2 Update Migration Utilities

- Ensure `scripts/migrate-typescript-to-db.ts` exports are correct
- Create `scripts/run-migration.ts` for one-time data migration
- Add validation and error handling

## Phase 4: Update Homepage (Priority 1)

### 4.1 Update Server Component

- Modify `app/page.tsx`:
- Change from `getAllMarkets()` to async `getMarkets()` with filters
- Accept `searchParams` for state/day filters from URL
- Pass initial markets and state to client component

### 4.2 Update Client Component

- Modify `components/homepage-client.tsx`:
- Keep existing UI/filtering logic
- Add geolocation on mount to detect state
- Call `getMarkets()` when location detected or filters change
- Add "Browse More" button handler (load more markets from current state)
- Add "Browse All States" button handler
- Maintain existing client-side filtering for amenities/open-now

## Phase 5: Update Markets Page

### 5.1 Update Server Component

- Modify `app/markets/page.tsx`:
- Change to async function accepting `searchParams`
- Fetch markets with filters from URL params
- Pass filtered markets to client component

### 5.2 Update Client Component

- Modify `components/markets-filter-client.tsx`:
- Keep existing filtering UI
- Add server-side fetch when state/day filters change (via URL params)
- Maintain client-side filtering for search query and amenities

## Phase 6: Update Map Page

### 6.1 Update Map Page Component

- Modify `app/map/page.tsx`:
- Change to client component with `useState` for markets
- Fetch markets on mount based on user location (if available)
- Add state filter dropdown that triggers server-side fetch
- Filter markets with coordinates only (client-side)
- Fallback to all markets if location denied

## Phase 7: Data Migration

### 7.1 Run Migration Script

- Execute `scripts/run-migration.ts` with service role key
- Validate data integrity after migration
- Compare counts: `marketsData.length` vs database count
- Spot-check sample markets for correct transformation

## Phase 8: Testing and Validation

### 8.1 Test Scenarios

- Homepage with location granted: shows state's open markets
- Homepage with location denied: shows default markets
- Markets page with state filter: fetches filtered markets
- Map page: loads markets with coordinates
- "Browse More" button: loads additional markets
- All existing filters still work (amenities, parking, etc.)

### 8.2 Performance Verification

- Check network tab: initial load should be ~50KB not ~2MB
- Verify indexes are being used (Supabase dashboard query analytics)
- Test with different state filters

## Phase 9: Cleanup and Documentation

### 9.1 Update Type Definitions

- Keep `lib/markets-data.ts` for TypeScript types only
- Mark `getAllMarkets()` as deprecated (for backward compatibility during migration)
- Update imports across codebase to use `lib/db.ts`

### 9.2 Documentation

- Update README.md with Supabase setup instructions
- Document environment variables
- Add troubleshooting section

## Implementation Order

1. Phase 1: Dependencies (can be done immediately)
2. Phase 2: Database Schema (requires Supabase project)
3. Phase 3: Helper Functions (foundation for everything else)
4. Phase 7: Data Migration (get data into database)
5. Phase 4: Homepage (main user entry point)
6. Phase 5: Markets Page
7. Phase 6: Map Page
8. Phase 8: Testing
9. Phase 9: Cleanup

## Error Handling Checklist

- Supabase connection errors (network issues, invalid credentials)
- Geolocation denied/not available (graceful fallback)
- Empty query results (show appropriate message)
- Data transformation errors (validate dbRowToMarket conversion)
- Index usage verification (ensure queries use indexes)

## Key Files to Create/Modify

**New Files:**

- `lib/supabase.ts` - Supabase client setup
- `lib/db.ts` - Database query functions
- `lib/geolocation.ts` - Coordinate to state mapping
- `scripts/run-migration.ts` - One-time migration script

**Modified Files:**

- `app/page.tsx` - Add server-side fetching
- `components/homepage-client.tsx` - Add geolocation + server fetches
- `app/markets/page.tsx` - Add server-side fetching
- `components/markets-filter-client.tsx` - Add server fetches on filter change
- `app/map/page.tsx` - Convert to client component with server fetches
- `package.json` - Add @supabase/supabase-js

**Keep for Reference:**

- `lib/markets-data.ts` - Keep for types, mark functions as deprecated