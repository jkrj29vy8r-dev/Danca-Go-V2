# Danca Go

Premium dark-mode website for **Danca Go** (Danca Util Ideal S.R.L.) — Romanian
passenger coach operator. Next.js 15 App Router, TypeScript, Tailwind v4,
React Three Fiber, Supabase.

---

## Getting started

```bash
npm install
cp .env.example .env.local     # fill in your Supabase keys
npm run dev
```

The marketing site renders fully without Supabase configured — data-backed
surfaces detect the missing env and show a designed fallback state instead of
crashing. Add the keys to enable search, booking and rental enquiries.

### Database

```bash
# Against a Supabase project (or `supabase db reset` locally)
psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql
psql "$DATABASE_URL" -f supabase/migrations/0002_payments_and_holds.sql
psql "$DATABASE_URL" -f supabase/migrations/0003_rental_requests.sql
psql "$DATABASE_URL" -f supabase/seed.sql          # optional demo data
```

Both migrations and the seed were applied to a real PostgreSQL 16 instance and
the booking functions exercised end to end — seat accounting, oversell
rejection, hold expiry, payment idempotency and privilege boundaries.

Regenerate types after any schema change:

```bash
npx supabase gen types typescript --project-id <id> > src/lib/types/database.ts
```

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |

---

## Architecture

```
src/
├── app/
│   ├── layout.tsx              Root layout: fonts, metadata, JSON-LD, chrome
│   ├── page.tsx                Homepage
│   ├── rezervare/              Search results → [tripId] checkout
│   ├── rute/ flota/ despre/ contact/
│   ├── inchirieri/             Coach hire + quote Server Action
│   └── experiente/             Custom day trips (shares the quote form)
├── components/
│   ├── ui/                     Design-system primitives (Button, Card, Eyebrow)
│   ├── layout/                 Navbar, Footer, PageHeader, Logo
│   ├── motion/                 Lenis + GSAP provider, reveal + scroll effects
│   ├── three/                  3D coach, studio rig, performance gate
│   ├── home/                   Homepage sections
│   ├── booking/ rentals/       Forms
├── lib/
│   ├── site.ts                 Company facts, navigation, routes, fleet
│   ├── schemas.ts              Zod schemas shared by client + Server Actions
│   ├── queries.ts              Server-only data access
│   ├── supabase/               Browser / server / middleware clients
│   └── types/database.ts       Schema mirror
└── middleware.ts               Auth session refresh
supabase/
├── migrations/0001_init.sql    Schema, functions, RLS
└── seed.sql                    Network, fleet, 30 days of departures
```

### Key decisions

**Design tokens live in CSS, not a JS config.** Tailwind v4's `@theme` block in
`globals.css` is the single source of truth for colour, type scale, easing and
spacing. Fluid `clamp()` display sizes mean no breakpoint-specific font rules.

**The 3D coach is procedural, not a GLB.** A photoreal coach model is a
15–40 MB download that would dominate LCP on the hero. The vehicle is built
from rounded primitives with clearcoat paint, lit by drei `<Lightformer>`
panels inside a locally-rendered `<Environment>` — no HDR file is fetched, so
there's no external request and no CSP exception. Swap in `useGLTF` later
without touching the scene rig.

**The 3D is gated three ways.** `CoachStage` code-splits the Three.js bundle,
mounts it only when the hero is near the viewport, and skips WebGL entirely on
`prefers-reduced-motion` or low-core/low-memory devices — falling back to a
vector silhouette. Three.js and the post-processing composer live in the lazy
chunk, so the homepage's First Load JS is unaffected by them.

**"Cinematic" and "60fps on mid-range" are in tension, so the scene ships two
grades.** `quality.ts` probes cores, memory, touch and the unmasked GPU string,
then returns a settings object. The `high` tier adds a bloom + vignette pass,
real shadows and DPR 2; `low` drops the composer and halves the environment
resolution; `none` renders no canvas at all. Probing errs conservative — being
wrong costs a plainer render, never a dropped frame budget.

### Using the scene elsewhere

