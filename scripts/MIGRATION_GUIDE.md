# Migration Guide: TypeScript to Supabase JSONB Schema

This guide walks you through migrating your existing TypeScript `markets-data.ts` to the new JSONB-based Supabase database schema.

## Prerequisites

1. **Supabase Project Setup**
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Get your project URL and anon/service role keys
   - Install Supabase CLI (optional but recommended)

2. **Database Schema**
   - Run the SQL script: `scripts/create-markets-table-jsonb.sql`
   - This creates the table, indexes, RLS policies, and triggers

3. **TypeScript Dependencies**
   ```bash
   pnpm add @supabase/supabase-js
   ```

## Step-by-Step Migration

### Step 1: Run the SQL Schema

In your Supabase dashboard:

1. Go to **SQL Editor**
2. Open `scripts/create-markets-table-jsonb.sql`
3. Run the entire script
4. Verify the table was created:
   ```sql
   SELECT COUNT(*) FROM pasar_malams;
   ```

### Step 2: Create Migration Script

Create a file `scripts/run-migration.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import { marketsData } from '@/lib/markets-data'
import { migrateMarketsToSupabase, validateMarket } from './migrate-typescript-to-db'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for migration

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
  console.log(`📦 Preparing to migrate ${marketsData.length} markets...`)
  
  // Option 1: Dry run (validate without inserting)
  console.log('\n🔍 Running dry run validation...')
  await migrateMarketsToSupabase(supabase, marketsData, { dryRun: true })
  
  // Option 2: Actual migration (uncomment when ready)
  // console.log('\n🚀 Starting migration...')
  // const result = await migrateMarketsToSupabase(supabase, marketsData, {
  //   batchSize: 50,
  //   dryRun: false,
  // })
  // console.log(`✅ Migration complete: ${result.inserted} markets inserted`)
}

main().catch(console.error)
```

### Step 3: Set Environment Variables

Create or update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**⚠️ Security Note:** 
- `SUPABASE_SERVICE_ROLE_KEY` should **never** be exposed to the client
- Use it only in server-side code or migration scripts
- Never commit it to version control

### Step 4: Run Migration

```bash
# Install tsx for running TypeScript directly
pnpm add -D tsx

# Run migration
pnpm tsx scripts/run-migration.ts
```

### Step 5: Verify Migration

```sql
-- Check total count
SELECT COUNT(*) as total_markets FROM pasar_malams;

-- Check a specific market
SELECT * FROM pasar_malams WHERE id = 'taman-melawati-kl';

-- Verify schedule JSONB structure
SELECT 
  id, 
  name, 
  schedule->0 as first_schedule,
  jsonb_array_length(schedule) as schedule_count
FROM pasar_malams 
LIMIT 5;

-- Check indexes are being used
EXPLAIN ANALYZE SELECT * FROM pasar_malams WHERE state = 'Kuala Lumpur';
```

## Data Transformation Details

### Schedule Array (MarketSchedule[])

**TypeScript:**
```typescript
schedule: [
  {
    days: ["tue", "thu"],
    times: [
      { start: "17:00", end: "22:00", note: "Night market" }
    ]
  }
]
```

**JSONB in Database:**
```jsonb
'[
  {
    "days": ["tue", "thu"],
    "times": [
      {"start": "17:00", "end": "22:00", "note": "Night market"}
    ]
  }
]'::jsonb
```

### Parking Object

**TypeScript:**
```typescript
parking: {
  available: true,
  accessible: true,
  notes: "Limited parking"
}
```

**Database Columns:**
- `parking_available`: `true`
- `parking_accessible`: `true`
- `parking_notes`: `"Limited parking"`

### Contact & Location Objects

These remain as JSONB since they're optional and less frequently filtered:

**TypeScript:**
```typescript
contact: { phone: "+60123456789", email: "info@market.com" }
location: { latitude: 3.21, longitude: 101.75, gmaps_link: "https://..." }
```

