-- ============================================================================
-- DANCA GO — seed data (real network, real fleet, 30 days of departures)
-- Idempotent: safe to re-run.
--
-- Seat counts, fares and durations are operational values. Confirm them
-- against the current timetable and the vehicle registration documents before
-- going live.
-- ============================================================================

insert into public.cities (slug, name, county, latitude, longitude, is_hub) values
  ('targu-neamt',  'Târgu Neamț',      'Neamț',      47.202500, 26.365800, false),
  ('piatra-neamt', 'Piatra Neamț',     'Neamț',      46.927500, 26.370280, false),
  ('roman',        'Roman',            'Neamț',      46.928330, 26.927500, true),
  ('bacau',        'Bacău',            'Bacău',      46.567810, 26.913870, false),
  ('onesti',       'Onești',           'Bacău',      46.248610, 26.766940, false),
  ('adjud',        'Adjud',            'Vrancea',    46.100000, 27.166670, false),
  ('focsani',      'Focșani',          'Vrancea',    45.696900, 27.183600, false),
  ('buzau',        'Buzău',            'Buzău',      45.150000, 26.833330, false),
  ('bucuresti',    'București',        'București',  44.426767, 26.102538, true),
  ('otopeni',      'Aeroport Otopeni', 'Ilfov',      44.572160, 26.102040, true),
  ('constanta',    'Constanța',        'Constanța',  44.179250, 28.634400, true)
on conflict (slug) do nothing;

-- The real fleet: one Setra touring coach, several Mercedes-Benz Sprinter
-- minibuses (smallest is a 12-seater) and a Mercedes-Benz Vito.
insert into public.vehicles (slug, name, class, seat_count, seat_layout, amenities, image_url, is_active) values
  ('setra-coach', 'Setra — autocar', 'coach', 49,
   '{"rows": 13, "columns": ["A", "B", "aisle", "C", "D"]}'::jsonb,
   array['Climatizare pe zone', 'Suspensie pneumatică', 'Scaune rabatabile', 'Cală de bagaje', 'Priză 220V'], '/fleet/setra.jpg', true),
  ('sprinter-20', 'Mercedes-Benz Sprinter 20', 'minibus', 20,
   '{"rows": 5, "columns": ["A", "B", "aisle", "C", "D"]}'::jsonb,
   array['Climatizare', 'Scaune individuale', 'Spațiu bagaje'], '/fleet/sprinter.jpg', true),
  ('sprinter-16', 'Mercedes-Benz Sprinter 16', 'minibus', 16,
   '{"rows": 4, "columns": ["A", "B", "aisle", "C", "D"]}'::jsonb,
   array['Climatizare', 'Scaune individuale', 'Spațiu bagaje'], '/fleet/sprinter.jpg', true),
  ('sprinter-12', 'Mercedes-Benz Sprinter 12', 'minibus', 12,
   '{"rows": 3, "columns": ["A", "B", "aisle", "C", "D"]}'::jsonb,
   array['Climatizare', 'Scaune individuale', 'Acces ușă la ușă'], '/fleet/sprinter.jpg', true),
  ('vito',        'Mercedes-Benz Vito', 'minibus', 8,
   '{"rows": 2, "columns": ["A", "B", "aisle", "C", "D"]}'::jsonb,
   array['Transfer aeroport', 'Climatizare', 'Rută flexibilă'], '/fleet/vito.jpg', true)
on conflict (slug) do nothing;

-- Routes are inserted in both directions from a compact definition list.
with pairs (slug, origin, dest, minutes, price, km) as (
  values
    ('targu-neamt-bucuresti',  'targu-neamt',  'bucuresti', 390, 14000, 380),
    ('targu-neamt-otopeni',    'targu-neamt',  'otopeni',   380, 14000, 370),
    ('piatra-neamt-bucuresti', 'piatra-neamt', 'bucuresti', 360, 13000, 350),
    ('piatra-neamt-otopeni',   'piatra-neamt', 'otopeni',   350, 13000, 340),
    ('roman-bucuresti',        'roman',        'bucuresti', 330, 12000, 330),
    ('roman-otopeni',          'roman',        'otopeni',   320, 12000, 320),
    ('roman-constanta',        'roman',        'constanta', 390, 15000, 400),
    ('bacau-bucuresti',        'bacau',        'bucuresti', 300, 11000, 300),
    ('bacau-otopeni',          'bacau',        'otopeni',   285, 11000, 290),
    ('adjud-bucuresti',        'adjud',        'bucuresti', 240,  9000, 240),
    ('focsani-bucuresti',      'focsani',      'bucuresti', 190,  8000, 190),
    ('buzau-bucuresti',        'buzau',        'bucuresti', 110,  6000, 110)
)
insert into public.routes (slug, origin_city_id, dest_city_id, duration_minutes, base_price, distance_km)
select
  case when d.reversed then p.dest || '-' || p.origin else p.slug end,
  case when d.reversed then c2.id else c1.id end,
  case when d.reversed then c1.id else c2.id end,
  p.minutes,
  p.price,
  p.km
from pairs p
  cross join (values (false), (true)) as d(reversed)
  join public.cities c1 on c1.slug = p.origin
  join public.cities c2 on c2.slug = p.dest
on conflict (slug) do nothing;

-- 30 days of scheduled departures: two per route per day (morning + evening).
-- Long corridors get the Setra; shorter regional runs get a Sprinter.
insert into public.trips (route_id, vehicle_id, departure_date, departure_time, arrival_time, price, seats_total)
select
  r.id,
  v.id,
  (current_date + offs)::date,
  slot.dep,
  (slot.dep + make_interval(mins => r.duration_minutes))::time,
  r.base_price,
  v.seat_count
from public.routes r
  cross join generate_series(0, 29) as offs
  cross join (values (time '06:30'), (time '16:30')) as slot(dep)
  join public.vehicles v on v.slug = case
    when r.duration_minutes >= 350 then 'setra-coach'
    when r.duration_minutes >= 240 then 'sprinter-20'
    else 'sprinter-16'
  end
where r.is_active
on conflict (route_id, departure_date, departure_time) do nothing;

-- Regional pickup points along the Moldova → București corridor.
insert into public.route_stops (route_id, city_id, position, minutes_from_start, location_name)
select r.id, c.id, s.position, s.minutes, s.location_name
from public.routes r
  cross join (values
    ('adjud',   0, 90,  'Adjud — stație centrală'),
    ('focsani', 1, 135, 'Focșani — autogară'),
    ('buzau',   2, 210, 'Buzău — ieșire DN2')
  ) as s(city_slug, position, minutes, location_name)
  join public.cities c on c.slug = s.city_slug
where r.slug in ('roman-bucuresti', 'bacau-bucuresti', 'piatra-neamt-bucuresti', 'targu-neamt-bucuresti')
on conflict (route_id, position) do nothing;
