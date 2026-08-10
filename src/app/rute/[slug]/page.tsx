import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock,
  MapPin,
  Ticket,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FaqList } from "@/components/faq/faq-browser";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Magnetic, Spotlight, TiltCard } from "@/components/motion/magnetic";
import { ClipReveal, WordsUp } from "@/components/motion/text-reveal";
import { ScaleIn } from "@/components/motion/scroll-effects";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { faqJsonLd, type FaqItem } from "@/lib/faq";
import {
  featuredRoutes,
  getRoute,
  intermediateStops,
  site,
  type FeaturedRoute,
} from "@/lib/site";
import { formatDuration, formatPrice } from "@/lib/utils";

/** Nine static pages — cheap to pre-render, and each one is a landing page. */
export function generateStaticParams() {
  return featuredRoutes.map((route) => ({ slug: route.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const route = getRoute(slug);
  if (!route) return {};

  const title = `${route.from} — ${route.to}`;

  return {
    title,
    description: `Curse ${route.frequency.toLowerCase()} ${route.from} — ${route.to}, aproximativ ${formatDuration(
      route.durationMinutes,
    )}, de la ${formatPrice(route.fromPrice)}. Rezervă online în mai puțin de un minut.`,
    alternates: { canonical: `/rute/${route.slug}` },
    openGraph: {
      title: `${title} — ${site.name}`,
      description: `Plecări ${route.frequency.toLowerCase()}, de la ${formatPrice(route.fromPrice)}.`,
    },
  };
}

const bookingHref = (route: FeaturedRoute, reverse = false) =>
  `/rezervare?from=${encodeURIComponent(reverse ? route.to : route.from)}&to=${encodeURIComponent(
    reverse ? route.from : route.to,
  )}&seats=1`;

/**
 * Route-level questions, generated from the route's own data.
 *
 * Answers stay deliberately vague where the operational detail is not yet
 * confirmed — the exact boarding point, for instance. Naming a station we
 * have not verified would be worse than telling the passenger we confirm it
 * at booking.
 */
function routeFaq(route: FeaturedRoute): FaqItem[] {
  const stops = intermediateStops(route);

  return [
    {
      question: `Cât durează cursa ${route.from} — ${route.to}?`,
      answer: `Aproximativ ${formatDuration(
        route.durationMinutes,
      )}, în condiții normale de trafic. Pe cursele spre București și aeroport lăsăm marjă pentru intrarea în capitală.`,
    },
    {
      question: "Cât costă un bilet?",
      answer: `De la ${formatPrice(
        route.fromPrice,
      )} de persoană, TVA inclus. Prețul afișat la rezervare este prețul final: nu adăugăm comisioane și nici taxe la îmbarcare.`,
    },
    {
      question: "De unde se face îmbarcarea?",
      answer:
        "Punctul exact de îmbarcare ți-l confirmăm la rezervare, împreună cu ora la care trebuie să fii acolo. Recomandăm să ajungi cu 15 minute înainte de plecare.",
    },
    {
      question: "Cursa circulă și în sens invers?",
      answer: `Da. Ruta este operată în ambele sensuri, ${route.to} — ${route.from} având plecări în aceleași zile.`,
    },
    stops.length > 0
      ? {
          question: "Pot urca dintr-o localitate de pe traseu?",
          answer: `Da. Pe acest traseu oprim în ${stops.join(", ")}. Spune-ne la rezervare de unde urci și îți confirmăm punctul de îmbarcare.`,
          }
      : {
          question: "Ce vehicul face cursa?",
          answer:
            "Autocarul Setra sau unul dintre microbuzele Mercedes-Benz Sprinter, în funcție de numărul de pasageri de pe cursa respectivă.",
        },
    {
      question: "Ce bagaje pot lua?",
      answer:
        "Un bagaj de cală și un bagaj de mână, incluse în preț. Pentru bagaje suplimentare sau voluminoase, anunță-ne la rezervare.",
    },
  ];
}

const inclusions = [
  "Loc rezervat pe numele tău",
  "Un bagaj de cală și unul de mână",
  "Climatizare și scaune individuale",
  "Preț final, fără taxe la îmbarcare",
];

export default async function RoutePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const route = getRoute(slug);
  if (!route) notFound();

  const stops = intermediateStops(route);
  const faq = routeFaq(route);
  const related = featuredRoutes.filter(
    (item) => item.hub === route.hub && item.slug !== route.slug,
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BusTrip",
    name: `${route.from} — ${route.to}`,
    provider: {
      "@type": "TransportationCompany",
      name: site.name,
      url: site.url,
      telephone: site.phones[0],
    },
    departureBusStop: { "@type": "BusStation", name: route.from },
    arrivalBusStop: { "@type": "BusStation", name: route.to },
    offers: {
      "@type": "Offer",
      price: (route.fromPrice / 100).toFixed(2),
      priceCurrency: "RON",
      availability: "https://schema.org/InStock",
      url: `${site.url}/rute/${route.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([structuredData, faqJsonLd(faq)]),
        }}
      />

      <PageHeader
        eyebrow="Rută"
        title={`${route.from} → ${route.to}`}
        // The glyph is its own token after the word split, so it picks up the
        // accent colour and swaps to the word "spre" in the accessibility tree
        // — while textContent stays a clean "Roman → Constanța".
        titleHighlight="→"
        titleHighlightLabel="spre"
        scene="ambient"
        lead={`Plecări ${route.frequency.toLowerCase()}, aproximativ ${formatDuration(
          route.durationMinutes,
        )} de drum, cu opriri anunțate din timp. Rezervi online și primești codul pe loc.`}
      >
        {/* PageHeader already staggers its children in — no Reveal here, or
            the block would animate twice. */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Magnetic strength={0.2} className="w-full sm:w-auto">
            <ButtonLink
              href={bookingHref(route)}
              variant="accent"
              size="lg"
              className="group w-full sm:w-auto"
            >
              <Ticket className="size-4" aria-hidden />
              Rezervă pe această rută
              <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
            </ButtonLink>
          </Magnetic>

          <ButtonLink
            href={bookingHref(route, true)}
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto"
          >
            <ArrowLeftRight className="size-4" aria-hidden />
            Sensul invers
          </ButtonLink>
        </div>
      </PageHeader>

      <section className="container-page pb-24">
        <RevealGroup className="grid gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Clock,
              label: "Durată estimată",
              value: formatDuration(route.durationMinutes),
            },
            {
              icon: Ticket,
              label: "Preț de la",
              value: formatPrice(route.fromPrice),
            },
            { icon: CalendarDays, label: "Frecvență", value: route.frequency },
            {
              icon: MapPin,
              label: "Opriri pe traseu",
              value: stops.length > 0 ? String(stops.length) : "Directă",
            },
          ].map((fact) => (
            <RevealItem key={fact.label}>
              <div className="flex h-full flex-col gap-3 bg-surface p-8">
                <fact.icon className="size-4 text-accent" aria-hidden />
                <span className="text-[1.75rem] font-medium leading-none tracking-[-0.03em] text-ink">
                  {fact.value}
                </span>
                <span className="text-sm text-ink-muted">{fact.label}</span>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section className="container-page pb-28">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <Reveal>
              <h2 className="text-headline text-gradient">
                <WordsUp>Traseul, pas cu pas.</WordsUp>
              </h2>
              <p className="mt-5 max-w-md leading-relaxed text-ink-muted">
                {stops.length > 0
                  ? "Oprim în fiecare dintre localitățile de mai jos. Dacă urci dintr-una dintre ele, spune-ne la rezervare și îți confirmăm punctul exact."
                  : "Cursă directă, fără opriri intermediare programate."}
              </p>
            </Reveal>

            <Reveal className="mt-10" delay={0.05}>
              <ol className="relative flex flex-col gap-7 border-l border-hairline pl-8">
                <Stop name={route.from} role="Plecare" accent />
                {stops.map((stop) => (
                  <Stop key={stop} name={stop} role="Oprire" />
                ))}
                <Stop name={route.to} role="Sosire" accent />
              </ol>
            </Reveal>
          </div>

          <div>
            <Reveal>
              <h2 className="text-title text-ink">
                <WordsUp>Ce include biletul</WordsUp>
              </h2>
            </Reveal>

            <ClipReveal className="mt-8">
              <ul className="flex flex-col gap-4">
                {inclusions.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3.5 border-b border-hairline pb-4 leading-relaxed text-ink-muted last:border-b-0"
                  >
                    <Check className="mt-1 size-4 shrink-0 text-accent" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </ClipReveal>

            <ScaleIn className="mt-10">
              <Spotlight className="surface-card overflow-hidden p-8" size={480}>
                <h3 className="text-[1.0625rem] font-medium tracking-[-0.015em] text-ink">
                  Călătoriți în grup?
                </h3>
                <p className="mt-3 leading-relaxed text-ink-muted">
                  De la 12 persoane în sus, un vehicul închiriat doar pentru voi
                  costă adesea mai puțin decât biletele individuale — și pleacă la ora
                  pe care o alegeți.
                </p>
                <ButtonLink href="/inchirieri" variant="secondary" size="md" className="group mt-6">
                  Cere o ofertă
                  <ArrowUpRight className="size-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </ButtonLink>
              </Spotlight>
            </ScaleIn>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-page pb-28">
          <Reveal>
            <h2 className="text-title text-ink">
              <WordsUp>{`Alte plecări spre ${route.to}`}</WordsUp>
            </h2>
          </Reveal>

          <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <RevealItem key={item.slug}>
                <TiltCard maxTilt={4} className="h-full">
                <Card className="h-full transition-transform duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1">
                  <Link href={`/rute/${item.slug}`} className="flex h-full flex-col justify-between gap-8 p-7">
                    <div>
                      <span className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">
                        {item.frequency}
                      </span>
                      <p className="mt-5 text-[1.25rem] font-medium leading-tight tracking-[-0.02em] text-ink">
                        {item.from}
                      </p>
                      <p className="mt-1 text-sm text-ink-dim">spre {item.to}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-hairline pt-4">
                      <span className="text-sm text-ink-dim">
                        {formatDuration(item.durationMinutes)}
                      </span>
                      <span className="text-sm font-medium tabular-nums text-ink">
                        {formatPrice(item.fromPrice)}
                      </span>
                    </div>
                  </Link>
                </Card>
                </TiltCard>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>
      )}

      <section className="container-page pb-8">
        <Reveal>
          <h2 className="text-title text-ink">Întrebări despre această rută</h2>
        </Reveal>
        <FaqList items={faq} className="mt-8 max-w-3xl" />
      </section>
    </>
  );
}

function Stop({
  name,
  role,
  accent = false,
}: {
  name: string;
  role: string;
  accent?: boolean;
}) {
  return (
    <li className="relative">
      <span
        aria-hidden
        className={
          accent
            ? "absolute -left-[2.125rem] top-1.5 size-2.5 rounded-full bg-accent ring-4 ring-base"
            : "absolute -left-[2rem] top-2 size-1.5 rounded-full bg-ink-faint ring-4 ring-base"
        }
      />
      <span className="block text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">
        {role}
      </span>
      <span
        className={
          accent
            ? "mt-1 block text-title text-ink"
            : "mt-1 block text-[1.0625rem] text-ink-muted"
        }
      >
        {name}
      </span>
    </li>
  );
}
