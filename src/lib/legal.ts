import { site } from "./site";

/**
 * Legal documents, as structured content rather than prose components.
 *
 * Keeping them as data means the table of contents, the anchors and the
 * "last updated" stamp can never drift out of sync with the text, and a
 * non-developer can edit a clause without touching JSX.
 *
 * ACCURACY NOTE — this text describes what the site actually does today:
 * bookings are held for 30 minutes and settled in cash on boarding (see
 * `src/lib/payments.ts`), the only cookies set are Supabase's session cookies
 * (see `src/middleware.ts`), and the only visitor-facing data collection is
 * Vercel Web Analytics + Speed Insights (see `src/app/layout.tsx`) — both
 * cookieless, both reporting anonymous, aggregate page-view and performance
 * data with no cross-site tracking. There is no advertising script anywhere
 * in the bundle, and no fingerprinting. If any of that changes, these
 * documents change with it — they are not boilerplate.
 */

export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "note"; title: string; text: string }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "entity" };

export type LegalSection = {
  id: string;
  heading: string;
  blocks: LegalBlock[];
};

export type LegalDoc = {
  slug: string;
  title: string;
  eyebrow: string;
  lead: string;
  /** ISO date; rendered in Romanian long form. */
  updated: string;
  sections: LegalSection[];
};

/** Bumped whenever any of the three documents below is edited. */
export const LEGAL_UPDATED = "2026-08-10";

const contactLine = `${site.email} sau ${site.phones[0]}`;

/* -------------------------------------------------------------------------- */
/*                             TERMENI ȘI CONDIȚII                             */
/* -------------------------------------------------------------------------- */

