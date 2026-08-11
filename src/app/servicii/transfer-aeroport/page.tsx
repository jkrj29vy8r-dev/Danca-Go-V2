import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Clock, PlaneTakeoff } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FaqList } from "@/components/faq/faq-browser";
import { FlightScene } from "@/components/airport/flight-scene";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Magnetic, Spotlight, TiltCard } from "@/components/motion/magnetic";
import { ClipReveal, WordsUp } from "@/components/motion/text-reveal";
import { Parallax, SectionAtmosphere } from "@/components/motion/scroll-effects";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { faqGroups, faqJsonLd } from "@/lib/faq";
import { featuredRoutes } from "@/lib/site";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { formatDuration, formatPrice } from "@/lib/utils";

export const metadata = pageMetadata({
  path: "/servicii/transfer-aeroport",
  title: "Transfer aeroport Otopeni",
  description:
    "Transfer către Aeroportul Henri Coandă din Târgu Neamț, Piatra Neamț, Roman și Bacău. Curse regulate cu loc rezervat sau transfer privat, ușă la ușă, corelat cu ora zborului.",
});

const airportRoutes = featuredRoutes.filter((route) => route.hub === "otopeni");

const airportFaq = faqGroups.find((group) => group.id === "aeroport");

// Flat trail, not "Acasă → Servicii → Transfer aeroport": there's no /servicii
// index page, and a breadcrumb step should always be a URL that resolves.
const breadcrumb = breadcrumbJsonLd([
  { name: "Acasă", path: "/" },
  { name: "Transfer aeroport", path: "/servicii/transfer-aeroport" },
]);

/** The honest comparison: two different services, not one with an upsell. */
const options = [
  {
    title: "Cursă regulată",
    tagline: "Loc rezervat pe orarul nostru",
    body: "Pleci din punctul de îmbarcare din orașul tău, la ora din orar, și cobori la terminalul de plecări din Otopeni. Cea mai bună variantă de preț dacă zborul tău se potrivește cu programul cursei.",
    included: [
      "Preț pe persoană, afișat clar înainte de rezervare",
      "Oprire la terminalul de plecări, nu la marginea orașului",
      "Un bagaj de cală și un bagaj de mână incluse",
      "Confirmare instantanee, cu cod de rezervare",
    ],
    cta: { label: "Vezi cursele spre Otopeni", href: "/rezervare?to=Aeroport+Otopeni" },
    variant: "accent" as const,
  },
  {
    title: "Transfer privat",
    tagline: "Vehiculul tău, ora ta",
    body: "Te luăm de la adresa pe care ne-o dai, la ora pe care o alegi, cu Vito sau Sprinter. Varianta pentru zboruri la ore neacoperite de orar, pentru familii cu bagaj mult și pentru grupuri.",
    included: [
      "Preluare de la o adresă, nu dintr-o stație",
      "Ora plecării corelată cu ora zborului tău",
      "Preț ferm pentru tot vehiculul, comunicat în avans",
      "Ideal pentru grupuri, delegații și bagaj voluminos",
    ],
    cta: { label: "Cere o ofertă", href: "/inchirieri" },
    variant: "secondary" as const,
  },
];

const steps = [
  {
    title: "Spune-ne ora zborului",
    body: "Nu ora la care vrei să pleci — ora la care decolezi. Calculăm noi marja, cu traficul de pe centură inclus.",
  },
  {
    title: "Primești confirmarea",
    body: "Cod de rezervare pentru cursa regulată sau ofertă fermă pentru transferul privat, în cel mult 24 de ore.",
  },
  {
    title: "Te luăm de unde ai stabilit",
    body: "Din punctul de îmbarcare sau de la adresa ta. Șoferul te sună înainte să ajungă.",
  },
  {
    title: "Cobori la terminal",
    body: "Direct la plecări. Fără schimbări de mijloc de transport și fără ultimul kilometru cu bagajele în mână.",
  },
];

