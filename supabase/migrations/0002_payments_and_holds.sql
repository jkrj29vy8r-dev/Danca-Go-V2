-- ============================================================================
-- DANCA GO — payment readiness + seat holds
--
-- Two things the first migration left open:
--
--  1. A `pending` booking held its seats forever. If a passenger abandons
--     checkout, that inventory never comes back. Seats are now held for a
--     bounded window and released by `release_expired_holds()`.
--
--  2. Payments. The columns and the confirmation function are provider-neutral
--     but shaped for Stripe: amounts already live in minor units (bani), and
--     `payment_reference` takes a PaymentIntent id. Nothing here depends on
--     Stripe being wired up — until it is, bookings are simply confirmed with
--     provider 'cash' on boarding.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Payment columns
-- ---------------------------------------------------------------------------
alter table public.bookings
  add column if not exists currency          text not null default 'RON',
  add column if not exists payment_provider  text,
  add column if not exists payment_reference text,
  add column if not exists paid_at           timestamptz,
  -- Seats are held until this moment; null once the booking is confirmed.
  add column if not exists hold_expires_at   timestamptz;

comment on column public.bookings.payment_reference is
  'Provider-side id. For Stripe this is the PaymentIntent (pi_...).';
comment on column public.bookings.hold_expires_at is
  'While status = pending, the seats are reserved until this instant.';

create index if not exists bookings_hold_idx
  on public.bookings (hold_expires_at)
  where status = 'pending';

create unique index if not exists bookings_payment_reference_idx
  on public.bookings (payment_reference)
  where payment_reference is not null;

