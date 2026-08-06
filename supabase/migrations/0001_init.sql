-- ============================================================================
-- DANCA GO — core schema
--
-- Design notes:
--  * All money is stored in BANI (integer minor units). Never floats.
--  * Public marketing/booking surfaces read `cities`, `routes`, `vehicles`,
--    `trips` anonymously; everything containing personal data is locked down.
--  * Seat inventory is authoritative in `trips.seats_taken`, mutated ONLY by
--    `book_trip()` under a row lock. Clients never UPDATE trips directly.
--  * Guest checkout is supported: a booking may have user_id = NULL and is
--    retrieved via (booking_ref, email) through a SECURITY DEFINER function.
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type user_role as enum ('customer', 'staff', 'admin');
create type vehicle_class as enum ('coach', 'minibus');
create type trip_status as enum ('scheduled', 'boarding', 'departed', 'arrived', 'cancelled');
create type booking_status as enum ('pending', 'confirmed', 'cancelled', 'refunded', 'completed');
create type payment_status as enum ('unpaid', 'paid', 'refunded', 'failed');
create type rental_status as enum ('new', 'contacted', 'quoted', 'won', 'lost');

-- ---------------------------------------------------------------------------
-- profiles — 1:1 with auth.users
-- ---------------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  full_name    text,
  phone        text,
  email        citext,
  role         user_role   not null default 'customer',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.profiles is 'Application-level user data mirrored from auth.users.';

