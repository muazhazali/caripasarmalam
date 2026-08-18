-- Public suggestions must pass through the validated, rate-limited server action.
-- The server action inserts with the service role, which bypasses RLS.
drop policy if exists "public can insert suggestions" on public.market_suggestions;

