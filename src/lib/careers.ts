/**
 * Careers content.
 *
 * Deliberately free of invented specifics: no salary bands, no headcount
 * targets, no "50+ colegi" that nobody can stand behind. Everything here is
 * either verifiable from the company's own operation or phrased as what the
 * candidate can expect to discuss at the interview.
 */

export type Role = {
  slug: string;
  title: string;
  /** Full-time, part-time, seasonal — kept human rather than HR-speak. */
  commitment: string;
  location: string;
  summary: string;
  requirements: string[];
  niceToHave?: string[];
};

export const openRoles: Role[] = [
  {
    slug: "sofer-autocar",
    title: "Șofer autocar",
    commitment: "Normă întreagă",
    location: "Roman, județul Neamț · curse pe rutele noastre",
    summary:
      "Conduci autocarul pe cursele lungi spre București, Otopeni și Constanța și pe închirierile cu grup. Drumuri planificate din timp, fără improvizații de ultim moment.",
    requirements: [
      "Permis categoria D, valabil",
      "Atestat profesional pentru transport persoane (ARR), la zi",
      "Card tahograf valabil",
      "Aviz medical și psihologic pentru transport persoane",
      "Experiență pe distanțe lungi și calm în trafic aglomerat",
    ],
    niceToHave: ["Experiență pe curse externe", "Engleză conversațională"],
  },
  {
    slug: "sofer-microbuz",
    title: "Șofer microbuz",
    commitment: "Normă întreagă sau program parțial",
    location: "Roman, Piatra Neamț, Târgu Neamț, Bacău",
    summary:
      "Cursele zilnice cu Sprinter între orașele din Moldova, capitală și aeroport. Rute repetitive, orar previzibil, întoarcere acasă la finalul turei pe majoritatea programelor.",
    requirements: [
      "Permis categoria D sau D1, valabil",
      "Atestat profesional pentru transport persoane (ARR)",
      "Card tahograf valabil",
      "Aviz medical și psihologic pentru transport persoane",
      "Cazier judiciar și cazier auto curate",
    ],
    niceToHave: ["Domiciliu în unul dintre orașele de plecare"],
  },
  {
    slug: "sofer-transfer",
    title: "Șofer transfer aeroport",
    commitment: "Program flexibil, inclusiv ture de noapte",
    location: "Moldova ↔ Otopeni",
    summary:
      "Transferuri private cu Vito și Sprinter, corelate cu orele de zbor. Este rolul în care contează cel mai mult punctualitatea și felul în care vorbești cu pasagerul.",
    requirements: [
      "Permis categoria B, cu vechime de minimum 5 ani; categoria D1 constituie avantaj",
      "Atestat profesional pentru transport persoane, dacă vehiculul îl impune",
      "Disponibilitate pentru plecări devreme și ture de noapte",
      "Prezență îngrijită și comunicare politicoasă cu pasagerii",
    ],
  },
  {
    slug: "dispecer",
    title: "Dispecer / operator rezervări",
    commitment: "Normă întreagă",
    location: "Roman, județul Neamț",
    summary:
      "Ești vocea companiei la telefon: preiei rezervările, confirmi locurile, ții legătura cu șoferii pe traseu și anunți pasagerii înainte să întrebe ei.",
    requirements: [
      "Comunicare clară și răbdare la telefon",
      "Lucru sigur cu calculatorul și cu aplicații web",
      "Capacitate de a lua decizii rapide când un vehicul întârzie",
      "Disponibilitate pentru ture, inclusiv în weekend",
    ],
    niceToHave: ["Experiență în transport, logistică sau call center"],
  },
];

/** What the company actually offers. Each line is something it can prove. */
export const careerBenefits = [
  {
    title: "Salariu plătit la timp",
    body: "La aceeași dată, în fiecare lună. Fără amânări, fără „săptămâna viitoare”. Suma o discutăm deschis la interviu, în funcție de rol și experiență.",
  },
  {
    title: "Vehicule întreținute serios",
    body: "Setra și Mercedes-Benz, cu revizie la intervale stricte și verificare înainte de fiecare plecare lungă. Nu îți cerem să pleci la drum cu un vehicul în care nu ai încredere.",
  },
  {
    title: "Timpi de odihnă respectați",
    body: "Tahograful nu este o formalitate pe care o ocolim. Programăm cursele astfel încât pauzele să încapă în ele.",
  },
  {
    title: "Echipă mică, decizii rapide",
    body: "Vorbești direct cu cei care conduc firma. Dacă ai o problemă pe traseu, nu treci prin trei niveluri de aprobare ca să o rezolvi.",
  },
];

/** Honest, short and in the order it actually happens. */
export const hiringSteps = [
  {
    title: "Trimiți CV-ul",
    body: "Pe email sau la telefon. Ne interesează experiența, categoriile din permis și de unde pleci la drum.",
  },
  {
    title: "Vorbim la telefon",
    body: "O discuție scurtă, în care îți spunem exact ce presupune rolul și ce program ai avea.",
  },
  {
    title: "Ne vedem și probezi vehiculul",
    body: "Vii la sediu, cunoști echipa și faci un tur cu vehiculul pe care l-ai conduce.",
  },
  {
    title: "Îți spunem răspunsul",
    body: "În maximum o săptămână de la întâlnire, indiferent dacă e da sau nu.",
  },
];
