-- Seller directory: standalone sellers, their items (with single optional price),
-- and their selling locations (a seller can attend multiple markets on different days).
-- Conventions match 0001/0002:
--   jsonb -> TEXT with json_valid() CHECK
--   timestamps -> TEXT (ISO-8601), set in application code
--   ids -> app-side crypto.randomUUID()

CREATE TABLE sellers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  phone TEXT,
  social TEXT CHECK (social IS NULL OR json_valid(social)),
  status TEXT NOT NULL DEFAULT 'Active'
    CHECK (status IN ('Active', 'Inactive')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_sellers_status ON sellers(status);
CREATE INDEX idx_sellers_category ON sellers(category);

CREATE TABLE seller_items (
  id TEXT PRIMARY KEY,
  seller_id TEXT NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price REAL,
  note TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_seller_items_seller ON seller_items(seller_id, sort_order);

CREATE TABLE seller_locations (
  id TEXT PRIMARY KEY,
  seller_id TEXT NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  market_id TEXT NOT NULL REFERENCES pasar_malams(id) ON DELETE CASCADE,
  stall TEXT,
  notes TEXT,
  UNIQUE (seller_id, market_id)
);

CREATE INDEX idx_seller_locations_seller ON seller_locations(seller_id);
CREATE INDEX idx_seller_locations_market ON seller_locations(market_id);

-- Which days a seller attends a given market (mirrors market_days pattern).
CREATE TABLE seller_location_days (
  seller_location_id TEXT NOT NULL REFERENCES seller_locations(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  PRIMARY KEY (seller_location_id, day)
);

CREATE INDEX idx_seller_location_days_day ON seller_location_days(day);

-- Public suggestions for sellers (new seller or update to existing).
CREATE TABLE seller_suggestions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('new', 'update')),
  target_id TEXT REFERENCES sellers(id) ON DELETE SET NULL,
  data TEXT NOT NULL CHECK (json_valid(data)),
  submitter_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_by TEXT,
  created_at TEXT NOT NULL,
  reviewed_at TEXT
);

CREATE INDEX idx_seller_suggestions_status ON seller_suggestions(status, created_at DESC);

-- Full-text index over items, seller names, and categories for food search.
-- Kept in sync by application code on every seller write.
CREATE VIRTUAL TABLE seller_fts USING fts5(
  seller_id UNINDEXED,
  content,
  tokenize = 'unicode61 remove_diacritics 2'
);