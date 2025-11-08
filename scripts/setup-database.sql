-- ============================================================================
-- Pasar Malam Markets Table Schema (JSONB-based) - OPTIMIZED FOR FREE TIER
-- ============================================================================
-- Run this script in Supabase SQL Editor to create the pasar_malams table
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
  shop_list        TEXT,
  
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
CREATE INDEX IF NOT EXISTS idx_pasar_malams_state ON pasar_malams(state);
CREATE INDEX IF NOT EXISTS idx_pasar_malams_state_district ON pasar_malams(state, district);
CREATE INDEX IF NOT EXISTS idx_pasar_malams_status ON pasar_malams(status) WHERE status = 'Active';

-- Composite index for common filter combination (state + status)
CREATE INDEX IF NOT EXISTS idx_pasar_malams_state_active 
  ON pasar_malams(state) WHERE status = 'Active';

-- Amenities composite index (both fields frequently filtered together)
CREATE INDEX IF NOT EXISTS idx_pasar_malams_amenities 
  ON pasar_malams(amen_toilet, amen_prayer_room);

-- Parking composite index (both fields frequently filtered together)
CREATE INDEX IF NOT EXISTS idx_pasar_malams_parking 
  ON pasar_malams(parking_available, parking_accessible);

-- GIN index for schedule JSONB queries (ESSENTIAL - only one GIN index)
CREATE INDEX IF NOT EXISTS idx_pasar_malams_schedule_gin 
  ON pasar_malams USING GIN (schedule);

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
-- SAMPLE DATA (Optional - Remove if you don't want sample data)
-- ============================================================================

INSERT INTO pasar_malams (
  id, name, address, district, state, status, description,
  shop_list, area_m2, total_shop,
  parking_available, parking_accessible, parking_notes,
  amen_toilet, amen_prayer_room,
  location, schedule
) VALUES (
  'taman-melawati-kl',
  'Pasar Malam Taman Melawati',
  'Pusat Bandar, 311, Lorong Selangor, Taman Melawati, 53100 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur',
  'Kuala Lumpur',
  'Kuala Lumpur',
  'Active',
  'One of the most popular night markets in Kuala Lumpur, Pasar Malam Taman Melawati offers a wide variety of local street food, fresh produce, and household items. Known for its vibrant atmosphere and authentic Malaysian cuisine.',
  'Sate, Apam Balik, Burger, Nasi Campur, Buah, Sayur, Baju, Air Kordial, Peneram, Putu Mayam',
  4590.72,
  45,
  true, 
  true, 
  'Limited roadside parking available. Best to arrive early for better parking spots.',
  true, 
  true,
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
-- Setup Complete!
-- ============================================================================

