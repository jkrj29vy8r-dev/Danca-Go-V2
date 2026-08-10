import { regionalStops, site } from "./site";

/** "Adjud, Focșani, Buzău și Onești" — kept in sync with the network data. */
const stopsSentence = [regionalStops.slice(0, -1).join(", "), regionalStops.at(-1)].join(
  " și ",
);

/**
 * Frequently asked questions.
 *
 * Every answer here must agree with `src/lib/legal.ts` — the 30-minute hold,
 * the 24-hour cancellation window, cash on boarding, one hold bag plus one
 * cabin bag. If a policy changes, both files change together; a FAQ that
 * contradicts the terms is worse than no FAQ.
 */

export type FaqItem = { question: string; answer: string };
export type FaqGroup = { id: string; title: string; items: FaqItem[] };

export const faqGroups: FaqGroup[] = [
  {
    id: "rezervari",
    title: "Rezervări și bilete",
    items: [
      {
        question: "Cum rezerv un loc?",
        answer:
          "Alegi ruta și data în pagina de rezervare, selectezi cursa potrivită, completezi numele pasagerilor și confirmi. Primești imediat un cod de forma DG-XXXXXXX, care este biletul tău. Poți rezerva și telefonic, la oricare dintre numerele noastre.",
      },
      {
        question: "Cât timp îmi este ținut locul în timp ce completez datele?",
        answer:
          "30 de minute din momentul în care începi rezervarea. Dacă nu finalizezi în acest interval, locurile redevin disponibile pentru ceilalți pasageri — nu vrem să blocăm scaune care rămân goale la plecare.",
      },
      {
        question: "Cum îmi regăsesc rezervarea?",
        answer:
          "În pagina „Găsește-ți rezervarea” introduci codul rezervării și adresa de email folosită la rezervare. Cele două împreună confirmă că rezervarea îți aparține, așa că nimeni altcineva nu îți poate vedea datele.",
      },
      {
        question: "Pot anula sau muta rezervarea pe altă zi?",
        answer:
          "Da. Sună-ne sau scrie-ne cu codul rezervării. Dacă anulezi cu peste 24 de ore înainte de plecare, nu percepem niciun cost. Modificarea datei se face în limita locurilor disponibile pe cursa nouă.",
      },
      {
        question: "Am nevoie de bilet tipărit?",
        answer:
          "Nu. Codul rezervării pe telefon este suficient. Ai nevoie și de un act de identitate valabil, pe care șoferul îl poate verifica la îmbarcare.",
      },
    ],
  },
  {
    id: "calatoria",
    title: "Înainte de plecare și în drum",
    items: [
      {
        question: "Cu cât timp înainte trebuie să ajung în stație?",
        answer:
          "Cu cel puțin 15 minute. Plecăm la ora anunțată, pentru că fiecare minut de întârziere la plecare se transmite la toți pasagerii de pe traseu.",
      },
      {
        question: "Ce se întâmplă dacă întârzii cursa?",
        answer:
          "Vehiculul nu poate aștepta. Sună-ne imediat ce știi că nu ajungi: dacă mai avem locuri pe o cursă ulterioară din aceeași zi, încercăm să te mutăm.",
      },
      {
        question: "Cursa poate întârzia?",
        answer:
          "Ne planificăm orarele cu marjă, dar traficul, vremea și restricțiile de circulație pot produce întârzieri. Te anunțăm telefonic imediat ce știm — nu așteptăm să întrebi tu.",
      },
      {
        question: "Pot urca dintr-o localitate de pe traseu?",
        answer: `Da. Pe lângă orașele principale, oprim și în ${stopsSentence}, în funcție de rută. Spune-ne la rezervare de unde urci și îți confirmăm punctul exact de îmbarcare.`,
      },
      {
        question: "Ce vehicul face cursa?",
        answer:
          "În funcție de rută și de gradul de ocupare: autocarul Setra pe cursele cu grup mare, sau unul dintre microbuzele Mercedes-Benz Sprinter. Toate au climatizare, scaune individuale și spațiu real pentru bagaje.",
      },
    ],
  },
  {
    id: "bagaje",
    title: "Bagaje",
    items: [
      {
        question: "Câte bagaje pot lua?",
        answer:
          "Un bagaj de cală și un bagaj de mână, incluse în preț. Dacă ai bagaje suplimentare sau voluminoase, anunță-ne la rezervare: le luăm dacă spațiul permite, uneori contra cost.",
      },
      {
        question: "Pot transporta o bicicletă, schiuri sau un cărucior?",
        answer:
          "De regulă da, pe autocar și pe microbuzele mai mari, dar strict cu confirmare prealabilă. Sună-ne înainte de rezervare ca să verificăm spațiul de cală pe cursa respectivă.",
      },
      {
        question: "Am uitat un obiect în vehicul. Ce fac?",
        answer:
          "Sună-ne cât mai repede. Păstrăm obiectele găsite 30 de zile de la data cursei și ți le predăm la următoarea plecare de pe rută sau la sediu.",
      },
    ],
  },
  {
    id: "aeroport",
    title: "Transfer aeroport",
    items: [
      {
        question: "Mă lăsați direct la terminalul din Otopeni?",
        answer:
          "Da. Cursele spre Aeroportul Internațional Henri Coandă opresc la terminalul de plecări, nu într-o autogară de la marginea orașului.",
      },
      {
        question: "Ce marjă să las față de ora zborului?",
        answer:
          "Recomandăm să alegi o cursă care ajunge cu cel puțin trei ore înainte de decolare pentru zboruri externe și două ore pentru cele interne. Nu ne putem asuma răspunderea pentru un zbor pierdut din cauza traficului.",
      },
      {
        question: "Puteți veni să mă luați de acasă?",
        answer:
          "Pe cursele regulate, îmbarcarea se face în punctele anunțate. Pentru preluare de la o adresă, la ora ta, avem transferul privat cu Vito sau Sprinter — cere o ofertă și îți răspundem în cel mult 24 de ore.",
      },
      {
        question: "Aveți curse și pentru zboruri de noapte?",
        answer:
          "Programăm curse corelate cu orele de zbor cele mai frecvente. Dacă ai un zbor la o oră neacoperită de orar, transferul privat rămâne varianta sigură.",
      },
    ],
  },
  {
    id: "plata",
    title: "Plată și facturare",
    items: [
      {
        question: "Cum se plătește biletul?",
        answer:
          "În acest moment, în numerar la îmbarcare. Rezervarea online îți garantează locul; nu îți cerem plata în avans. Când vom activa plata cu cardul, o vei vedea ca pas distinct înainte de confirmare.",
      },
      {
        question: "Prețul afișat este final?",
        answer:
          "Da. Prețul include TVA și nu adăugăm comisioane de rezervare, taxe de bagaj standard sau suprataxe la urcare. Ce vezi este ce plătești.",
      },
      {
        question: "Pot primi factură pe firmă?",
        answer:
          "Da. Spune-ne la rezervare sau la îmbarcare că ai nevoie de factură și comunică-ne datele de facturare. Emitem bon fiscal pentru fiecare călătorie.",
      },
      {
        question: "Aveți reduceri pentru copii sau grupuri?",
        answer:
          "Pentru copii, bifează opțiunea în formularul de rezervare și confirmăm tariful. Pentru grupuri, cel mai bun preț îl obții printr-o cerere de închiriere: îți facem o ofertă fermă pentru tot grupul.",
      },
    ],
  },
  {
    id: "inchirieri",
    title: "Închirieri și grupuri",
    items: [
      {
        question: "De la câte persoane pot închiria un vehicul?",
        answer:
          "De la 12 locuri în sus — cel mai mic microbuz din flotă. De acolo urcăm la Sprintere cu mai multe locuri și la autocarul Setra pentru grupuri mari.",
      },
      {
        question: "Cât durează până primesc oferta?",
        answer:
          "Maximum 24 de ore lucrătoare, de obicei mult mai repede. Oferta este fermă, în scris, cu tot ce include — fără costuri care apar la final.",
      },
      {
        question: "Ce include prețul unei închirieri?",
        answer:
          "Șoferul, combustibilul, taxele de drum din România și asigurările obligatorii. Nu include cazare, bilete de intrare la obiective sau alte servicii turistice: suntem operator de transport, nu agenție de turism.",
      },
      {
        question: "Organizați și excursii de o zi?",
        answer:
          "Organizăm transportul pentru ele. Tu stabilești traseul, opririle și programul; noi ne ocupăm de drum, de vehicul și de șofer. Nu vindem pachete cu cazare sau ghid.",
      },
      {
        question: "Ieșiți și în afara României?",
        answer: `Pentru deplasări externe, discutăm caz cu caz în funcție de traseu, durată și documentele necesare. Scrie-ne la ${site.email} cu detaliile și îți spunem sincer dacă o putem face bine.`,
      },
    ],
  },
];

/** Flattened, for the JSON-LD block and for search. */
export const allFaqItems: FaqItem[] = faqGroups.flatMap((group) => group.items);

/** schema.org FAQPage — makes the questions eligible as a rich result. */
export function faqJsonLd(items: FaqItem[] = allFaqItems) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
