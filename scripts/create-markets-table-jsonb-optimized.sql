-- ============================================================================
-- Pasar Malam Markets Table Schema (JSONB-based) - OPTIMIZED FOR FREE TIER
-- ============================================================================
-- Optimized for Supabase Free Tier:
-- - Minimal index overhead (only essential indexes)
-- - Removed unused full-text search (client-side filtering)
-- - Simplified constraints
-- - Removed unnecessary GIN indexes
-- ============================================================================

-- ============================================================================
-- MAIN TABLE: pasar_malams
-- ============================================================================

CREATE TABLE IF NOT EXISTS pasar_malams (
  -- Primary identification
  id               VARCHAR(128) PRIMARY KEY,
  
  -- Core information (regular columns for filtering/indexing)
  name             VARCHAR(256) NOT NULL,
  address          VARCHAR(512) NOT NULL,
  district         VARCHAR(128) NOT NULL,
  state            VARCHAR(64)  NOT NULL,
  status           VARCHAR(32)  NOT NULL DEFAULT 'Active',
  
  -- Optional text fields
  description      TEXT,
  
  -- Numeric fields
  area_m2          DECIMAL(12, 2),
  total_shop       INTEGER,
  
  -- Parking (stored as columns for efficient boolean filtering)
  parking_available    BOOLEAN NOT NULL DEFAULT FALSE,
  parking_accessible   BOOLEAN NOT NULL DEFAULT FALSE,
  parking_notes        TEXT,
  
  -- Amenities (stored as columns for efficient boolean filtering)
  amen_toilet          BOOLEAN NOT NULL DEFAULT FALSE,
  amen_prayer_room     BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Contact information (JSONB for optional nested object)
  contact             JSONB,
  
  -- Location data (JSONB for optional nested object with coordinates)
  location            JSONB,
  
  -- Schedule data (JSONB array matching MarketSchedule[] structure)
  schedule            JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Timestamps (Supabase convention)
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Essential constraints only (minimal overhead)
  CONSTRAINT chk_status CHECK (status IN ('Active', 'Inactive', 'Suspended', 'Closed')),
  CONSTRAINT chk_schedule_is_array CHECK (jsonb_typeof(schedule) = 'array')
);

-- ============================================================================
-- ESSENTIAL INDEXES ONLY (Optimized for free tier)
-- ============================================================================

-- Core filter indexes (B-tree - small and fast)
-- These are used heavily based on your client-side filter patterns
CREATE INDEX IF NOT EXISTS idx_pasar_malams_state ON pasar_malams(state);
CREATE INDEX IF NOT EXISTS idx_pasar_malams_state_district ON pasar_malams(state, district);
CREATE INDEX IF NOT EXISTS idx_pasar_malams_status ON pasar_malams(status) WHERE status = 'Active';

-- Composite index for common filter combination (state + status)
-- Covers: WHERE state = X AND status = 'Active' (your most common query)
CREATE INDEX IF NOT EXISTS idx_pasar_malams_state_active 
  ON pasar_malams(state) WHERE status = 'Active';

-- Amenities composite index (both fields frequently filtered together)
CREATE INDEX IF NOT EXISTS idx_pasar_malams_amenities 
  ON pasar_malams(amen_toilet, amen_prayer_room);

-- Parking composite index (both fields frequently filtered together)
CREATE INDEX IF NOT EXISTS idx_pasar_malams_parking 
  ON pasar_malams(parking_available, parking_accessible);

-- GIN index for schedule JSONB queries (ESSENTIAL - only one GIN index)
-- This is the only GIN index - GIN indexes are large but necessary for JSONB queries
CREATE INDEX IF NOT EXISTS idx_pasar_malams_schedule_gin 
  ON pasar_malams USING GIN (schedule);

-- ============================================================================
-- FUNCTIONS (Minimal)
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pasar_malams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at automatically
DROP TRIGGER IF EXISTS update_pasar_malams_updated_at ON pasar_malams;
CREATE TRIGGER update_pasar_malams_updated_at
  BEFORE UPDATE ON pasar_malams
  FOR EACH ROW
  EXECUTE FUNCTION update_pasar_malams_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - Supabase
-- ============================================================================

-- Enable RLS
ALTER TABLE pasar_malams ENABLE ROW LEVEL SECURITY;

-- Policy: Public read access (everyone can SELECT)
DROP POLICY IF EXISTS "Public read access" ON pasar_malams;
CREATE POLICY "Public read access" ON pasar_malams
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert
DROP POLICY IF EXISTS "Authenticated users can insert" ON pasar_malams;
CREATE POLICY "Authenticated users can insert" ON pasar_malams
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update
DROP POLICY IF EXISTS "Authenticated users can update" ON pasar_malams;
CREATE POLICY "Authenticated users can update" ON pasar_malams
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can delete
DROP POLICY IF EXISTS "Authenticated users can delete" ON pasar_malams;
CREATE POLICY "Authenticated users can delete" ON pasar_malams
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

