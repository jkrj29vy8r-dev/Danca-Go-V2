-- ============================================================================
-- DANCA GO — rental & experience requests
--
-- Two pages now feed the same inbox: coach hire (/inchirieri) and custom day
-- trips (/experiente). They ask different questions, so the row records which
-- form produced it and what the occasion is — otherwise staff open a request
-- with no idea whether it's a corporate shuttle or a school outing.
-- ============================================================================

do $$ begin
  if not exists (select 1 from pg_type where typname = 'request_kind') then
    create type request_kind as enum ('rental', 'experience');
  end if;
end $$;

alter table public.rentals
  add column if not exists kind       request_kind not null default 'rental',
  add column if not exists event_type text,
  -- Free-form because customers describe occasions in ways no enum survives.
  add column if not exists flexible_dates boolean not null default false;

comment on column public.rentals.kind is
  'Which form produced the request: coach hire or a custom day trip.';
comment on column public.rentals.event_type is
  'Occasion, e.g. corporate, nuntă, echipă sportivă, excursie de o zi.';

create index if not exists rentals_kind_idx on public.rentals (kind, status, created_at desc);
