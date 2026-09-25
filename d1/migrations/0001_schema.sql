-- D1 (SQLite) schema for caripasarmalam
-- Migrated from Supabase Postgres (see supabase/migrations for provenance)
-- Differences from Postgres:
--   jsonb -> TEXT with json_valid() CHECK
--   boolean -> INTEGER (0/1)
--   timestamptz -> TEXT (ISO-8601)
--   gen_random_uuid() -> app-side crypto.randomUUID()
--   updated_at trigger -> set in application code on every write
--   RLS -> enforced server-side; admin writes gated by requireAdmin()
--   schedule GIN index -> market_days join table (see 0002_market_days.sql)

CREATE TABLE pasar_malams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active'
    CHECK (status IN ('Active', 'Inactive', 'Suspended', 'Closed')),
  description TEXT,
  area_m2 REAL,
  total_shop INTEGER,
  parking_available INTEGER NOT NULL DEFAULT 0,
  parking_accessible INTEGER NOT NULL DEFAULT 0,
  parking_notes TEXT,
  amen_toilet INTEGER NOT NULL DEFAULT 0,
  amen_prayer_room INTEGER NOT NULL DEFAULT 0,
  location TEXT CHECK (location IS NULL OR json_valid(location)),
  schedule TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(schedule)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  shop_list TEXT
);

CREATE INDEX idx_pm_state ON pasar_malams(state);
CREATE INDEX idx_pm_state_district ON pasar_malams(state, district);
CREATE INDEX idx_pm_status ON pasar_malams(status);

CREATE TABLE market_suggestions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('new', 'update')),
  target_id TEXT REFERENCES pasar_malams(id) ON DELETE SET NULL,
  data TEXT NOT NULL CHECK (json_valid(data)),
  submitter_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_by TEXT,
  created_at TEXT NOT NULL,
  reviewed_at TEXT
);

CREATE INDEX idx_suggestions_status ON market_suggestions(status, created_at DESC);