const terms: LegalDoc = {
  slug: "termeni",
  title: "Termeni și condiții",
  eyebrow: "Legal",
  lead: "Condițiile în care rezervi un bilet, călătorești cu noi sau închiriezi un vehicul. Le-am scris ca să fie citite, nu ca să fie ignorate.",
  updated: LEGAL_UPDATED,
  sections: [
    {
      id: "operator",
      heading: "1. Cine suntem",
      blocks: [
        {
          type: "p",
          text: `${site.name} este marca sub care ${site.legalName} operează servicii de transport rutier de persoane: curse regulate, închirieri de autocare și microbuze cu șofer și deplasări organizate la cerere.`,
        },
        { type: "entity" },
        {
          type: "p",
          text: `Ne poți contacta oricând la ${contactLine}.`,
        },
      ],
    },
    {
      id: "obiect",
      heading: "2. Ce acoperă acești termeni",
      blocks: [
        {
          type: "p",
          text: "Acest document reglementează relația dintre noi și tine atunci când folosești site-ul, rezervi un loc pe o cursă regulată sau ceri o ofertă de închiriere. Prin finalizarea unei rezervări confirmi că ai citit și accepți acești termeni.",
        },
        {
          type: "p",
          text: "Pentru închirieri și deplasări la cerere, oferta pe care ți-o trimitem și contractul semnat ulterior primează asupra acestui document ori de câte ori prevăd altceva.",
        },
      ],
    },
    {
      id: "rezervare",
      heading: "3. Rezervarea unui bilet",
      blocks: [
        {
          type: "p",
          text: "Rezervarea se face online, telefonic sau direct la îmbarcare, în limita locurilor disponibile. Contractul de transport se încheie în momentul în care primești codul rezervării, în format DG-XXXXXXX.",
        },
        {
          type: "list",
          items: [
            "Locurile alese sunt blocate 30 de minute din momentul în care începi rezervarea. Dacă nu finalizezi în acest interval, ele redevin disponibile.",
            "Codul rezervării și adresa de email folosită la rezervare sunt cele care îți permit să îți regăsești biletul.",
            "Numele fiecărui pasager trebuie completat corect: este numele verificat de șofer la îmbarcare.",
            "Ești responsabil pentru exactitatea datelor de contact. Dacă adresa de email este greșită, nu putem trimite confirmarea.",
          ],
        },
      ],
    },
    {
      id: "preturi",
      heading: "4. Prețuri și plată",
      blocks: [
        {
          type: "p",
          text: "Toate prețurile sunt exprimate în lei și includ TVA. Prețul afișat la momentul rezervării este prețul final: nu adăugăm comisioane, taxe de rezervare sau suprataxe la îmbarcare.",
        },
        {
          type: "p",
          text: "În acest moment plata se face în numerar, la îmbarcare. Rezervarea online garantează locul, nu îl plătește în avans. Când vom activa plata cu cardul, vei fi informat în pasul de plată înainte de a confirma.",
        },
        {
          type: "p",
          text: "Emitem bon fiscal pentru fiecare călătorie și factură la cerere, pe baza datelor de facturare pe care ni le comunici.",
        },
      ],
    },
    {
      id: "imbarcare",
      heading: "5. Îmbarcarea",
      blocks: [
        {
          type: "list",
          items: [
            "Prezintă-te în stație cu cel puțin 15 minute înainte de ora de plecare.",
            "Vehiculul pleacă la ora anunțată. Nu putem aștepta pasagerii întârziați fără să afectăm întreaga cursă.",
            "Ai nevoie de codul rezervării (pe telefon sau tipărit) și de un act de identitate valabil.",
            "Un pasager care nu se prezintă la îmbarcare pierde locul și suma achitată, dacă plata a fost deja făcută.",
          ],
        },
      ],
    },
    {
      id: "bagaje",
      heading: "6. Bagaje",
      blocks: [
        {
          type: "p",
          text: "Fiecare pasager are dreptul la un bagaj de cală și un bagaj de mână, în limitele spațiului disponibil al vehiculului. Bagajele suplimentare sau voluminoase trebuie anunțate din timp și pot fi transportate contra cost, dacă spațiul permite.",
        },
        {
          type: "list",
          items: [
            "Bagajul de mână rămâne în grija ta pe toată durata călătoriei.",
            "Nu transportăm materiale periculoase, inflamabile, substanțe interzise sau bunuri fără documente legale.",
            "Pentru obiecte de valoare, bani sau documente lăsate în bagajul de cală nu ne putem asuma răspunderea.",
            "Obiectele uitate în vehicul se păstrează 30 de zile de la data cursei.",
          ],
        },
      ],
    },
    {
      id: "anulare",
      heading: "7. Anulare și modificare",
      blocks: [
        {
          type: "p",
          text: "Poți anula sau modifica o rezervare contactându-ne la datele de mai sus, folosind codul rezervării. Îți recomandăm să o faci cu cel puțin 24 de ore înainte de plecare, ca să putem redeschide locul.",
        },
        {
          type: "list",
          items: [
            "Anulare cu peste 24 de ore înainte de plecare: fără costuri.",
            "Anulare în ultimele 24 de ore: locul poate fi reținut, în funcție de gradul de ocupare al cursei.",
            "Neprezentarea la îmbarcare, fără anunț prealabil, echivalează cu o anulare tardivă.",
            "Modificarea datei sau a orei se face în limita locurilor disponibile pe cursa nouă.",
          ],
        },
        {
          type: "note",
          title: "Despre dreptul de retragere în 14 zile",
          text: "Serviciile de transport de persoane prestate la o dată calendaristică determinată sunt exceptate de la dreptul de retragere de 14 zile prevăzut de OUG nr. 34/2014 (art. 16 lit. l). Asta nu îți afectează dreptul de a anula conform condițiilor de mai sus.",
        },
      ],
    },
    {
      id: "intarzieri",
      heading: "8. Întârzieri, modificări de program și forță majoră",
      blocks: [
        {
          type: "p",
          text: "Ne planificăm orarele cu marjă și monitorizăm fiecare cursă, dar traficul, condițiile meteo, restricțiile de circulație și defecțiunile tehnice pot produce întârzieri. Te anunțăm imediat ce știm, la numărul de telefon lăsat la rezervare.",
        },
        {
          type: "p",
          text: "Dacă anulăm o cursă din motive care ne aparțin, îți oferim la alegere transportul pe următoarea cursă disponibilă sau restituirea integrală a sumei achitate.",
        },
        {
          type: "p",
          text: "Nu răspundem pentru pierderi indirecte cauzate de întârzieri — de exemplu, un zbor pierdut. Pentru curse cu plecare spre aeroport, alege o cursă cu marjă confortabilă înainte de ora de check-in.",
        },
        {
          type: "note",
          title: "Drepturile pasagerilor",
          text: "Pentru serviciile regulate cu o distanță programată de cel puțin 250 km se aplică Regulamentul (UE) nr. 181/2011 privind drepturile pasagerilor care călătoresc cu autobuzul și autocarul, inclusiv prevederile privind anularea și întârzierea la plecare.",
        },
      ],
    },
    {
      id: "conduita",
      heading: "9. Conduita la bord",
      blocks: [
        {
          type: "p",
          text: "Vehiculele noastre sunt spații comune. Șoferul are dreptul să refuze îmbarcarea sau să solicite coborârea unui pasager care pune în pericol siguranța ori confortul celorlalți.",
        },
        {
          type: "list",
          items: [
            "Fumatul, inclusiv al țigărilor electronice, este interzis la bord.",
            "Consumul de alcool sau de substanțe interzise în vehicul nu este permis.",
            "Centura de siguranță se poartă pe toată durata călătoriei, acolo unde vehiculul este dotat.",
            "Pasagerii răspund pentru daunele produse vehiculului din vina lor.",
          ],
        },
      ],
    },
    {
      id: "copii",
      heading: "10. Copii, minori și animale de companie",
      blocks: [
        {
          type: "p",
          text: "Copiii sub 14 ani călătoresc doar însoțiți de un adult. Pentru minorii care călătoresc fără părinți sunt necesare documentele prevăzute de lege, pe care le solicităm la îmbarcare.",
        },
        {
          type: "p",
          text: "Animalele de companie de talie mică pot fi transportate în cușcă de transport, cu acordul prealabil al operatorului și cu carnetul de sănătate la zi. Câinii utilitari care însoțesc persoane cu dizabilități călătoresc gratuit, fără restricții.",
        },
      ],
    },
    {
      id: "inchirieri",
      heading: "11. Închirieri și deplasări la cerere",
      blocks: [
        {
          type: "p",
          text: "Formularul de pe site trimite o cerere de ofertă, nu o rezervare fermă. Revenim cu un preț ferm, în scris, în maximum 24 de ore lucrătoare. Rezervarea vehiculului devine efectivă la confirmarea ofertei și, unde este cazul, la semnarea contractului.",
        },
        {
          type: "p",
          text: "Oferta include șoferul, combustibilul, taxele de drum din România și asigurările obligatorii, dacă nu se specifică altfel. Nu include cazarea participanților, biletele de intrare la obiective sau alte servicii turistice — nu suntem agenție de turism și nu comercializăm pachete de călătorie.",
        },
      ],
    },
    {
      id: "raspundere",
      heading: "12. Răspundere",
      blocks: [
        {
          type: "p",
          text: "Răspundem pentru prestarea serviciului de transport în condițiile prevăzute de lege și de asigurările obligatorii pentru transportul de persoane. Răspunderea noastră este limitată la valoarea serviciului contractat, cu excepția cazurilor în care legea prevede altfel.",
        },
        {
          type: "p",
          text: "Site-ul este oferit ca atare. Depunem eforturi rezonabile pentru ca informațiile despre orare, prețuri și disponibilitate să fie corecte, dar erorile evidente de afișare nu ne obligă să prestăm serviciul la un preț vădit greșit.",
        },
      ],
    },
    {
      id: "reclamatii",
      heading: "13. Reclamații și soluționarea litigiilor",
      blocks: [
        {
          type: "p",
          text: `Dacă ceva nu a mers bine, scrie-ne întâi nouă la ${site.email}. Răspundem la orice reclamație în cel mult 30 de zile calendaristice.`,
        },
        {
          type: "p",
          text: "Dacă răspunsul nostru nu te mulțumește, te poți adresa Autorității Naționale pentru Protecția Consumatorilor (anpc.ro) sau poți folosi platforma europeană de soluționare online a litigiilor, disponibilă la ec.europa.eu/consumers/odr.",
        },
      ],
    },
    {
      id: "final",
      heading: "14. Modificări, lege aplicabilă",
      blocks: [
        {
          type: "p",
          text: "Putem actualiza acești termeni. Versiunea aplicabilă rezervării tale este cea publicată pe site în momentul în care ai finalizat rezervarea. Data ultimei actualizări este afișată în capul paginii.",
        },
        {
          type: "p",
          text: "Acestor termeni li se aplică legea română. Litigiile care nu pot fi rezolvate amiabil sunt de competența instanțelor române.",
        },
      ],
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*                        POLITICA DE CONFIDENȚIALITATE                        */
/* -------------------------------------------------------------------------- */

const privacy: LegalDoc = {
  slug: "confidentialitate",
  title: "Politica de confidențialitate",
  eyebrow: "Legal",
  lead: "Ce date îți cerem, de ce avem nevoie de ele și ce poți face oricând ca să le controlezi. Fără formulări menite să obosească cititorul.",
  updated: LEGAL_UPDATED,
  sections: [
    {
      id: "operator",
      heading: "1. Cine prelucrează datele",
      blocks: [
        {
          type: "p",
          text: `Operatorul datelor tale cu caracter personal este ${site.legalName}, compania din spatele mărcii ${site.name}.`,
        },
        { type: "entity" },
        {
          type: "p",
          text: `Pentru orice întrebare legată de datele tale, scrie-ne la ${site.email}.`,
        },
      ],
    },
    {
      id: "ce-colectam",
      heading: "2. Ce date colectăm",
      blocks: [
        {
          type: "p",
          text: "Colectăm strict datele de care avem nevoie ca să te ducem dintr-un oraș în altul. Nimic mai mult.",
        },
        {
          type: "table",
          head: ["Când", "Ce colectăm"],
          rows: [
            [
              "Rezervarea unui bilet",
              "Numele și prenumele fiecărui pasager, dacă pasagerul este copil, numele persoanei de contact, adresa de email, numărul de telefon, cursa și locurile alese, eventualele observații pe care ni le lași.",
            ],
            [
              "Cerere de închiriere sau deplasare la cerere",
              "Numele tău, opțional numele companiei, adresa de email, numărul de telefon, orașul de plecare și destinația, datele deplasării, numărul de pasageri, tipul de vehicul și mesajul tău.",
            ],
            [
              "Regăsirea unei rezervări",
              "Codul rezervării și adresa de email folosită la rezervare, care împreună funcționează ca dovadă că rezervarea îți aparține.",
            ],
            [
              "Vizitarea site-ului",
              "Date tehnice standard de server: adresa IP, tipul de browser și pagina accesată, păstrate în jurnalele furnizorilor noștri de infrastructură.",
            ],
            [
              "Vizitarea site-ului (statistici)",
              "Vercel Web Analytics și Speed Insights măsoară, fără cookie-uri și fără să te poată identifica, ce pagini sunt vizitate și cât de repede se încarcă site-ul pe dispozitivul tău. Datele sunt agregate — nu construim un profil al tău și nu te putem recunoaște la o vizită ulterioară.",
            ],
          ],
        },
        {
          type: "note",
          title: "Ce nu colectăm",
          text: "Nu avem pixeli publicitari, nu vindem date către rețele de publicitate și nu urmărim comportamentul vizitatorilor între site-uri. Nu îți cerem CNP-ul pentru o rezervare obișnuită și nu prelucrăm categorii speciale de date.",
        },
      ],
    },
    {
      id: "temeiuri",
      heading: "3. De ce le prelucrăm și în ce temei",
      blocks: [
        {
          type: "table",
          head: ["Scop", "Temei legal (GDPR)"],
          rows: [
            [
              "Încheierea și executarea contractului de transport: emiterea rezervării, lista de îmbarcare, contactul pe durata cursei.",
              "Art. 6 alin. (1) lit. b) — executarea contractului.",
            ],
            [
              "Răspunsul la cererile de ofertă pentru închirieri și deplasări la cerere.",
              "Art. 6 alin. (1) lit. b) — demersuri anterioare încheierii contractului.",
            ],
            [
              "Emiterea documentelor fiscale și păstrarea evidențelor contabile.",
              "Art. 6 alin. (1) lit. c) — obligație legală.",
            ],
            [
              "Siguranța călătoriei, soluționarea reclamațiilor și apărarea drepturilor noastre în caz de litigiu.",
              "Art. 6 alin. (1) lit. f) — interes legitim.",
            ],
            [
              "Statistici anonime de trafic și performanță, ca să știm dacă site-ul funcționează bine pentru vizitatori.",
              "Art. 6 alin. (1) lit. f) — interes legitim. Fiind agregate și fără cookie-uri, nu necesită consimțământul tău.",
            ],
          ],
        },
      ],
    },
    {
      id: "cat-pastram",
      heading: "4. Cât timp păstrăm datele",
      blocks: [
        {
          type: "list",
          items: [
            "Datele rezervărilor: 3 ani de la data călătoriei, termenul general de prescripție.",
            "Documentele fiscale și datele care apar în ele: 10 ani, conform Legii contabilității nr. 82/1991.",
            "Cererile de ofertă care nu s-au concretizat: 12 luni de la ultima comunicare.",
            "Jurnalele tehnice de server: maximum 30 de zile.",
          ],
        },
        {
          type: "p",
          text: "După expirarea acestor termene, datele sunt șterse sau anonimizate ireversibil.",
        },
      ],
    },
    {
      id: "cui-transmitem",
      heading: "5. Cui transmitem datele",
      blocks: [
        {
          type: "p",
          text: "Nu vindem și nu închiriem date personale. Le împărtășim doar cu partenerii de care avem nevoie ca să funcționăm:",
        },
        {
          type: "list",
          items: [
            "Furnizorul bazei de date și al infrastructurii de aplicație, care găzduiește rezervările în Uniunea Europeană, în calitate de persoană împuternicită.",
            "Furnizorul de găzduire a site-ului (Vercel), care rulează și statisticile anonime de trafic descrise mai sus.",
            "Contabilul și, unde legea o cere, autoritățile fiscale.",
            "Procesatorul de plăți, în momentul în care vom activa plata cu cardul. Datele cardului nu ajung și nu vor ajunge pe serverele noastre.",
            "Autoritățile publice, exclusiv atunci când legea ne obligă.",
          ],
        },
        {
          type: "p",
          text: "Datele sunt stocate pe servere din Uniunea Europeană. Dacă un furnizor ar impune un transfer în afara UE, acesta s-ar face doar pe baza garanțiilor prevăzute de capitolul V din GDPR.",
        },
      ],
    },
    {
      id: "securitate",
      heading: "6. Cum le protejăm",
      blocks: [
        {
          type: "list",
          items: [
            "Traficul dintre browserul tău și site este criptat integral (HTTPS).",
            "Baza de date aplică reguli de acces la nivel de rând: o rezervare poate fi citită doar cu combinația corectă de cod și email.",
            "Accesul intern la date este limitat la persoanele care au nevoie de el pentru a-ți presta serviciul.",
          ],
        },
      ],
    },
    {
      id: "drepturi",
      heading: "7. Drepturile tale",
      blocks: [
        {
          type: "p",
          text: "Conform Regulamentului (UE) 2016/679, ai următoarele drepturi:",
        },
        {
          type: "list",
          items: [
            "Dreptul de acces — să afli ce date avem despre tine și să primești o copie.",
            "Dreptul la rectificare — să corectăm datele inexacte.",
            "Dreptul la ștergere — să eliminăm datele, atunci când nu avem o obligație legală de a le păstra.",
            "Dreptul la restricționarea prelucrării.",
            "Dreptul la portabilitate — să primești datele într-un format structurat, care poate fi citit automat.",
            "Dreptul la opoziție față de prelucrările întemeiate pe interesul nostru legitim.",
            "Dreptul de a nu fi supus unei decizii automate. Nu luăm decizii automate cu efecte juridice asupra ta.",
          ],
        },
        {
          type: "p",
          text: `Îți exerciți oricare dintre aceste drepturi scriindu-ne la ${site.email}. Răspundem în cel mult 30 de zile.`,
        },
      ],
    },
    {
      id: "anspdcp",
      heading: "8. Dreptul de a depune o plângere",
      blocks: [
        {
          type: "p",
          text: "Dacă apreciezi că ți-am încălcat drepturile, te poți adresa Autorității Naționale de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP), B-dul General Gheorghe Magheru nr. 28-30, sector 1, București, sau online la dataprotection.ro. Ai, de asemenea, dreptul de a te adresa instanței.",
        },
      ],
    },
    {
      id: "minori",
      heading: "9. Minori",
      blocks: [
        {
          type: "p",
          text: "Site-ul nu se adresează persoanelor sub 16 ani. Rezervările pentru copii se fac de către un adult, care ne comunică numele copilului pentru lista de îmbarcare.",
        },
      ],
    },
    {
      id: "modificari",
      heading: "10. Modificări ale acestei politici",
      blocks: [
        {
          type: "p",
          text: "Când modificăm politica, actualizăm data din capul paginii. Dacă schimbarea este semnificativă, te anunțăm și prin email, la adresa folosită la ultima rezervare.",
        },
      ],
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*                             POLITICA DE COOKIES                             */
/* -------------------------------------------------------------------------- */

const cookies: LegalDoc = {
  slug: "cookies",
  title: "Politica de cookies",
  eyebrow: "Legal",
  lead: "Folosim un singur tip de cookie: cel fără de care rezervarea ta nu ar funcționa. De aceea nu îți apare niciun banner.",
  updated: LEGAL_UPDATED,
  sections: [
    {
      id: "ce-sunt",
      heading: "1. Ce sunt cookie-urile",
      blocks: [
        {
          type: "p",
          text: "Un cookie este un fișier text mic pe care site-ul îl salvează în browserul tău. Este folosit ca site-ul să te „recunoască” de la o pagină la alta — de exemplu, ca să nu îți piardă rezervarea la jumătatea procesului.",
        },
      ],
    },
    {
      id: "ce-folosim",
      heading: "2. Ce folosim noi",
      blocks: [
        {
          type: "p",
          text: "Doar cookie-uri strict necesare. Nu avem cookie-uri de publicitate sau de urmărire între site-uri, iar în paginile noastre nu este încărcat niciun script de terț în acest scop.",
        },
        {
          type: "table",
          head: ["Cookie", "Rol", "Durată"],
          rows: [
            [
              "sb-…-auth-token",
              "Menține sesiunea tehnică pe durata rezervării, ca pașii formularului să nu se piardă.",
              "Sesiune / până la 1 an",
            ],
            [
              "sb-…-auth-token-code-verifier",
              "Element de securitate care confirmă că cererea vine din același browser.",
              "Temporar",
            ],
          ],
        },
        {
          type: "note",
          title: "Statisticile de trafic nu folosesc cookie-uri",
          text: "Măsurăm vizitele și viteza de încărcare a paginilor cu Vercel Web Analytics și Speed Insights. Ambele funcționează fără să salveze niciun cookie și fără niciun identificator care să te urmărească de la o vizită la alta — de aceea nu apar în tabelul de mai sus.",
        },
        {
          type: "note",
          title: "De ce nu vezi un banner de cookies",
          text: "Legea impune consimțământul pentru cookie-urile care nu sunt strict necesare funcționării serviciului. Pentru că folosim exclusiv cookie-uri strict necesare — iar statisticile de trafic nu folosesc deloc cookie-uri — un banner de consimțământ nu este obligatoriu, și nu îți mai furăm un clic degeaba.",
        },
      ],
    },
    {
      id: "control",
      heading: "3. Cum le controlezi",
      blocks: [
        {
          type: "p",
          text: "Orice browser îți permite să vezi, să blochezi sau să ștergi cookie-urile din setări, de obicei în secțiunea „Confidențialitate și securitate”.",
        },
        {
          type: "p",
          text: "Reține că, dacă blochezi cookie-urile strict necesare, procesul de rezervare online poate să nu mai funcționeze. În acest caz poți rezerva oricând telefonic.",
        },
      ],
    },
    {
      id: "modificari",
      heading: "4. Modificări",
      blocks: [
        {
          type: "p",
          text: "Dacă vom adăuga vreodată instrumente care folosesc alte tipuri de cookie-uri, actualizăm această pagină înainte de activarea lor și îți cerem consimțământul, așa cum prevede legea.",
        },
      ],
    },
  ],
};

export const legalDocs: LegalDoc[] = [terms, privacy, cookies];

export function getLegalDoc(slug: string): LegalDoc | undefined {
  return legalDocs.find((doc) => doc.slug === slug);
}
