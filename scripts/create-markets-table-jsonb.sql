-- ============================================================================
-- Pasar Malam Markets Table Schema (JSONB-based)
-- ============================================================================
-- Optimized for Supabase (PostgreSQL)
-- Matches TypeScript Market interface structure
-- Uses JSONB for flexible schedule and nested object storage
-- ============================================================================

-- Enable required extensions (Supabase typically has these enabled)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For trigram full-text search

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
  -- Structure: [{"days": ["tue", "thu"], "times": [{"start": "17:00", "end": "22:00", "note": "Night market"}]}]
  schedule            JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Timestamps (Supabase convention)
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_status CHECK (status IN ('Active', 'Inactive', 'Suspended', 'Closed')),
  CONSTRAINT chk_area_positive CHECK (area_m2 IS NULL OR area_m2 >= 0),
  CONSTRAINT chk_total_shop_positive CHECK (total_shop IS NULL OR total_shop >= 0),
  
  -- JSONB structure validation (using CHECK constraints)
  CONSTRAINT chk_schedule_is_array CHECK (jsonb_typeof(schedule) = 'array'),
  CONSTRAINT chk_location_structure CHECK (
    location IS NULL OR (
      jsonb_typeof(location) = 'object' AND
      (location ? 'latitude' OR location ? 'longitude' OR location ? 'gmaps_link')
    )
  ),
  CONSTRAINT chk_contact_structure CHECK (
    contact IS NULL OR (
      jsonb_typeof(contact) = 'object' AND
      (contact ? 'phone' OR contact ? 'email')
    )
  )
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- B-tree indexes for common filter queries (state, district, status)
CREATE INDEX IF NOT EXISTS idx_pasar_malams_state ON pasar_malams(state);
CREATE INDEX IF NOT EXISTS idx_pasar_malams_district ON pasar_malams(district);
CREATE INDEX IF NOT EXISTS idx_pasar_malams_state_district ON pasar_malams(state, district);
CREATE INDEX IF NOT EXISTS idx_pasar_malams_status ON pasar_malams(status);

-- Composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_pasar_malams_state_status ON pasar_malams(state, status);
CREATE INDEX IF NOT EXISTS idx_pasar_malams_amenities ON pasar_malams(amen_toilet, amen_prayer_room);
CREATE INDEX IF NOT EXISTS idx_pasar_malams_parking ON pasar_malams(parking_available, parking_accessible);

-- GIN index for schedule JSONB queries (find markets by day, time)
-- This enables fast queries like: WHERE schedule @> '[{"days": ["tue"]}]'::jsonb
CREATE INDEX IF NOT EXISTS idx_pasar_malams_schedule_gin ON pasar_malams USING GIN (schedule);

-- GIN index for location JSONB (spatial queries, though PostGIS would be better for large scale)
CREATE INDEX IF NOT EXISTS idx_pasar_malams_location_gin ON pasar_malams USING GIN (location) WHERE location IS NOT NULL;

-- Full-text search indexes using GIN with tsvector
-- Name field
CREATE INDEX IF NOT EXISTS idx_pasar_malams_name_fts 
  ON pasar_malams USING GIN (to_tsvector('english', name));
  
-- Address field
CREATE INDEX IF NOT EXISTS idx_pasar_malams_address_fts 
  ON pasar_malams USING GIN (to_tsvector('english', address));
  
-- Description field (with COALESCE for NULL handling)
CREATE INDEX IF NOT EXISTS idx_pasar_malams_description_fts 
  ON pasar_malams USING GIN (to_tsvector('english', COALESCE(description, '')));

-- Composite full-text index across name, address, description
CREATE INDEX IF NOT EXISTS idx_pasar_malams_combined_fts 
  ON pasar_malams USING GIN (
    to_tsvector('english', 
      COALESCE(name, '') || ' ' || 
      COALESCE(address, '') || ' ' || 
      COALESCE(description, '')
    )
  );