export default function AirportTransferPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            airportFaq ? [breadcrumb, faqJsonLd(airportFaq.items)] : breadcrumb,
          ),
        }}
      />

      <PageHeader
        eyebrow="Serviciu"
        title="Transfer aeroport Otopeni."
        lead="Din Târgu Neamț, Piatra Neamț, Roman și Bacău până la terminalul de plecări al Aeroportului Henri Coandă. Zilnic, cu loc rezervat sau cu vehicul doar pentru voi."
        scene="ambient"
      />

      <section className="relative container-page pb-24">
        <SectionAtmosphere align="left" />
        <Reveal>
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-hairline bg-surface md:aspect-[21/9]">
            <Parallax speed={0.12} className="absolute inset-0 scale-110">
              <Image
                src="/fleet/sprinter-aeroport.jpg"
                alt="Microbuz Mercedes-Benz Sprinter din flota Danca Go, oprit la terminalul aeroportului"
                fill
                priority
                sizes="(min-width: 1280px) 1200px, 100vw"
                className="object-cover"
              />
            </Parallax>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgb(5 5 5 / 0.75), transparent 60%), radial-gradient(70% 60% at 50% 100%, rgb(200 164 104 / 0.12), transparent 70%)",
              }}
            />
            <p className="absolute bottom-6 left-6 right-6 flex items-center gap-2.5 text-sm text-ink-muted md:bottom-8 md:left-8">
              <PlaneTakeoff className="size-4 shrink-0 text-accent" aria-hidden />
              Oprire la terminalul de plecări, Aeroportul Internațional Henri Coandă
            </p>
          </div>
        </Reveal>
      </section>

      {/* The route itself, flown as the reader scrolls. This is the section's
          one piece of theatre and it earns its place: it says "we take you to
          the aircraft" without a word of copy, and it costs one inline SVG. */}
      <section className="relative container-page pb-28">
        <SectionAtmosphere align="right" intensity={0.85} />
        <Reveal>
          <FlightScene
            from="Moldova"
            to="Otopeni"
            className="aspect-[16/9] w-full sm:aspect-[21/9]"
          />
        </Reveal>
      </section>

      <section className="relative container-page pb-28">
        <SectionAtmosphere align="centre" />
        <Reveal>
          <h2 className="text-headline text-gradient">
            <WordsUp>Două feluri de a ajunge la avion.</WordsUp>
          </h2>
          <ClipReveal className="mt-5">
            <p className="max-w-xl text-body-lg text-ink-muted">
              Nu încercăm să îți vindem varianta scumpă. Îți spunem când are sens
              fiecare dintre ele.
            </p>
          </ClipReveal>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {options.map((option) => (
            <Reveal key={option.title}>
              <TiltCard maxTilt={4} className="h-full">
                <Spotlight className="surface-card flex h-full flex-col overflow-hidden p-8 md:p-10" size={520}>
                  <span className="text-[0.6875rem] uppercase tracking-[0.14em] text-accent">
                    {option.tagline}
                  </span>
                  <h3 className="mt-4 text-title text-ink">{option.title}</h3>
                  <p className="mt-4 leading-relaxed text-ink-muted">{option.body}</p>

                  <ul className="mt-8 flex flex-col gap-3 border-t border-hairline pt-8">
                    {option.included.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink-muted">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-10 pt-0">
                    <Magnetic strength={0.2}>
                      <ButtonLink
                        href={option.cta.href}
                        variant={option.variant}
                        size="lg"
                        className="group"
                      >
                        {option.cta.label}
                        <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
                      </ButtonLink>
                    </Magnetic>
                  </div>
                </Spotlight>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative container-page pb-28">
        <SectionAtmosphere align="left" intensity={0.85} />
        <Reveal>
          <h2 className="text-title text-ink">
            <WordsUp>Curse regulate spre Otopeni</WordsUp>
          </h2>
          <p className="mt-3 max-w-xl text-ink-muted">
            Plecări zilnice. Prețurile sunt de persoană și includ TVA.
          </p>
        </Reveal>

        <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {airportRoutes.map((route) => (
            <RevealItem key={route.slug}>
              <TiltCard maxTilt={4} className="h-full">
                <Card className="h-full transition-transform duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1">
                  <Link
                    href={`/rute/${route.slug}`}
                    className="flex h-full flex-col justify-between gap-10 p-7"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">
                          {route.frequency}
                        </span>
                        <ArrowUpRight
                          aria-hidden
                          className="size-4 shrink-0 text-ink-faint transition-all duration-500 ease-[var(--ease-out-expo)] group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5 group-hover/card:text-accent"
                        />
                      </div>
                      <p className="mt-6 text-[1.375rem] font-medium leading-tight tracking-[-0.02em] text-ink">
                        {route.from}
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-[1.375rem] font-medium leading-tight tracking-[-0.02em] text-ink-muted">
                        <span aria-hidden className="text-accent">
                          ↓
                        </span>
                        Otopeni
                      </p>
                    </div>

                    <div className="flex items-end justify-between gap-4 border-t border-hairline pt-5">
                      <span className="flex items-center gap-1.5 text-sm text-ink-dim">
                        <Clock className="size-3.5" aria-hidden />
                        {formatDuration(route.durationMinutes)}
                      </span>
                      <span className="text-right">
                        <span className="block text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">
                          de la
                        </span>
                        <span className="text-lg font-medium tabular-nums text-ink">
                          {formatPrice(route.fromPrice)}
                        </span>
                      </span>
                    </div>
                  </Link>
                </Card>
              </TiltCard>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section className="relative container-page pb-28">
        <SectionAtmosphere align="right" />
        <Reveal>
          <h2 className="text-title text-ink">
            <WordsUp>Cum funcționează</WordsUp>
          </h2>
        </Reveal>

        <RevealGroup className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <RevealItem key={step.title}>
              <div className="flex h-full flex-col gap-3 bg-surface p-8">
                <span className="text-sm tabular-nums text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-[1.0625rem] font-medium tracking-[-0.015em] text-ink">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-ink-muted">{step.body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {airportFaq && (
        <section className="relative container-page pb-8">
        <SectionAtmosphere align="centre" intensity={0.85} />
          <Reveal>
            <h2 className="text-title text-ink">
              <WordsUp>Ce ne întreabă pasagerii</WordsUp>
            </h2>
          </Reveal>
          <FaqList items={airportFaq.items} className="mt-8 max-w-3xl" />
          <Reveal className="mt-10">
            <ButtonLink href="/faq" variant="ghost" size="md" className="group px-0">
              Toate întrebările frecvente
              <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
            </ButtonLink>
          </Reveal>
        </section>
      )}
    </>
  );
}
