-- ============================================================================
-- DANCA GO — seed data (real network, fleet and 30 days of departures)
-- Idempotent: safe to re-run.
-- ============================================================================

insert into public.cities (slug, name, county, latitude, longitude, is_hub) values
  ('otopeni',      'Aeroport Otopeni', 'Ilfov',      44.572160, 26.102040, true),
  ('bucuresti',    'București',        'București',  44.426767, 26.102538, true),
  ('bacau',        'Bacău',            'Bacău',      46.567810, 26.913870, true),
  ('roman',        'Roman',            'Neamț',      46.928330, 26.927500, false),
  ('piatra-neamt', 'Piatra Neamț',     'Neamț',      46.927500, 26.370280, false),
  ('adjud',        'Adjud',            'Vrancea',    46.100000, 27.166670, false),
  ('constanta',    'Constanța',        'Constanța',  44.179250, 28.634400, true),
  ('onesti',       'Onești',           'Bacău',      46.248610, 26.766940, false),
  ('buzau',        'Buzău',            'Buzău',      45.150000, 26.833330, false)
on conflict (slug) do nothing;

insert into public.vehicles (slug, name, class, seat_count, seat_layout, amenities, is_active) values
  ('autocar-57', 'Autocar 57 locuri', 'coach', 57,
   '{"rows": 15, "columns": ["A", "B", "aisle", "C", "D"]}'::jsonb,
   array['Wi-Fi', 'Climatizare pe zone', 'Toaletă', 'Priză 220V', 'USB-C', 'Suspensie pneumatică'], true),
  ('autocar-35', 'Autocar 35 locuri', 'coach', 35,
   '{"rows": 9, "columns": ["A", "B", "aisle", "C", "D"]}'::jsonb,
   array['Wi-Fi', 'Climatizare', 'Priză 220V', 'Scaune rabatabile'], true),
  ('microbuz-20', 'Microbuz 20 locuri', 'minibus', 20,
   '{"rows": 5, "columns": ["A", "B", "aisle", "C", "D"]}'::jsonb,
   array['Climatizare', 'Scaune piele', 'Transfer ușă la ușă'], true),
  ('microbuz-8', 'Microbuz 8 locuri', 'minibus', 8,
   '{"rows": 2, "columns": ["A", "B", "aisle", "C", "D"]}'::jsonb,
   array['Climatizare', 'Scaune piele', 'Transfer aeroport'], true)
on conflict (slug) do nothing;

-- Routes are inserted in both directions from a compact definition list.
with pairs (slug, origin, dest, minutes, price, km) as (
  values
    ('otopeni-bacau',        'otopeni',   'bacau',        320, 12000, 300),
    ('otopeni-roman',        'otopeni',   'roman',        380, 13500, 350),
    ('otopeni-piatra-neamt', 'otopeni',   'piatra-neamt', 420, 15000, 385),
    ('bucuresti-bacau',      'bucuresti', 'bacau',        300, 11000, 285),
    ('bucuresti-roman',      'bucuresti', 'roman',        360, 12500, 335),
    ('bucuresti-adjud',      'bucuresti', 'adjud',        255, 10000, 230),
    ('constanta-bacau',      'constanta', 'bacau',        390, 14000, 360),
    ('constanta-roman',      'constanta', 'roman',        450, 15500, 410)
)
insert into public.routes (slug, origin_city_id, dest_city_id, duration_minutes, base_price, distance_km)
select
  case when d.reversed then split_part(p.slug, '-', 2) || '-' || p.origin else p.slug end,
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
  cross join (values (time '07:00'), (time '17:30')) as slot(dep)
  join public.vehicles v on v.slug = case
    when r.duration_minutes >= 380 then 'autocar-57'
    else 'autocar-35'
  end
where r.is_active
on conflict (route_id, departure_date, departure_time) do nothing;

-- Add intermediate stops on the two longest corridors.
insert into public.route_stops (route_id, city_id, position, minutes_from_start, location_name)
select r.id, c.id, 0, 120, 'Ieșire A2 — parcare Peco'
from public.routes r
  join public.cities c on c.slug = 'buzau'
where r.slug in ('bucuresti-bacau', 'otopeni-bacau')
on conflict (route_id, position) do nothing;
