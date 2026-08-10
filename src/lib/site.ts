/**
 * Single source of truth for company facts, navigation and static route data.
 * Marketing pages read from here; the booking engine reads from Supabase.
 *
 * POSITIONING — read before editing copy:
 * Danca Go is a premium passenger *transport* operator. It runs scheduled
 * intercity routes, rents coaches and minibuses (from 12 seats up), and
 * arranges custom day trips on request. It is NOT a travel agency: no
 * packages, no accommodation, no itineraries sold as holidays. Copy should
 * stay on transport, vehicles and the people driving them.
 */

export const site = {
  name: "Danca Go",
  legalName: "Danca Util Ideal S.R.L.",
  tagline: "Transport premium de pasageri.",
  description:
    "Curse regulate între Moldova, București, Otopeni și Constanța. Închirieri de autocare și microbuze de la 12 locuri și experiențe personalizate, la cerere.",
  url: "https://dancago.ro",
  locale: "ro-RO",
  rating: { score: 4.6, max: 5, count: 1800 },
  founded: 2019,
  phones: ["+40725819224", "+40775621669"],
  email: "dancautilideal@gmail.com",
  address: {
    city: "Roman",
    county: "Neamț",
    country: "România",
  },
} as const;

/**
 * Registration details the law requires a trader to publish (OUG 34/2014 and
 * Legea 365/2002 for distance selling; Regulamentul (UE) 2016/679 for the data
 * controller identity).
 *
 * These are deliberately `null` until someone reads them off the company's own
 * documents. A plausible-looking invented CUI on a live site is worse than a
 * visible gap, so the legal pages render an explicit "de completat" marker
 * instead of a number nobody verified.
 */
export const legalEntity: {
  name: string;
  cui: string | null;
  regCom: string | null;
  /** Full registered address, as it appears on the certificate. */
  address: string | null;
  /** ARR transport licence number. */
  licence: string | null;
} = {
  name: site.legalName,
  cui: null,
  regCom: null,
  address: null,
  licence: null,
};

