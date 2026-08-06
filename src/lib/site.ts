/**
 * Single source of truth for company facts, navigation and static route data.
 * Marketing pages read from here; the booking engine reads from Supabase.
 */

export const site = {
  name: "Danca Go",
  legalName: "Danca Util Ideal S.R.L.",
  tagline: "Transport de pasageri, ridicat la alt nivel.",
  description:
    "Curse zilnice între Otopeni, București, Bacău, Roman, Piatra Neamț, Adjud și Constanța. Autocare moderne, șoferi profesioniști, rezervare în 60 de secunde.",
  url: "https://dancago.ro",
  locale: "ro-RO",
  rating: { score: 4.63, max: 5, count: 480 },
  founded: 2008,
  phones: ["+40725819224", "+40775621669"],
  email: "petrudanca1981@gmail.com",
  address: {
    city: "Bacău",
    country: "România",
  },
} as const;

export const phoneDisplay = (phone: string) =>
  phone.replace(/^(\+40)(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");

/* -------------------------------------------------------------------------- */
/*                                 NAVIGATION                                  */
/* -------------------------------------------------------------------------- */

export const navigation = [
  { label: "Rute", href: "/rute" },
  { label: "Flota", href: "/flota" },
  { label: "Închirieri", href: "/inchirieri" },
  { label: "Despre noi", href: "/despre" },
  { label: "Contact", href: "/contact" },
] as const;

export const footerNav = [
  {
    title: "Călătorii",
    links: [
      { label: "Toate rutele", href: "/rute" },
      { label: "Otopeni — Bacău", href: "/rute/otopeni-bacau" },
      { label: "București — Roman", href: "/rute/bucuresti-roman" },
      { label: "Constanța — Bacău", href: "/rute/constanta-bacau" },
      { label: "Rezervă un bilet", href: "/rezervare" },
    ],
  },
  {
    title: "Servicii",
    links: [
      { label: "Flota noastră", href: "/flota" },
      { label: "Închirieri autocare", href: "/inchirieri" },
      { label: "Transfer aeroport", href: "/servicii/transfer-aeroport" },
      { label: "Transport corporate", href: "/servicii/corporate" },
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

export type FeaturedRoute = {
  slug: string;
  from: string;
  to: string;
  durationMinutes: number;
  fromPrice: number; // bani
  frequency: string;
  hub: "otopeni" | "bucuresti" | "constanta";
};

export const featuredRoutes: FeaturedRoute[] = [
  {
    slug: "otopeni-bacau",
    from: "Aeroport Otopeni",
    to: "Bacău",
    durationMinutes: 320,
    fromPrice: 12000,
    frequency: "Zilnic",
    hub: "otopeni",
  },
  {
    slug: "otopeni-roman",
    from: "Aeroport Otopeni",
    to: "Roman",
    durationMinutes: 380,
    fromPrice: 13500,
    frequency: "Zilnic",
    hub: "otopeni",
  },
  {
    slug: "otopeni-piatra-neamt",
    from: "Aeroport Otopeni",
    to: "Piatra Neamț",
    durationMinutes: 420,
    fromPrice: 15000,
    frequency: "Zilnic",
    hub: "otopeni",
  },
  {
    slug: "bucuresti-bacau",
    from: "București",
    to: "Bacău",
    durationMinutes: 300,
    fromPrice: 11000,
    frequency: "Zilnic",
    hub: "bucuresti",
  },
  {
    slug: "bucuresti-adjud",
    from: "București",
    to: "Adjud",
    durationMinutes: 255,
    fromPrice: 10000,
    frequency: "Zilnic",
    hub: "bucuresti",
  },
  {
    slug: "bucuresti-roman",
    from: "București",
    to: "Roman",
    durationMinutes: 360,
    fromPrice: 12500,
    frequency: "Zilnic",
    hub: "bucuresti",
  },
  {
    slug: "constanta-bacau",
    from: "Constanța",
    to: "Bacău",
    durationMinutes: 390,
    fromPrice: 14000,
    frequency: "Vineri — Duminică",
    hub: "constanta",
  },
  {
    slug: "constanta-roman",
    from: "Constanța",
    to: "Roman",
    durationMinutes: 450,
    fromPrice: 15500,
    frequency: "Vineri — Duminică",
    hub: "constanta",
  },
];

/** Cities served, ordered for the marquee / network map. */
export const cities = [
  "Otopeni",
  "București",
  "Bacău",
  "Roman",
  "Piatra Neamț",
  "Adjud",
  "Constanța",
  "Onești",
  "Buzău",
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
};

export const fleet: FleetClass[] = [
  {
    slug: "autocar-57",
    name: "Autocar 57",
    seats: "57 locuri",
    headline: "Capacitate maximă. Zero compromisuri.",
    description:
      "Autocarul nostru de mare capacitate, construit pentru distanțe lungi și grupuri numeroase. Suspensie pneumatică, climatizare pe zone și spațiu real pentru picioare pe fiecare rând.",
    specs: [
      { label: "Locuri", value: "57" },
      { label: "Clasă", value: "Turistic ★★★★" },
      { label: "Bagaje", value: "12 m³" },
      { label: "Priză 220V", value: "Fiecare rând" },
    ],
    features: ["Wi-Fi la bord", "Climatizare pe zone", "Toaletă", "Suspensie pneumatică", "USB-C individual"],
  },
  {
    slug: "autocar-35",
    name: "Autocar 35",
    seats: "35 locuri",
    headline: "Echilibrul perfect între spațiu și agilitate.",
    description:
      "Suficient de mare pentru confort, suficient de agil pentru orașe și drumuri de munte. Alegerea implicită pentru rutele noastre zilnice.",
    specs: [
      { label: "Locuri", value: "35" },
      { label: "Clasă", value: "Turistic ★★★★" },
      { label: "Bagaje", value: "7 m³" },
      { label: "Priză 220V", value: "Fiecare rând" },
    ],
    features: ["Wi-Fi la bord", "Climatizare", "Scaune rabatabile", "Iluminat individual"],
  },
  {
    slug: "microbuz-20",
    name: "Microbuz 8—20",
    seats: "8—20 locuri",
    headline: "Transfer direct, ușă la ușă.",
    description:
      "Pentru transferuri aeroport, delegații și grupuri mici. Flexibil pe rută, rapid la îmbarcare, discret în trafic.",
    specs: [
      { label: "Locuri", value: "8—20" },
      { label: "Clasă", value: "Business" },
      { label: "Bagaje", value: "3 m³" },
      { label: "Acces", value: "Ușă la ușă" },
    ],
    features: ["Transfer aeroport", "Rută flexibilă", "Climatizare", "Scaune piele"],
  },
];

/* -------------------------------------------------------------------------- */
/*                             TRUST / PROOF POINTS                            */
/* -------------------------------------------------------------------------- */

export const stats = [
  { value: "17", suffix: "ani", label: "de drum neîntrerupt" },
  { value: "4.63", suffix: "/5", label: "rating de la pasageri" },
  { value: "9", suffix: "orașe", label: "conectate zilnic" },
  { value: "100%", suffix: "", label: "licențiat ARR & ISO" },
];

/** Rating distribution behind the 4.63 average. */
export const ratingBreakdown = [
  { stars: 5, share: 78 },
  { stars: 4, share: 14 },
  { stars: 3, share: 5 },
  { stars: 2, share: 2 },
  { stars: 1, share: 1 },
];

export const testimonials = [
  {
    quote:
      "Am prins cursa de noapte spre Otopeni după un tur de 12 ore. Autocar curat, șofer calm, am ajuns cu 10 minute mai devreme. Exact ce îți dorești când ai un avion de prins.",
    author: "Andrei M.",
    context: "Bacău → Otopeni",
    rating: 5,
  },
  {
    quote:
      "Călătoresc lunar pe ruta București — Roman. În doi ani, o singură întârziere, și aia anunțată din timp. Nu am ce reproșa.",
    author: "Elena P.",
    context: "București → Roman",
    rating: 5,
  },
  {
    quote:
      "Am închiriat un autocar de 57 de locuri pentru echipa noastră. Oferta a venit în aceeași zi, contractul fără surprize, iar șoferul ne-a așteptat fără nicio grabă.",
    author: "Cristina D.",
    context: "Închiriere corporate",
    rating: 5,
  },
  {
    quote:
      "Prețul afișat online a fost exact prețul plătit la urcare. Pare un lucru mic, dar în transportul de persoane e o raritate.",
    author: "Vlad I.",
    context: "Constanța → Bacău",
    rating: 4,
  },
];

export const promises = [
  {
    title: "Plecăm la fix",
    body: "Orarul este o promisiune, nu o estimare. Monitorizăm fiecare cursă în timp real și te anunțăm înainte să întrebi.",
  },
  {
    title: "Șoferi profesioniști",
    body: "Atestat profesional, timpi de odihnă respectați și instruire periodică. Oameni cărora le-ai încredința familia.",
  },
  {
    title: "Autocare întreținute obsesiv",
    body: "Revizie la fiecare 15.000 km, verificare tehnică înainte de fiecare plecare de cursă lungă.",
  },
  {
    title: "Preț final, afișat clar",
    body: "Prețul pe care îl vezi este prețul pe care îl plătești. Fără taxe ascunse la îmbarcare.",
  },
];
