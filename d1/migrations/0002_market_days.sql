-- Index-backed day filter for pasar_malams schedule.
-- Replaces the Postgres GIN index + schedule @> '[{"days":["mon"]}]' query.
-- Populated by scripts/export-supabase-d1.mjs from each market's schedule JSON.

CREATE TABLE market_days (
  market_id TEXT NOT NULL REFERENCES pasar_malams(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  PRIMARY KEY (market_id, day)
);

CREATE INDEX idx_market_days_day ON market_days(day);