`CoachScene` is prop-driven and has no hero-specific logic, so it can be reused
on fleet pages or in a configurator:

```tsx
<CoachScene
  autoRotate={0.055}        // turntable speed, rad/s (0 disables)
  scrollInfluence={0.8}     // extra yaw as the section scrolls past
  pointerInfluence={0.1}    // mouse parallax strength
  floatAmplitude={0.04}     // vertical drift, metres
  quality={detectQuality()} // or omit to let it probe
/>
```

Pose is composed from three independent sources. Auto-rotation accumulates as a
velocity, while scroll and pointer are absolute offsets applied on top — so
scrolling back up returns to the same relative pose instead of fighting the
turntable. Frame deltas are clamped to 1/30s so a backgrounded tab doesn't
produce a visible jump on return.

**The camera solves its own framing.** `CameraTarget` derives distance from the
canvas aspect ratio so the coach stays fully in frame from a wide desktop band
to a narrow phone, instead of relying on hardcoded positions.

**Paint reads as metal because of what it reflects.** The body uses a clearcoat
material over a non-black basecoat, and the environment is built from long
horizontal `<Lightformer>` strips — the same trick as real automotive
photography, where a softbox strip is dragged down the flank. Clearcoat with
nothing to reflect just looks like plastic.

**A reflective floor was built and cut.** `MeshReflectorMaterial` read as a
hard-edged grey stage rather than wet asphalt, and its per-frame blur was
measurably the most expensive thing in the scene — screenshot capture went from
seconds to timing out. `ContactShadows` grounds the vehicle for a fraction of
the cost.

**The gradient dome belongs inside `<Environment>`, not the scene.** Reflections
come from the environment's cube map, so a dome placed in the scene graph
contributes nothing to them and simply paints an opaque box over the
transparent canvas. As an `<Environment>` child it shapes the reflections in
the gaps between lightformer strips while staying invisible to the camera.

**Hero entrances are CSS, not Framer Motion.** The headline is the LCP element;
driving it with JS would ship it as `opacity: 0` in the SSR HTML and delay
paint until hydration. Below the fold, `Reveal`/`RevealGroup` use Framer Motion
`whileInView` where that trade-off doesn't apply.

**Two animation systems, split by job.** Framer Motion owns discrete entrances
(a card fades in once and is done). GSAP ScrollTrigger owns anything that must
stay *linked* to scroll position across distance — parallax, scale-through,
line-by-line reveals. ScrollTrigger reads from Lenis via the shared ticker, so
the two never fight over scroll position. Scrubbed tweens keep a high opacity
floor: a jump-scroll can leave a scrub mid-state, and no conversion CTA should
ever be sitting at 15% opacity when the user lands on it.

**Timing is the brand.** Entrances run on a single `cubic-bezier(0.16, 1, 0.3,
1)` at ~1.1s with 0.055s stagger. The slowness is deliberate — the 0.3s/0.02s
defaults most sites use read as a page finishing loading, not as design.

**The search widget is docked, not floating.** In the hero it renders as a
full-bleed bar with fields divided by hairlines, so it reads as page
architecture the coach is standing on rather than a card that happened to land
over the artwork. The same component renders as a raised card on `/rezervare`
via a `variant` prop.

### Booking flow

Search (`/rezervare`) → checkout (`/rezervare/[tripId]`) → retrieval
(`/rezervare/bilet`). Checkout is three steps — passengers, review,
confirmation — held in a single client component with one form. Splitting it
across routes would mean a server round-trip per step or stashing
half-finished passenger data somewhere; keeping it local makes Back free and
writes nothing until the customer confirms.

**Seats are held, not hoarded.** A `pending` booking used to hold its seats
forever, so an abandoned checkout permanently removed inventory.
`book_trip` now stamps `hold_expires_at` (30 min) and calls
`release_expired_holds()` before checking availability, so seats freed a
second ago are immediately sellable. Paid bookings are never released.