export const phoneDisplay = (phone: string) =>
  phone.replace(/^(\+40)(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");

/** 1800 → "1.800" (Romanian thousands separator). */
export const formatCount = (value: number) => value.toLocaleString("ro-RO");

/* -------------------------------------------------------------------------- */
/*                                 NAVIGATION                                  */
/* -------------------------------------------------------------------------- */

export const navigation = [
  { label: "Rute", href: "/rute" },
  { label: "Flota", href: "/flota" },
  { label: "Închirieri", href: "/inchirieri" },
  { label: "Experiențe", href: "/experiente" },
  { label: "Despre noi", href: "/despre" },
  { label: "Contact", href: "/contact" },
] as const;

export const footerNav = [
  {
    title: "Curse",
    links: [
      { label: "Toate rutele", href: "/rute" },
      { label: "Târgu Neamț — București", href: "/rute/targu-neamt-bucuresti" },
      { label: "Piatra Neamț — Otopeni", href: "/rute/piatra-neamt-otopeni" },
      { label: "Roman — Constanța", href: "/rute/roman-constanta" },
      { label: "Rezervă un bilet", href: "/rezervare" },
      { label: "Găsește-ți rezervarea", href: "/rezervare/bilet" },
    ],
  },
  {
    title: "Servicii",
    links: [
      { label: "Flota noastră", href: "/flota" },
      { label: "Închirieri autocare", href: "/inchirieri" },
      { label: "Închirieri microbuze", href: "/inchirieri" },
      { label: "Transfer aeroport", href: "/servicii/transfer-aeroport" },
      { label: "Experiențe la cerere", href: "/experiente" },
    ],
  },
  {
    title: "Companie",
    links: [
      { label: "Despre noi", href: "/despre" },
      { label: "Contact", href: "/contact" },
      { label: "Întrebări frecvente", href: "/faq" },
      { label: "Cariere", href: "/cariere" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Termeni și condiții", href: "/legal/termeni" },
      { label: "Politica de confidențialitate", href: "/legal/confidentialitate" },
      { label: "Politica de cookies", href: "/legal/cookies" },
      { label: "ANPC — SOL", href: "https://ec.europa.eu/consumers/odr", external: true },
    ],
  },
] as const;

/* -------------------------------------------------------------------------- */
/*                                   ROUTES                                    */
/* -------------------------------------------------------------------------- */

export type RouteHub = "bucuresti" | "otopeni" | "constanta";

export type FeaturedRoute = {
  slug: string;
  from: string;
  to: string;
  durationMinutes: number;
  fromPrice: number; // bani
  frequency: string;
  hub: RouteHub;
};

/**
 * The scheduled network. Durations and fares are operational values — confirm
 * against the current timetable before launch.
 */
export const featuredRoutes: FeaturedRoute[] = [
  {
    slug: "targu-neamt-bucuresti",
    from: "Târgu Neamț",
    to: "București",
    durationMinutes: 390,
    fromPrice: 14000,
    frequency: "Zilnic",
    hub: "bucuresti",
  },
  {
    slug: "piatra-neamt-bucuresti",
    from: "Piatra Neamț",
    to: "București",
    durationMinutes: 360,
    fromPrice: 13000,
    frequency: "Zilnic",
    hub: "bucuresti",
  },
  {
    slug: "roman-bucuresti",
    from: "Roman",
    to: "București",
    durationMinutes: 330,
    fromPrice: 12000,
    frequency: "Zilnic",
    hub: "bucuresti",
  },
  {
    slug: "bacau-bucuresti",
    from: "Bacău",
    to: "București",
    durationMinutes: 300,
    fromPrice: 11000,
    frequency: "Zilnic",
    hub: "bucuresti",
  },
  {
    slug: "targu-neamt-otopeni",
    from: "Târgu Neamț",
    to: "Aeroport Otopeni",
    durationMinutes: 380,
    fromPrice: 14000,
    frequency: "Zilnic",
    hub: "otopeni",
  },
  {
    slug: "piatra-neamt-otopeni",
    from: "Piatra Neamț",
    to: "Aeroport Otopeni",
    durationMinutes: 350,
    fromPrice: 13000,
    frequency: "Zilnic",
    hub: "otopeni",
  },
  {
    slug: "roman-otopeni",
    from: "Roman",
    to: "Aeroport Otopeni",
    durationMinutes: 320,
    fromPrice: 12000,
    frequency: "Zilnic",
    hub: "otopeni",
  },
  {
    slug: "bacau-otopeni",
    from: "Bacău",
    to: "Aeroport Otopeni",
    durationMinutes: 285,
    fromPrice: 11000,
    frequency: "Zilnic",
    hub: "otopeni",
  },
  {
    slug: "roman-constanta",
    from: "Roman",
    to: "Constanța",
    durationMinutes: 390,
    fromPrice: 15000,
    frequency: "Zilnic",
    hub: "constanta",
  },
];

/** Regional pickup points served along the main corridors. */
export const regionalStops = ["Adjud", "Focșani", "Buzău", "Onești"] as const;

/**
 * The main north–south corridor, in travel order. Every scheduled route runs
 * along it before branching to its hub, so a route's intermediate stops are
 * simply the entries that come after its origin.
 *
 * Onești sits on a branch rather than on this line, so it is offered as a
 * pickup point on request instead of being listed as a stop on every route.
 */
export const corridor = [
  "Târgu Neamț",
  "Piatra Neamț",
  "Roman",
  "Bacău",
  "Adjud",
  "Focșani",
  "Buzău",
] as const;

export function getRoute(slug: string): FeaturedRoute | undefined {
  return featuredRoutes.find((route) => route.slug === slug);
}

/** Corridor towns the vehicle passes through between origin and destination. */
export function intermediateStops(route: FeaturedRoute): string[] {
  const start = corridor.indexOf(route.from as (typeof corridor)[number]);
  if (start === -1) return [];
  return corridor.slice(start + 1);
}

/** Cities served, for the marquee and the network list. */
export const cities = [
  "Târgu Neamț",
  "Piatra Neamț",
  "Roman",
  "Bacău",
  "Adjud",
  "Focșani",
  "Buzău",
  "București",
  "Otopeni",
  "Constanța",
] as const;

/** Origin options offered by the search widget, in network order. */
export const searchOrigins = [
  "Târgu Neamț",
  "Piatra Neamț",
  "Roman",
  "Bacău",
  "Adjud",
  "Focșani",
  "Buzău",
  "București",
  "Aeroport Otopeni",
  "Constanța",
] as const;

/* -------------------------------------------------------------------------- */
/*                                    FLEET                                    */
/* -------------------------------------------------------------------------- */

export type FleetClass = {
  slug: string;
  name: string;
  seats: string;
  headline: string;
  description: string;
  specs: { label: string; value: string }[];
  features: string[];
  /** Primary photo. Absent → VehiclePhoto renders its placeholder. */
  image?: string;
  /** Additional real photography for the fleet page gallery. */
  gallery?: { src: string; alt: string }[];
};

/**
 * The actual fleet: one Setra touring coach, several Mercedes-Benz Sprinter
 * minibuses (the smallest is a 12-seater) and a Mercedes-Benz Vito.
 *
 * Seat counts marked in `specs` should be confirmed against the vehicle
 * registration documents before launch.
 */
export const fleet: FleetClass[] = [
  {
    slug: "setra",
    name: "Setra",
    seats: "Autocar de mare capacitate",
    headline: "Autocarul. Pentru grupuri care nu fac rabat.",
    description:
      "Setra este vârful flotei noastre: un autocar de linie lungă construit în jurul confortului pe distanțe mari. Suspensie pneumatică, climatizare pe zone și spațiu real pentru picioare pe fiecare rând.",
    specs: [
      { label: "Model", value: "S 517 HD" },
      { label: "Producător", value: "Setra" },
      { label: "Utilizare", value: "Curse lungi & grupuri" },
      { label: "Bagaje", value: "Cală generoasă" },
    ],
    features: [
      "Climatizare pe zone",
      "Suspensie pneumatică",
      "Scaune rabatabile",
      "Cală de bagaje",
      "Priză 220V",
    ],
    image: "/fleet/setra.jpg",
    gallery: [
      { src: "/fleet/setra-interior.jpg", alt: "Interiorul autocarului Setra, culoar central și scaune din piele" },
      { src: "/fleet/setra-interior-2.jpg", alt: "Scaunele autocarului Setra văzute dinspre spate, cu măsuțe rabatabile" },
    ],
  },
  {
    slug: "sprinter",
    name: "Mercedes-Benz Sprinter",
    seats: "de la 12 locuri",
    headline: "Microbuzul care ajunge oriunde.",
    description:
      "Mai multe Sprintere, de la 12 locuri în sus. Suficient de spațioase pentru un grup întreg, suficient de agile pentru drumuri de munte și străzi înguste. Coloana vertebrală a curselor noastre zilnice.",
    specs: [
      { label: "Model", value: "Sprinter 517 CDI" },
      { label: "Producător", value: "Mercedes-Benz" },
      { label: "Capacitate", value: "De la 12 locuri" },
      { label: "Utilizare", value: "Curse regulate & transfer" },
    ],
    features: ["Climatizare", "Scaune individuale", "Spațiu bagaje", "Acces ușă la ușă"],
    image: "/fleet/sprinter-white.jpg",
    gallery: [
      { src: "/fleet/sprinter.jpg", alt: "Microbuz Mercedes-Benz Sprinter gri, văzut din lateral față" },
      { src: "/fleet/sprinter-rear.jpg", alt: "Microbuzul Mercedes-Benz Sprinter din spate, cu rutele afișate pe caroserie" },
      { src: "/fleet/sprinter-aeroport.jpg", alt: "Microbuz Sprinter în așteptare la terminalul aeroportului" },
      { src: "/fleet/sprinter-pair.jpg", alt: "Două microbuze Sprinter din flota Danca Go, parcate unul lângă altul" },
      { src: "/fleet/sprinter-city.jpg", alt: "Microbuz Sprinter negru, folosit pentru transfer aeroport" },
      { src: "/fleet/sprinter-red.jpg", alt: "Microbuz Sprinter roșu, în autogară, pregătit de plecare" },
    ],
  },
  {
    slug: "vito",
    name: "Mercedes-Benz Vito",
    seats: "Grupuri mici",
    headline: "Transfer discret, ușă la ușă.",
    description:
      "Pentru transferuri la aeroport, delegații și grupuri restrânse. Rapid la îmbarcare, confortabil pe drum lung și suficient de discret pentru deplasări de business.",
    specs: [
      { label: "Tip", value: "Van business" },
      { label: "Producător", value: "Mercedes-Benz" },
      { label: "Capacitate", value: "Grupuri mici" },
      { label: "Utilizare", value: "Transfer & business" },
    ],
    features: ["Transfer aeroport", "Rută flexibilă", "Climatizare", "Interior confortabil"],
    image: "/fleet/vito.jpg",
  },
];

/**
 * The fleet page lists representative vehicle classes, not the full inventory.
 * The company runs more vehicles than the three entries above — several
 * Sprinters in different seat configurations, plus others — so the page closes
 * by saying so rather than implying the list is exhaustive.
 */
export const fleetNote = {
  title: "Și multe altele.",
  body:
    "Mai sus sunt vehiculele reprezentative, nu toată flota. Avem mai multe microbuze, în configurații diferite de locuri, plus vehicule pe care le adăugăm pe măsură ce cererea crește. Spune-ne câți sunteți și când vreți să plecați — îți propunem varianta potrivită.",
  cta: { label: "Cere o ofertă", href: "/inchirieri" },
};

/* -------------------------------------------------------------------------- */
/*                                  SERVICES                                   */
/* -------------------------------------------------------------------------- */

/**
 * Three service lines. Deliberately framed as transport services, not travel
 * products — see the positioning note at the top of this file.
 */
export const services = [
  {
    slug: "curse-regulate",
    title: "Curse regulate",
    body: "Plecări zilnice între Moldova, București, Otopeni și Constanța, cu orar fix și preț afișat clar.",
    href: "/rute",
    cta: "Vezi rutele",
  },
  {
    slug: "inchirieri",
    title: "Închirieri cu șofer",
    body: "Autocare și microbuze de la 12 locuri, cu șofer profesionist, pentru grupuri, companii și echipe.",
    href: "/inchirieri",
    cta: "Cere o ofertă",
  },
  {
    slug: "experiente",
    title: "Excursii de o zi, la cerere",
    body: "Organizăm transportul pentru ieșiri de o zi și deplasări personalizate. Tu alegi traseul, noi ne ocupăm de drum.",
    href: "/experiente",
    cta: "Spune-ne planul",
  },
];

/* -------------------------------------------------------------------------- */
/*                          RENTALS & CUSTOM EXPERIENCES                       */
/* -------------------------------------------------------------------------- */

/** Occasion options per form. Free-form in the database; these are prompts. */
export const eventTypes = {
  rental: [
    "Transport corporate",
    "Echipă sportivă",
    "Nuntă sau eveniment privat",
    "Grup școlar",
    "Transfer aeroport",
    "Altceva",
  ],
  experience: [
    "Excursie de o zi",
    "Ieșire de echipă",
    "Pelerinaj",
    "Eveniment sportiv sau concert",
    "Ieșire în familie",
    "Altceva",
  ],
} as const;

/** Why hire from an operator rather than the cheapest bus on the market. */
export const rentalBenefits = [
  {
    title: "Șoferi profesioniști",
    body: "Atestat profesional, timpi de odihnă respectați și instruire periodică. Oameni obișnuiți cu drumurile lungi și cu grupurile.",
  },
  {
    title: "Confort pe distanțe mari",
    body: "Climatizare, scaune rabatabile și spațiu real pentru bagaje. Ajungeți odihniți, nu doar ajungeți.",
  },
  {
    title: "Flexibilitate pe traseu",
    body: "Tu stabilești plecarea, opririle și ora de întoarcere. Nu ne încadrăm noi în orarul unei curse regulate.",
  },
  {
    title: "Ofertă în 24 de ore",
    body: "Preț ferm, în scris, cu tot ce include. Fără costuri care apar la final și fără negocieri la plecare.",
  },
];

/** What people actually hire us for. Transport for the occasion — not a package. */
export const experienceExamples = [
  {
    title: "Ieșiri de echipă",
    body: "Transport dus-întors pentru colegi, cu plecare de la sediu și întoarcere la ora pe care o stabiliți voi.",
  },
  {
    title: "Excursii de o zi",
    body: "Mănăstiri, munte sau litoral. Voi alegeți traseul și opririle, noi ne ocupăm de drum și de program.",
  },
  {
    title: "Transfer aeroport pentru grup",
    body: "Preluare de la o singură adresă și transfer direct la Otopeni, corelat cu ora zborului.",
  },
  {
    title: "Evenimente și concerte",
    body: "Ducem grupul la eveniment și îl așteptăm până se termină, oricât durează.",
  },
  {
    title: "Nunți și evenimente private",
    body: "Transport pentru invitați între locații, cu program corelat cu al vostru.",
  },
  {
    title: "Grupuri școlare",
    body: "Deplasări pentru clase și cluburi, cu documentele și asigurările în regulă.",
  },
];

/* -------------------------------------------------------------------------- */
/*                             TRUST / PROOF POINTS                            */
/* -------------------------------------------------------------------------- */

/**
 * Proof numbers.
 *
 * `value` is the number itself and `decimals`/`valueSuffix` say how to render
 * it, so a component can animate it up from zero without parsing a formatted
 * string back into a number — "1.800+" is not something `Number()` can read,
 * and guessing would silently turn it into 1.8.
 */
export const stats: {
  value: number;
  decimals?: number;
  /** Glued to the number, e.g. the "+" in "1.800+". */
  valueSuffix?: string;
  /** Set apart from the number, in a lighter weight. */
  suffix?: string;
  label: string;
}[] = [
  {
    value: new Date().getFullYear() - site.founded,
    suffix: "ani",
    label: "de drum neîntrerupt",
  },
  { value: 1800, valueSuffix: "+", label: "pasageri mulțumiți" },
  { value: 4.6, decimals: 1, suffix: "/5", label: "rating de la pasageri" },
  { value: 10, suffix: "orașe", label: "conectate zilnic" },
];

/** Rating distribution behind the 4.6 average. */
export const ratingBreakdown = [
  { stars: 5, share: 76 },
  { stars: 4, share: 15 },
  { stars: 3, share: 6 },
  { stars: 2, share: 2 },
  { stars: 1, share: 1 },
];

export const testimonials = [
  {
    quote:
      "Am prins cursa de dimineață spre Otopeni din Piatra Neamț. Microbuz curat, șofer calm, am ajuns cu 20 de minute mai devreme. Exact ce îți dorești când ai un avion de prins.",
    author: "Andrei M.",
    context: "Piatra Neamț → Otopeni",
    rating: 5,
  },
  {
    quote:
      "Călătoresc lunar pe ruta Roman — București. În doi ani, o singură întârziere, și aia anunțată din timp. Nu am ce reproșa.",
    author: "Elena P.",
    context: "Roman → București",
    rating: 5,
  },
  {
    quote:
      "Am închiriat autocarul pentru echipa noastră. Oferta a venit în aceeași zi, contractul fără surprize, iar șoferul ne-a așteptat fără nicio grabă.",
    author: "Cristina D.",
    context: "Închiriere corporate",
    rating: 5,
  },
  {
    quote:
      "Prețul afișat online a fost exact prețul plătit la urcare. Pare un lucru mic, dar în transportul de persoane e o raritate.",
    author: "Vlad I.",
    context: "Roman → Constanța",
    rating: 4,
  },
];

export const promises = [
  {
    title: "Plecăm la fix",
    body: "Orarul este o promisiune, nu o estimare. Monitorizăm fiecare cursă și te anunțăm înainte să întrebi.",
  },
  {
    title: "Șoferi profesioniști",
    body: "Atestat profesional, timpi de odihnă respectați și instruire periodică. Oameni cărora le-ai încredința familia.",
  },
  {
    title: "Vehicule întreținute obsesiv",
    body: "Revizie la intervale stricte și verificare tehnică înainte de fiecare plecare pe distanță lungă.",
  },
  {
    title: "Preț final, afișat clar",
    body: "Prețul pe care îl vezi este prețul pe care îl plătești. Fără taxe ascunse la îmbarcare.",
  },
];