-- Helper used by RLS policies. SECURITY DEFINER so policies can read the role
-- without recursing back through profiles' own RLS.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('staff', 'admin')
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    nullif(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- cities
-- ---------------------------------------------------------------------------
create table public.cities (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       text not null,
  county     text,
  latitude   numeric(9, 6),
  longitude  numeric(9, 6),
  is_hub     boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- vehicles — the fleet
-- ---------------------------------------------------------------------------
create table public.vehicles (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  name           text not null,
  class          vehicle_class not null,
  seat_count     integer not null check (seat_count between 4 and 90),
  -- Seat map layout: {"rows": 15, "columns": ["A","B","aisle","C","D"]}
  seat_layout    jsonb not null default '{}'::jsonb,
  plate_number   text unique,
  amenities      text[] not null default '{}',
  image_url      text,
  model_url      text,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- routes — a directional city pair sold as a product
-- ---------------------------------------------------------------------------
create table public.routes (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  origin_city_id   uuid not null references public.cities (id) on delete restrict,
  dest_city_id     uuid not null references public.cities (id) on delete restrict,
  duration_minutes integer not null check (duration_minutes > 0),
  base_price       integer not null check (base_price >= 0), -- bani
  distance_km      integer check (distance_km > 0),
  description      text,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  constraint routes_distinct_endpoints check (origin_city_id <> dest_city_id)
);

create index routes_origin_dest_idx on public.routes (origin_city_id, dest_city_id) where is_active;

-- Intermediate pickup/drop-off points, ordered along the route.
create table public.route_stops (
  id                uuid primary key default gen_random_uuid(),
  route_id          uuid not null references public.routes (id) on delete cascade,
  city_id           uuid not null references public.cities (id) on delete restrict,
  position          integer not null check (position >= 0),
  minutes_from_start integer not null check (minutes_from_start >= 0),
  location_name     text,
  unique (route_id, position)
);

-- ---------------------------------------------------------------------------
-- trips — a dated, sellable instance of a route
-- ---------------------------------------------------------------------------
create table public.trips (
  id             uuid primary key default gen_random_uuid(),
  route_id       uuid not null references public.routes (id) on delete restrict,
  vehicle_id     uuid references public.vehicles (id) on delete set null,
  departure_date date not null,
  departure_time time not null,
  arrival_time   time not null,
  price          integer not null check (price >= 0), -- bani, overrides route.base_price
  seats_total    integer not null check (seats_total > 0),
  seats_taken    integer not null default 0 check (seats_taken >= 0),
  status         trip_status not null default 'scheduled',
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint trips_no_oversell check (seats_taken <= seats_total),
  unique (route_id, departure_date, departure_time)
);

create index trips_search_idx on public.trips (departure_date, route_id) where status = 'scheduled';

-- Convenience view for search results (kept in SQL so clients stay thin).
create view public.trip_search as
select
  t.id,
  t.departure_date,
  t.departure_time,
  t.arrival_time,
  t.price,
  t.seats_total,
  t.seats_taken,
  (t.seats_total - t.seats_taken) as seats_available,
  t.status,
  r.id   as route_id,
  r.slug as route_slug,
  r.duration_minutes,
  o.name as origin_name,
  o.slug as origin_slug,
  d.name as dest_name,
  d.slug as dest_slug,
  v.name as vehicle_name,
  v.class as vehicle_class,
  v.amenities
from public.trips t
  join public.routes r on r.id = t.route_id
  join public.cities o on o.id = r.origin_city_id
  join public.cities d on d.id = r.dest_city_id
  left join public.vehicles v on v.id = t.vehicle_id
where t.status = 'scheduled' and r.is_active;

-- Views execute with the caller's permissions, so `trips` RLS still applies.
alter view public.trip_search set (security_invoker = on);

-- ---------------------------------------------------------------------------
-- bookings
-- ---------------------------------------------------------------------------
create table public.bookings (
  id             uuid primary key default gen_random_uuid(),
  booking_ref    text unique not null,
  trip_id        uuid not null references public.trips (id) on delete restrict,
  user_id        uuid references public.profiles (id) on delete set null,
  contact_name   text not null,
  contact_email  citext not null,
  contact_phone  text not null,
  seat_count     integer not null check (seat_count between 1 and 20),
  total_price    integer not null check (total_price >= 0), -- bani
  status         booking_status not null default 'pending',
  payment_status payment_status not null default 'unpaid',
  pickup_stop_id uuid references public.route_stops (id) on delete set null,
  dropoff_stop_id uuid references public.route_stops (id) on delete set null,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index bookings_user_idx on public.bookings (user_id, created_at desc);
create index bookings_trip_idx on public.bookings (trip_id);
create index bookings_lookup_idx on public.bookings (booking_ref, contact_email);

create table public.booking_passengers (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references public.bookings (id) on delete cascade,
  full_name   text not null,
  seat_label  text,
  is_child    boolean not null default false,
  created_at  timestamptz not null default now()
);

create index booking_passengers_booking_idx on public.booking_passengers (booking_id);

-- ---------------------------------------------------------------------------
-- rentals — charter / private hire enquiries
-- ---------------------------------------------------------------------------
create table public.rentals (
  id              uuid primary key default gen_random_uuid(),
  reference       text unique not null,
  user_id         uuid references public.profiles (id) on delete set null,
  contact_name    text not null,
  contact_email   citext not null,
  contact_phone   text not null,
  company_name    text,
  origin          text not null,
  destination     text not null,
  start_date      date not null,
  end_date        date,
  passenger_count integer not null check (passenger_count > 0),
  vehicle_class   vehicle_class,
  message         text,
  status          rental_status not null default 'new',
  quoted_price    integer check (quoted_price >= 0),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint rentals_date_order check (end_date is null or end_date >= start_date)
);

create index rentals_status_idx on public.rentals (status, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch  before update on public.profiles for each row execute function public.touch_updated_at();
create trigger trips_touch     before update on public.trips    for each row execute function public.touch_updated_at();
create trigger bookings_touch  before update on public.bookings for each row execute function public.touch_updated_at();
create trigger rentals_touch   before update on public.rentals  for each row execute function public.touch_updated_at();

-- ============================================================================
-- BOOKING TRANSACTION
-- Atomically reserves seats and creates the booking. Locks the trip row so two
-- concurrent buyers can never push seats_taken past seats_total.
-- ============================================================================
create or replace function public.book_trip(
  p_trip_id       uuid,
  p_contact_name  text,
  p_contact_email text,
  p_contact_phone text,
  p_passengers    jsonb default '[]'::jsonb,
  p_seat_count    integer default 1,
  p_notes         text default null
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trip     public.trips;
  v_booking  public.bookings;
  v_ref      text;
  v_seats    integer := greatest(p_seat_count, jsonb_array_length(coalesce(p_passengers, '[]'::jsonb)));
  v_passenger jsonb;
  i          integer;
begin
  if v_seats < 1 or v_seats > 20 then
    raise exception 'Numărul de locuri trebuie să fie între 1 și 20' using errcode = '22023';
  end if;

  if p_contact_email is null or p_contact_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Adresă de email invalidă' using errcode = '22023';
  end if;

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
    contact_phone, seat_count, total_price, status, notes
  )
  values (
    v_ref, p_trip_id, auth.uid(), p_contact_name, p_contact_email,
    p_contact_phone, v_seats, v_trip.price * v_seats, 'pending', p_notes
  )
  returning * into v_booking;

  for v_passenger in select * from jsonb_array_elements(coalesce(p_passengers, '[]'::jsonb))
  loop
    insert into public.booking_passengers (booking_id, full_name, seat_label, is_child)
    values (
      v_booking.id,
      coalesce(v_passenger ->> 'full_name', p_contact_name),
      v_passenger ->> 'seat_label',
      coalesce((v_passenger ->> 'is_child')::boolean, false)
    );
  end loop;

  return v_booking;
end;
$$;

revoke all on function public.book_trip(uuid, text, text, text, jsonb, integer, text) from public;
grant execute on function public.book_trip(uuid, text, text, text, jsonb, integer, text) to anon, authenticated;

-- Cancelling releases the seats back into inventory.
create or replace function public.cancel_booking(p_booking_ref text, p_contact_email text)
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
     and contact_email = p_contact_email::citext
   for update;

  if not found then
    raise exception 'Rezervarea nu a fost găsită' using errcode = 'P0002';
  end if;

  if v_booking.status = 'cancelled' then
    return v_booking;
  end if;

  if v_booking.status not in ('pending', 'confirmed') then
    raise exception 'Rezervarea nu mai poate fi anulată' using errcode = '22023';
  end if;

  update public.trips
     set seats_taken = greatest(seats_taken - v_booking.seat_count, 0)
   where id = v_booking.trip_id;

  update public.bookings
     set status = 'cancelled'
   where id = v_booking.id
  returning * into v_booking;

  return v_booking;
end;
$$;

revoke all on function public.cancel_booking(text, text) from public;
grant execute on function public.cancel_booking(text, text) to anon, authenticated;

-- Guest retrieval: ref + email acts as the shared secret.
create or replace function public.get_booking_by_ref(p_booking_ref text, p_contact_email text)
returns setof public.bookings
language sql
stable
security definer
set search_path = public
as $$
  select * from public.bookings
   where booking_ref = p_booking_ref
     and contact_email = p_contact_email::citext;
$$;

revoke all on function public.get_booking_by_ref(text, text) from public;
grant execute on function public.get_booking_by_ref(text, text) to anon, authenticated;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.profiles           enable row level security;
alter table public.cities             enable row level security;
alter table public.vehicles           enable row level security;
alter table public.routes             enable row level security;
alter table public.route_stops        enable row level security;
alter table public.trips              enable row level security;
alter table public.bookings           enable row level security;
alter table public.booking_passengers enable row level security;
alter table public.rentals            enable row level security;

-- --- Public catalogue: readable by everyone, writable by staff only ---------
create policy "cities are public"        on public.cities      for select using (true);
create policy "vehicles are public"      on public.vehicles    for select using (is_active or public.is_staff());
create policy "routes are public"        on public.routes      for select using (is_active or public.is_staff());
create policy "route stops are public"   on public.route_stops for select using (true);
create policy "trips are public"         on public.trips       for select using (true);

create policy "staff manage cities"      on public.cities      for all using (public.is_staff()) with check (public.is_staff());
create policy "staff manage vehicles"    on public.vehicles    for all using (public.is_staff()) with check (public.is_staff());
create policy "staff manage routes"      on public.routes      for all using (public.is_staff()) with check (public.is_staff());
create policy "staff manage route stops" on public.route_stops for all using (public.is_staff()) with check (public.is_staff());
create policy "staff manage trips"       on public.trips       for all using (public.is_staff()) with check (public.is_staff());

-- --- profiles ---------------------------------------------------------------
create policy "read own profile" on public.profiles
  for select using (auth.uid() = id or public.is_staff());

create policy "update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "staff manage profiles" on public.profiles
  for all using (public.is_staff()) with check (public.is_staff());

-- --- bookings ---------------------------------------------------------------
-- No anon SELECT: guests read their booking through get_booking_by_ref().
-- No client INSERT either — book_trip() is the only write path, so seat
-- inventory can never drift from the bookings table.
create policy "read own bookings" on public.bookings
  for select using (auth.uid() is not null and (user_id = auth.uid() or public.is_staff()));

create policy "staff manage bookings" on public.bookings
  for all using (public.is_staff()) with check (public.is_staff());

create policy "read own booking passengers" on public.booking_passengers
  for select using (
    public.is_staff() or exists (
      select 1 from public.bookings b
       where b.id = booking_passengers.booking_id
         and b.user_id = auth.uid()
    )
  );

create policy "staff manage booking passengers" on public.booking_passengers
  for all using (public.is_staff()) with check (public.is_staff());

-- --- rentals ----------------------------------------------------------------
-- Anyone may submit an enquiry; only the author (if signed in) or staff may read.
create policy "anyone can request a rental" on public.rentals
  for insert with check (
    user_id is null or user_id = auth.uid()
  );

create policy "read own rentals" on public.rentals
  for select using (auth.uid() is not null and (user_id = auth.uid() or public.is_staff()));

create policy "staff manage rentals" on public.rentals
  for all using (public.is_staff()) with check (public.is_staff());

-- --- Grants -----------------------------------------------------------------
-- RLS is the gate; these keep the default privilege surface tight.
revoke all on public.bookings from anon;
revoke all on public.booking_passengers from anon;
revoke all on public.profiles from anon;
grant select on public.trip_search to anon, authenticated;

-- Realtime: staff dashboards and live seat counters subscribe to these.
alter publication supabase_realtime add table public.trips;
alter publication supabase_realtime add table public.bookings;