**Payments are seamed, not stubbed.** `lib/payments.ts` defines the gateway
interface and today returns the pay-on-boarding implementation. The database
side is already Stripe-shaped: amounts are integers in bani (exactly Stripe's
`amount`), `currency` defaults to RON, `payment_reference` is uniquely indexed
for a PaymentIntent id, and `confirm_booking_payment()` is idempotent and
granted to `service_role` alone — a webhook replay cannot double-confirm.

**Both quote pages share one form and one table.** `/inchirieri` and
`/experiente` ask the same operational questions — when, from where, how many —
so they share `RentalForm` and the `rentals` table. A `kind` column records
which page produced the row and drives the labels, so staff opening a request
know whether it's a coach hire or a day trip without reading the message.

**Seat inventory is enforced in Postgres.** `book_trip()` locks the trip row,
validates availability, decrements inventory and writes the booking in one
transaction. Clients have no INSERT policy on `bookings` and no UPDATE policy
on `trips`, so overselling is impossible even under concurrent purchases —
there is no code path that mutates one without the other.

**Guest checkout without leaking data.** Bookings are readable via RLS only by
their owner or staff. Guests (no `user_id`) retrieve theirs through
`get_booking_by_ref(ref, email)`, a `SECURITY DEFINER` function where the
reference plus email acts as the shared secret.

**Validation is defined once, enforced twice.** Zod schemas in `lib/schemas.ts`
back both the client form (immediate feedback) and the Server Action (the
actual trust boundary).

---

## Data model

| Table | Purpose |
| --- | --- |
| `profiles` | App user data, mirrored from `auth.users`; carries `role` |
| `cities` | Network nodes |
| `routes` / `route_stops` | Directional city pairs and intermediate stops |
| `vehicles` | Fleet, seat counts and layouts |
| `trips` | Dated, sellable instance of a route; owns seat inventory |
| `bookings` / `booking_passengers` | Sales |
| `rentals` | Charter enquiries |

`trip_search` is a `security_invoker` view joining trips → routes → cities →
vehicles, so the booking UI stays thin and RLS still applies.

Money is stored in **bani** (integer minor units) everywhere. Never floats.

---

## Positioning

Danca Go is a premium passenger **transport** operator, not a travel agency.
It sells three things: scheduled intercity seats, coaches and minibuses with a
driver (from 12 seats up), and transport for custom day trips on request.

Copy must stay on transport, vehicles and drivers — never packages,
accommodation or itineraries sold as holidays. The rule is restated at the top
of `lib/site.ts`, which is where all marketing copy originates.

## Data to confirm before launch

The company facts in `lib/site.ts` and `supabase/seed.sql` are real; a few
operational values are reasoned placeholders and should be checked:

- **Seat counts** per vehicle (the Setra is seeded at 49, Sprinters at 12/16/20)
- **Fares** and **journey durations** on every route
- **Departure times** — seeded as 06:30 and 16:30 daily
- **Rating distribution** in `ratingBreakdown` (the 4.6 average is real, the
  per-star split is modelled)

## Fleet photography

Real photography lives in `/public/fleet`, processed to 16:10 at 1600×1000
(~160–250 KB each) plus an 800×500 variant. `VehiclePhoto` renders the primary
shot and `VehicleGallery` adds the rest; a vehicle with no `image` still
renders correctly via a designed placeholder.

Two rules learned the hard way:

- **Gallery tiles must match the processed crop's aspect (16:10).** A different
  aspect lets `object-cover` re-crop an already-framed photo — 4:3 tiles pushed
  the coach interiors up into the ceiling.
- **`sharp.strategy.attention` is not reliable for vehicles.** It framed the
  Vito on the trees and sky behind it. Crops are verified visually, and the
  Vito uses an explicit offset.

## Notes

- Primary language is Romanian, including error messages raised from Postgres.
- shadcn/ui is wired up (`components.json`, Radix primitives, `cn`) with the
  canonical `cva` + `Slot` + `asChild` Button. shadcn is copy-in source rather
  than a dependency, so the files live in `components/ui` and carry the Danca
  Go variants instead of the stock ones.
- `npm audit` reports advisories in `postcss` and `sharp`; both are transitive
  dependencies of `next` and resolve with an upstream Next.js release.