**Database:**
- Stored as JSONB strings
- Parsed automatically when querying

## Common Queries After Migration

### Query Markets by Day

```typescript
// Using Supabase client
const { data } = await supabase
  .from('pasar_malams')
  .select('*')
  .contains('schedule', [{ days: ['tue'] }])
```

### Query Markets by Amenities

```typescript
const { data } = await supabase
  .from('pasar_malams')
  .select('*')
  .eq('amen_toilet', true)
  .eq('amen_prayer_room', true)
```

### Full-Text Search

```sql
SELECT * FROM pasar_malams 
WHERE to_tsvector('english', name || ' ' || address || ' ' || COALESCE(description, '')) 
  @@ plainto_tsquery('english', 'night market food');
```

### Filter by State and District

```typescript
const { data } = await supabase
  .from('pasar_malams')
  .select('*')
  .eq('state', 'Kuala Lumpur')
  .eq('district', 'Cheras')
```

## Updating Application Code

### 1. Create Supabase Client

Create `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### 2. Replace Static Data Imports

**Before:**
```typescript
import { marketsData } from '@/lib/markets-data'
```

**After:**
```typescript
import { supabase } from '@/lib/supabase'
import { dbRowToMarket } from '@/scripts/migrate-typescript-to-db'

async function getMarkets(): Promise<Market[]> {
  const { data, error } = await supabase
    .from('pasar_malams')
    .select('*')
  
  if (error) throw error
  return data.map(dbRowToMarket)
}
```

### 3. Update Server Components

```typescript
// app/markets/page.tsx
import { getMarkets } from '@/lib/markets-data'

export default async function MarketsPage() {
  const markets = await getMarkets() // Now fetches from Supabase
  // ... rest of component
}
```

## Rollback Plan

If you need to rollback:

1. **Keep your original `markets-data.ts`** - Don't delete it yet
2. **Export from Supabase:**
   ```sql
   COPY (
     SELECT row_to_json(t) 
     FROM (SELECT * FROM pasar_malams) t
   ) TO '/tmp/markets-backup.json';
   ```
3. **Switch back to static data** by reverting imports

## Performance Optimization

### After Migration:

1. **Analyze table statistics:**
   ```sql
   ANALYZE pasar_malams;
   ```

2. **Check index usage:**
   ```sql
   SELECT 
     schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
   FROM pg_stat_user_indexes
   WHERE tablename = 'pasar_malams'
   ORDER BY idx_scan DESC;
   ```

3. **Monitor query performance:**
   ```sql
   EXPLAIN ANALYZE SELECT * FROM pasar_malams 
   WHERE schedule @> '[{"days": ["tue"]}]'::jsonb;
   ```

## Troubleshooting

### Issue: RLS blocking queries

**Solution:** Check RLS policies are set correctly:
```sql
SELECT * FROM pg_policies WHERE tablename = 'pasar_malams';
```

### Issue: JSONB query not working

**Solution:** Verify JSONB structure:
```sql
SELECT jsonb_pretty(schedule) FROM pasar_malams LIMIT 1;
```

### Issue: Slow queries

**Solution:** 
1. Verify indexes exist: `\d+ pasar_malams`
2. Run `ANALYZE pasar_malams;`
3. Check if queries are using indexes with `EXPLAIN ANALYZE`

## Next Steps

1. ✅ Run SQL schema script
2. ✅ Migrate data using migration script
3. ✅ Update application to use Supabase
4. ✅ Test all functionality
5. ✅ Monitor performance
6. ✅ Set up backups
7. ⚠️ Consider PostGIS for advanced spatial queries (if needed)

## Support

For issues:
- Check Supabase logs in dashboard
- Review PostgreSQL logs
- Test queries in SQL Editor
- Verify environment variables

---

**Last Updated:** 2024
**Schema Version:** 1.0 (JSONB-based)