-- Index for created_at/updated_at (for sorting and time-based queries)
CREATE INDEX IF NOT EXISTS idx_pasar_malams_created_at ON pasar_malams(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pasar_malams_updated_at ON pasar_malams(updated_at DESC);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pasar_malams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to validate schedule JSONB structure
-- Ensures schedule matches MarketSchedule[] TypeScript interface
CREATE OR REPLACE FUNCTION validate_schedule_jsonb(schedule_jsonb JSONB)
RETURNS BOOLEAN AS $$
DECLARE
  schedule_item JSONB;
  days_item JSONB;
  times_item JSONB;
BEGIN
  -- Must be an array
  IF jsonb_typeof(schedule_jsonb) != 'array' THEN
    RETURN FALSE;
  END IF;
  
  -- Validate each schedule item
  FOR schedule_item IN SELECT * FROM jsonb_array_elements(schedule_jsonb)
  LOOP
    -- Each item must have 'days' (array) and 'times' (array)
    IF NOT (schedule_item ? 'days' AND schedule_item ? 'times') THEN
      RETURN FALSE;
    END IF;
    
    -- Validate days array
    IF jsonb_typeof(schedule_item->'days') != 'array' THEN
      RETURN FALSE;
    END IF;
    
    -- Validate times array
    IF jsonb_typeof(schedule_item->'times') != 'array' THEN
      RETURN FALSE;
    END IF;
    
    -- Validate each time object has start and end
    FOR times_item IN SELECT * FROM jsonb_array_elements(schedule_item->'times')
    LOOP
      IF NOT (times_item ? 'start' AND times_item ? 'end') THEN
        RETURN FALSE;
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at automatically
DROP TRIGGER IF EXISTS update_pasar_malams_updated_at ON pasar_malams;
CREATE TRIGGER update_pasar_malams_updated_at
  BEFORE UPDATE ON pasar_malams
  FOR EACH ROW
  EXECUTE FUNCTION update_pasar_malams_updated_at();

-- Optional: Trigger to validate schedule structure on insert/update
-- Uncomment if you want strict validation at DB level
-- DROP TRIGGER IF EXISTS validate_pasar_malams_schedule ON pasar_malams;
-- CREATE TRIGGER validate_pasar_malams_schedule
--   BEFORE INSERT OR UPDATE ON pasar_malams
--   FOR EACH ROW
--   WHEN (NEW.schedule IS NOT NULL)
--   EXECUTE FUNCTION validate_schedule_jsonb(NEW.schedule);

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

-- Example insert matching your TypeScript Market interface
INSERT INTO pasar_malams (
  id,
  name,
  address,
  district,
  state,
  status,
  description,
  area_m2,
  total_shop,
  parking_available,
  parking_accessible,
  parking_notes,
  amen_toilet,
  amen_prayer_room,
  contact,
  location,
  schedule
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
  true,
  true,
  'Limited roadside parking available. Best to arrive early for better parking spots.',
  true,
  true,
  NULL, -- contact can be NULL or JSONB
  '{"latitude": 3.2104933, "longitude": 101.7493301, "gmaps_link": "https://maps.app.goo.gl/QmFnDaXLgfLxY8LM8"}'::jsonb,
  '[
    {
      "days": ["tue"],
      "times": [
        {"start": "17:00", "end": "22:00", "note": "Night market"}
      ]
    },
    {
      "days": ["thu"],
      "times": [
        {"start": "17:00", "end": "22:00", "note": "Night market"}
      ]
    },
    {
      "days": ["sat"],
      "times": [
        {"start": "07:00", "end": "11:00", "note": "Morning market"},
        {"start": "17:00", "end": "22:00", "note": "Evening market"}
      ]
    }
  ]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- USAGE EXAMPLES AND QUERIES
-- ============================================================================

-- Example 1: Find all markets in a specific state
-- SELECT * FROM pasar_malams WHERE state = 'Kuala Lumpur';

-- Example 2: Find markets open on Tuesday (using JSONB query)
-- SELECT * FROM pasar_malams 
-- WHERE schedule @> '[{"days": ["tue"]}]'::jsonb;

-- Example 3: Find markets with toilet facilities
-- SELECT * FROM pasar_malams WHERE amen_toilet = true;

-- Example 4: Full-text search across name, address, description
-- SELECT * FROM pasar_malams 
-- WHERE to_tsvector('english', name || ' ' || address || ' ' || COALESCE(description, '')) 
--   @@ plainto_tsquery('english', 'night market food');

-- Example 5: Find markets with specific time slot on a day
-- SELECT * FROM pasar_malams
-- WHERE EXISTS (
--   SELECT 1 
--   FROM jsonb_array_elements(schedule) AS sched
--   CROSS JOIN jsonb_array_elements(sched->'times') AS time
--   WHERE sched->'days' ? 'tue'
--     AND (time->>'start')::time <= '19:00'::time
--     AND (time->>'end')::time >= '19:00'::time
-- );

-- Example 6: Find markets near coordinates (basic distance calculation)
-- SELECT *, 
--   SQRT(
--     POWER((location->>'latitude')::numeric - 3.15, 2) + 
--     POWER((location->>'longitude')::numeric - 101.70, 2)
--   ) AS distance
-- FROM pasar_malams
-- WHERE location IS NOT NULL
-- ORDER BY distance
-- LIMIT 10;

-- Example 7: Get all markets with multiple time slots on same day
-- SELECT id, name, schedule
-- FROM pasar_malams
-- WHERE EXISTS (
--   SELECT 1
--   FROM jsonb_array_elements(schedule) AS sched
--   WHERE jsonb_array_length(sched->'times') > 1
-- );

-- Example 8: Count markets by state
-- SELECT state, COUNT(*) as market_count
-- FROM pasar_malams
-- WHERE status = 'Active'
-- GROUP BY state
-- ORDER BY market_count DESC;

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================
--
-- To migrate from your existing TypeScript markets-data.ts:
-- 
-- 1. Export your markets data to JSON/CSV
-- 2. Use a migration script to transform and insert:
--    - Schedule array stays as JSONB
--    - Parking object → columns (available, accessible, notes)
--    - Amenities object → columns (toilet, prayer_room)
--    - Contact object → JSONB
--    - Location object → JSONB
--
-- Example migration snippet:
-- INSERT INTO pasar_malams (id, name, ..., schedule, parking_available, ...)
-- SELECT 
--   market.id,
--   market.name,
--   ...
--   market.schedule::jsonb,
--   (market.parking->>'available')::boolean,
--   ...
-- FROM (SELECT jsonb_array_elements($1::jsonb) AS market) markets;
--
-- ============================================================================
-- PERFORMANCE TIPS
-- ============================================================================
--
-- 1. GIN indexes are larger but faster for JSONB containment queries
-- 2. Use specific indexes for common filter combinations
-- 3. For spatial queries, consider PostGIS extension with POINT geometry
-- 4. JSONB queries are fast but avoid nested loops in application code
-- 5. Use EXPLAIN ANALYZE to optimize slow queries
--
-- ============================================================================
-- MAINTENANCE
-- ============================================================================
--
-- To add a new field to schedule or other JSONB columns:
-- 1. No schema migration needed (JSONB is flexible)
-- 2. Update TypeScript interface
-- 3. Update application code
-- 4. Existing data remains valid (backward compatible)
--
-- To optimize queries:
-- 1. ANALYZE pasar_malams; -- Update statistics
-- 2. REINDEX TABLE pasar_malams; -- Rebuild indexes
-- 3. VACUUM ANALYZE pasar_malams; -- Clean up and analyze
--
-- ============================================================================