INSERT INTO pasar_malams (
  id, name, address, district, state, status, description,
  area_m2, total_shop,
  parking_available, parking_accessible, parking_notes,
  amen_toilet, amen_prayer_room,
  contact, location, schedule
) VALUES (
  'taman-melawati-kl',
  'Pasar Malam Taman Melawati',
  'Pusat Bandar, 311, Lorong Selangor, Taman Melawati, 53100 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur',
  'Kuala Lumpur',
  'Kuala Lumpur',
  'Active',
  'One of the most popular night markets in Kuala Lumpur, Pasar Malam Taman Melawati offers a wide variety of local street food, fresh produce, and household items. Known for its vibrant atmosphere and authentic Malaysian cuisine.',
  4590.72,
  45,
  true, true, 'Limited roadside parking available. Best to arrive early for better parking spots.',
  true, true,
  NULL,
  '{"latitude": 3.2104933, "longitude": 101.7493301, "gmaps_link": "https://maps.app.goo.gl/QmFnDaXLgfLxY8LM8"}'::jsonb,
  '[
    {"days": ["tue"], "times": [{"start": "17:00", "end": "22:00", "note": "Night market"}]},
    {"days": ["thu"], "times": [{"start": "17:00", "end": "22:00", "note": "Night market"}]},
    {"days": ["sat"], "times": [
      {"start": "07:00", "end": "11:00", "note": "Morning market"},
      {"start": "17:00", "end": "22:00", "note": "Evening market"}
    ]}
  ]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- OPTIMIZED QUERY EXAMPLES
-- ============================================================================

-- Example 1: Find active markets by state (uses partial index)
-- SELECT * FROM pasar_malams WHERE state = 'Kuala Lumpur' AND status = 'Active';

-- Example 2: Find markets by state + district (uses composite index)
-- SELECT * FROM pasar_malams WHERE state = 'Kuala Lumpur' AND district = 'Cheras';

-- Example 3: Find markets open on Tuesday (uses GIN index)
-- SELECT * FROM pasar_malams WHERE schedule @> '[{"days": ["tue"]}]'::jsonb;

-- Example 4: Find markets with amenities (uses composite index)
-- SELECT * FROM pasar_malams WHERE amen_toilet = true AND amen_prayer_room = true;

-- Example 5: Complex filter (uses multiple indexes)
-- SELECT * FROM pasar_malams
-- WHERE state = 'Kuala Lumpur'
--   AND status = 'Active'
--   AND amen_toilet = true
--   AND parking_available = true
--   AND schedule @> '[{"days": ["tue"]}]'::jsonb;

-- ============================================================================
-- RESOURCE USAGE NOTES (Free Tier Optimization)
-- ============================================================================
--
-- REMOVED (saves resources):
-- ❌ Full-text search indexes (4 removed) - Client does string matching, not server-side FTS
-- ❌ Location GIN index - Not used in queries, adds ~20-30% index overhead
-- ❌ District-only index - Covered by state_district composite
-- ❌ State_status composite - Redundant with state index
-- ❌ created_at/updated_at indexes - Not used for sorting/filtering
-- ❌ Complex JSONB validation constraints - Overhead with little benefit
-- ❌ Unused validation function - Code commented out, removes function overhead
--
-- KEPT (essential):
-- ✅ B-tree indexes for state, state_district, status (small, fast)
-- ✅ Composite indexes for amenities and parking (common filters)
-- ✅ Single GIN index for schedule (necessary for JSONB queries)
-- ✅ Partial index on status='Active' (smaller, faster for most queries)
--
-- ESTIMATED SAVINGS:
-- - Index count: 13 → 7 indexes (46% reduction)
-- - Estimated index size reduction: ~40-50%
-- - Query performance: Same or better (removed unused indexes)
-- - Storage: ~30-40% less index storage
--
-- ============================================================================
-- MONITORING & MAINTENANCE
-- ============================================================================

-- Check index sizes (run after data migration)
-- SELECT
--   schemaname, tablename, indexname,
--   pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
--   idx_scan AS times_used
-- FROM pg_stat_user_indexes
-- WHERE tablename = 'pasar_malams'
-- ORDER BY pg_relation_size(indexrelid) DESC;

-- Check table and index sizes
-- SELECT
--   pg_size_pretty(pg_total_relation_size('pasar_malams')) AS total_size,
--   pg_size_pretty(pg_relation_size('pasar_malams')) AS table_size,
--   pg_size_pretty(pg_indexes_size('pasar_malams')) AS indexes_size;

-- Analyze table after data migration
-- ANALYZE pasar_malams;

-- ============================================================================

