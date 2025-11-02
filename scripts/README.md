# Database Schema Scripts

This directory contains SQL scripts and migration utilities for the Pasar Malam database schema.

## Files Overview

### 1. `create-markets-table-jsonb.sql`
**Main database schema script**

- Creates `pasar_malams` table with JSONB-based schedule storage
- Includes comprehensive indexes (B-tree, GIN, full-text search)
- Sets up Row Level Security (RLS) policies for Supabase
- Includes triggers for `updated_at` timestamp
- Contains validation constraints
- Includes sample data and usage examples

**Features:**
- ✅ Matches TypeScript `Market` interface exactly
- ✅ JSONB for flexible schedule storage
- ✅ Optimized indexes for common queries
- ✅ Supabase-friendly (RLS, timestamps, triggers)
- ✅ Full-text search support
- ✅ Sample queries and documentation

**To use:**
1. Open Supabase SQL Editor
2. Copy and paste the entire script
3. Run it
4. Verify with: `SELECT COUNT(*) FROM pasar_malams;`

---

### 2. `create-markets-table.sql` (Legacy)
**Wide-table schema (not recommended)**

This is the old schema with columns for each day. Kept for reference but **not recommended** for new deployments.

---

### 3. `migrate-typescript-to-db.ts`
**TypeScript migration utilities**

Helper functions for migrating from TypeScript `markets-data.ts` to Supabase:

- `marketToDbRow()` - Converts Market → database row
- `dbRowToMarket()` - Converts database row → Market
- `validateMarket()` - Validates market data structure
- `migrateMarketsToSupabase()` - Batch migration function

**Usage:**
```typescript
import { marketsData } from '@/lib/markets-data'
import { migrateMarketsToSupabase } from './migrate-typescript-to-db'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)
await migrateMarketsToSupabase(supabase, marketsData)
```

---

### 4. `MIGRATION_GUIDE.md`
**Complete migration documentation**

Step-by-step guide covering:
- Prerequisites and setup
- SQL schema execution
- Data migration process
- Code updates
- Troubleshooting
- Performance optimization

**Read this before migrating!**

---

## Quick Start

### For New Deployments:

1. **Create the schema:**
   ```bash
   # In Supabase SQL Editor, run:
   scripts/create-markets-table-jsonb.sql
   ```

2. **Migrate your data:**
   ```bash
   # Set environment variables
   export NEXT_PUBLIC_SUPABASE_URL="https://..."
   export SUPABASE_SERVICE_ROLE_KEY="..."

   # Run migration
   pnpm tsx scripts/run-migration.ts
   ```

### For Existing Deployments:

1. **Backup existing data** (if any)
2. **Review MIGRATION_GUIDE.md**
3. **Run migration script**
4. **Verify data integrity**
5. **Update application code**

---

## Schema Comparison

| Feature | Legacy (Wide Table) | JSONB Schema |
|---------|-------------------|--------------|
| Schedule Storage | 14 columns (mon-sun × 2 slots) | JSONB array |
| Flexibility | Fixed 2 slots per day | Unlimited times per day |
| Query Complexity | Simple filters | JSONB queries |
| Migration | Easy from TS | Easy from TS |
| Size | Larger (many NULL columns) | Smaller (sparse) |
| Maintainability | Hard to extend | Easy to extend |

**Recommendation:** Use JSONB schema (`create-markets-table-jsonb.sql`)

---

## Key Design Decisions

### Why JSONB for Schedule?

1. **Matches TypeScript structure** - No transformation needed
2. **Flexible** - Easy to add new fields (notes, special dates)
3. **Indexed** - GIN indexes make queries fast
4. **Queryable** - PostgreSQL JSONB operators work great

### Why Columns for Parking/Amenities?

1. **Filtering performance** - Boolean columns index better
2. **Common queries** - Users filter by amenities frequently
3. **Simplicity** - Direct WHERE clauses, no JSONB parsing

### Why JSONB for Contact/Location?

1. **Optional** - Many markets don't have contact info
2. **Less filtered** - Not used in WHERE clauses often
3. **Flexible** - Easy to add new fields (social media, etc.)

---

## Query Examples

### Find Markets Open on Tuesday

```sql
SELECT * FROM pasar_malams 
WHERE schedule @> '[{"days": ["tue"]}]'::jsonb;
```

### Find Markets with Toilet

```sql
SELECT * FROM pasar_malams 
WHERE amen_toilet = true;
```

### Full-Text Search

```sql
SELECT * FROM pasar_malams 
WHERE to_tsvector('english', name || ' ' || address) 
  @@ plainto_tsquery('english', 'night market');
```

### Filter by State + District + Amenities

```sql
SELECT * FROM pasar_malams
WHERE state = 'Kuala Lumpur'
  AND district = 'Cheras'
  AND amen_toilet = true
  AND parking_available = true;
```

---

## Indexes Created

- **B-tree indexes:** state, district, status, amenities, parking
- **GIN indexes:** schedule (JSONB), location (JSONB)
- **Full-text indexes:** name, address, description (tsvector)
- **Composite indexes:** state+district, state+status

All optimized for common query patterns in the application.

---

## Maintenance

### Regular Tasks

1. **Update statistics:**
   ```sql
   ANALYZE pasar_malams;
   ```

2. **Check index usage:**
   ```sql
   SELECT * FROM pg_stat_user_indexes 
   WHERE tablename = 'pasar_malams';
   ```

3. **Monitor table size:**
   ```sql
   SELECT 
     pg_size_pretty(pg_total_relation_size('pasar_malams')) as total_size,
     pg_size_pretty(pg_relation_size('pasar_malams')) as table_size,
     pg_size_pretty(pg_indexes_size('pasar_malams')) as indexes_size;
   ```

### Vacuum (PostgreSQL maintenance)

```sql
VACUUM ANALYZE pasar_malams;
```

---

## Troubleshooting

### Index not being used?
- Run `ANALYZE pasar_malams;`
- Check query plan with `EXPLAIN ANALYZE`
- Verify index exists: `\d+ pasar_malams`

### RLS blocking queries?
- Check policies: `SELECT * FROM pg_policies WHERE tablename = 'pasar_malams';`
- Verify you're using authenticated/anonymous roles correctly

### JSONB query not working?
- Validate structure: `SELECT jsonb_pretty(schedule) FROM pasar_malams LIMIT 1;`
- Check syntax: JSONB operators (@>, ?, etc.)

---

## Support

For issues:
- Review `MIGRATION_GUIDE.md` for detailed steps
- Check Supabase logs in dashboard
- Test queries in SQL Editor
- Verify environment variables