-- ---------------------------------------------------------------------------
-- book_trip: now records each passenger and sets a hold window
-- ---------------------------------------------------------------------------
create or replace function public.book_trip(
  p_trip_id       uuid,
  p_contact_name  text,
  p_contact_email text,
  p_contact_phone text,
  p_passengers    jsonb default '[]'::jsonb,
  p_seat_count    integer default 1,
  p_notes         text default null,
  p_hold_minutes  integer default 30
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trip      public.trips;
  v_booking   public.bookings;
  v_ref       text;
  v_seats     integer := greatest(p_seat_count, jsonb_array_length(coalesce(p_passengers, '[]'::jsonb)));
  v_passenger jsonb;
  i           integer;
begin
  if v_seats < 1 or v_seats > 20 then
    raise exception 'Numărul de locuri trebuie să fie între 1 și 20' using errcode = '22023';
  end if;

  if p_contact_email is null or p_contact_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Adresă de email invalidă' using errcode = '22023';
  end if;

  -- Reclaim abandoned holds before checking availability, so a seat freed a
  -- second ago is immediately sellable.
  perform public.release_expired_holds(p_trip_id);

  -- Serialise concurrent purchases of the same departure.
  select * into v_trip from public.trips where id = p_trip_id for update;

  if not found then
    raise exception 'Cursa nu există' using errcode = 'P0002';
  end if;

  if v_trip.status <> 'scheduled' then
    raise exception 'Cursa nu mai este disponibilă' using errcode = '22023';
  end if;

  if (v_trip.departure_date + v_trip.departure_time) < now() then
    raise exception 'Cursa a plecat deja' using errcode = '22023';
  end if;

  if v_trip.seats_taken + v_seats > v_trip.seats_total then
    raise exception 'Nu mai sunt suficiente locuri disponibile' using errcode = '23514';
  end if;

  -- Unique, human-readable reference (no O/0/I/1). Retry on the rare clash.
  loop
    v_ref := 'DG-';
    for i in 1..7 loop
      v_ref := v_ref || substr(
        'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
        1 + floor(random() * 32)::integer,
        1
      );
    end loop;
    exit when not exists (select 1 from public.bookings where booking_ref = v_ref);
  end loop;

  update public.trips
     set seats_taken = seats_taken + v_seats
   where id = p_trip_id;

  insert into public.bookings (
    booking_ref, trip_id, user_id, contact_name, contact_email,
    contact_phone, seat_count, total_price, status, notes, hold_expires_at
  )
  values (
    v_ref, p_trip_id, auth.uid(), p_contact_name, p_contact_email,
    p_contact_phone, v_seats, v_trip.price * v_seats, 'pending', p_notes,
    now() + make_interval(mins => greatest(p_hold_minutes, 5))
  )
  returning * into v_booking;

  for v_passenger in select * from jsonb_array_elements(coalesce(p_passengers, '[]'::jsonb))
  loop
    insert into public.booking_passengers (booking_id, full_name, seat_label, is_child)
    values (
      v_booking.id,
      nullif(trim(coalesce(v_passenger ->> 'full_name', '')), ''),
      v_passenger ->> 'seat_label',
      coalesce((v_passenger ->> 'is_child')::boolean, false)
    );
  end loop;

  return v_booking;
end;
$$;

revoke all on function public.book_trip(uuid, text, text, text, jsonb, integer, text, integer) from public;
grant execute on function public.book_trip(uuid, text, text, text, jsonb, integer, text, integer) to anon, authenticated;

-- The 7-argument signature from 0001 is superseded; drop it so PostgREST
-- doesn't have to disambiguate between two overloads.
drop function if exists public.book_trip(uuid, text, text, text, jsonb, integer, text);

-- ---------------------------------------------------------------------------
-- Hold release
-- ---------------------------------------------------------------------------
create or replace function public.release_expired_holds(p_trip_id uuid default null)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_released integer := 0;
  v_row      record;
begin
  for v_row in
    select id, trip_id, seat_count
      from public.bookings
     where status = 'pending'
       and hold_expires_at is not null
       and hold_expires_at < now()
       and (p_trip_id is null or trip_id = p_trip_id)
     for update skip locked
  loop
    update public.trips
       set seats_taken = greatest(seats_taken - v_row.seat_count, 0)
     where id = v_row.trip_id;

    update public.bookings
       set status = 'cancelled',
           hold_expires_at = null,
           notes = coalesce(notes || ' | ', '') || 'Rezervare expirată automat'
     where id = v_row.id;

    v_released := v_released + 1;
  end loop;

  return v_released;
end;
$$;

revoke all on function public.release_expired_holds(uuid) from public;
grant execute on function public.release_expired_holds(uuid) to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Payment confirmation — the seam a Stripe webhook plugs into
-- ---------------------------------------------------------------------------
create or replace function public.confirm_booking_payment(
  p_booking_ref  text,
  p_provider     text,
  p_reference    text default null,
  p_amount       integer default null
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings;
begin
  select * into v_booking
    from public.bookings
   where booking_ref = p_booking_ref
   for update;

  if not found then
    raise exception 'Rezervarea nu a fost găsită' using errcode = 'P0002';
  end if;

  -- Idempotent: webhooks are delivered at least once, so a repeat for the
  -- same booking must not double-charge or re-open a cancelled seat.
  if v_booking.payment_status = 'paid' then
    return v_booking;
  end if;

  if v_booking.status = 'cancelled' then
    raise exception 'Rezervarea a fost anulată' using errcode = '22023';
  end if;

  if p_amount is not null and p_amount <> v_booking.total_price then
    raise exception 'Suma plătită nu corespunde rezervării' using errcode = '22023';
  end if;

  update public.bookings
     set payment_status    = 'paid',
         status            = 'confirmed',
         payment_provider  = p_provider,
         payment_reference = coalesce(p_reference, payment_reference),
         paid_at           = now(),
         hold_expires_at   = null
   where id = v_booking.id
  returning * into v_booking;

  return v_booking;
end;
$$;

-- Only trusted server contexts may mark a booking paid.
revoke all on function public.confirm_booking_payment(text, text, text, integer) from public;
revoke all on function public.confirm_booking_payment(text, text, text, integer) from anon, authenticated;
grant execute on function public.confirm_booking_payment(text, text, text, integer) to service_role;

-- ---------------------------------------------------------------------------
-- Guest retrieval now returns the trip alongside the booking
-- ---------------------------------------------------------------------------
create or replace function public.get_booking_details(p_booking_ref text, p_contact_email text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'booking', to_jsonb(b),
    'trip', to_jsonb(t),
    'passengers', coalesce(
      (select jsonb_agg(to_jsonb(p) order by p.created_at)
         from public.booking_passengers p
        where p.booking_id = b.id),
      '[]'::jsonb
    )
  )
  from public.bookings b
  join public.trip_search t on t.id = b.trip_id
  where b.booking_ref = p_booking_ref
    and b.contact_email = p_contact_email::citext;
$$;

revoke all on function public.get_booking_details(text, text) from public;
grant execute on function public.get_booking_details(text, text) to anon, authenticated;
