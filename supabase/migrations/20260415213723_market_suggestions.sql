create table public.market_suggestions (
  id               uuid primary key default gen_random_uuid(),
  type             text not null check (type in ('new', 'update')),
  target_id        varchar references public.pasar_malams(id) on delete set null,
  data             jsonb not null,
  submitter_email  text,
  status           text not null default 'pending'
                     check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  reviewed_by      uuid references auth.users(id) on delete set null,
  created_at       timestamptz not null default now(),
  reviewed_at      timestamptz
);

create index on public.market_suggestions (status, created_at desc);

alter table public.market_suggestions enable row level security;

create policy "public can insert suggestions"
  on public.market_suggestions for insert
  to anon, authenticated
  with check (true);

create policy "authenticated users can manage suggestions"
  on public.market_suggestions for all
  to authenticated
  using (true)
  with check (true);
