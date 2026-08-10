import { ArrowRight, Check, Phone } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { RentalForm } from "@/components/rentals/rental-form";
import { VehiclePhoto } from "@/components/fleet/vehicle-photo";
import { Card } from "@/components/ui/card";
import { Button, ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Magnetic, TiltCard } from "@/components/motion/magnetic";
import { ClipReveal, WordsUp } from "@/components/motion/text-reveal";
import { fleet, fleetNote, phoneDisplay, rentalBenefits, site } from "@/lib/site";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/inchirieri",
  title: "Închiriază autocar",
  description:
    "Închiriere de autocare și microbuze cu șofer, de la 12 locuri: Setra, Mercedes-Benz Sprinter și Vito. Ofertă fermă în 24 de ore.",
});

const breadcrumb = breadcrumbJsonLd([
  { name: "Acasă", path: "/" },
  { name: "Închirieri", path: "/inchirieri" },
]);

export default function RentalsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <PageHeader
        eyebrow="Închirieri"
        title="Autocarul tău, programul tău."
        lead="Închiriem autocare și microbuze cu șofer, de la 12 locuri în sus. Tu stabilești traseul și orele — noi ducem grupul la destinație."
        scene="feature"
      >
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Magnetic strength={0.22} className="w-full sm:w-auto">
            <ButtonLink
              href="#oferta"
              variant="accent"
              size="lg"
              className="group w-full sm:w-auto"
            >
              Solicită ofertă
              <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
            </ButtonLink>
          </Magnetic>

          {/* Plain anchor: `tel:` is a protocol handler, not a route for the
              client router to prefetch. */}
          <Button asChild variant="secondary" size="lg">
            <a href={`tel:${site.phones[0]}`}>
              <Phone className="size-4" aria-hidden />
              <span className="tabular-nums">{phoneDisplay(site.phones[0])}</span>
            </a>
          </Button>
        </div>
      </PageHeader>

      {/* --- Fleet showcase --- */}
      <section className="container-page pb-28">
        <Reveal className="max-w-2xl">
          <Eyebrow>Vehicule disponibile</Eyebrow>
          <h2 className="mt-6 text-headline text-gradient">
            <WordsUp>Alege după mărimea grupului.</WordsUp>
          </h2>
          <p className="mt-5 text-body-lg text-ink-muted">
            Dacă nu ești sigur ce ți se potrivește, spune-ne câți sunteți și îți
            recomandăm noi vehiculul.
          </p>
        </Reveal>

        <RevealGroup className="mt-14 grid gap-4 md:grid-cols-3">
          {fleet.map((vehicle) => (
            <RevealItem key={vehicle.slug}>
              <TiltCard maxTilt={4} className="h-full">
              <Card className="flex h-full flex-col transition-transform duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1" interactive={false}>
                {/* The photo scales inside its own clipped frame on hover —
                    the vehicle comes toward you, the card stays put. */}
                <div className="overflow-hidden rounded-t-[inherit]">
                  <VehiclePhoto
                    vehicle={vehicle}
                    className="rounded-b-none border-0 border-b border-hairline transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover/tilt:scale-[1.04]"
                  />
                </div>

                <div className="flex flex-1 flex-col p-7">
                  <p className="text-sm text-accent">{vehicle.seats}</p>
                  <h3 className="mt-2 text-title text-ink">{vehicle.name}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">
                    {vehicle.description}
                  </p>

                  <ul className="mt-6 flex flex-col gap-2 border-t border-hairline pt-5">
                    {vehicle.features.slice(0, 4).map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-ink-muted">
                        <Check className="size-3.5 shrink-0 text-accent" aria-hidden />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
              </TiltCard>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="mt-8">
          <p className="text-sm text-ink-dim">{fleetNote.title} Spune-ne câți sunteți.</p>
        </Reveal>
      </section>

      {/* --- Benefits --- */}
      <section className="border-t border-hairline">
        <div className="container-page py-28">
          <Reveal className="max-w-2xl">
            <Eyebrow>De ce noi</Eyebrow>
            <h2 className="mt-6 text-headline text-gradient">
              <WordsUp>Un autocar închiriat se judecă în detalii.</WordsUp>
            </h2>
          </Reveal>

          <RevealGroup className="mt-14 grid gap-x-12 gap-y-12 sm:grid-cols-2">
            {rentalBenefits.map((benefit, index) => (
              <RevealItem key={benefit.title}>
                <article className="border-t border-hairline pt-7">
                  <span className="text-sm tabular-nums text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 text-title text-ink">{benefit.title}</h3>
                  <p className="mt-3 max-w-md leading-relaxed text-ink-muted">{benefit.body}</p>
                </article>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* --- Quote form --- */}
      <section id="oferta" className="scroll-mt-28 border-t border-hairline">
        <div className="container-page grid gap-14 py-28 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
          <Reveal>
            <Eyebrow>Ofertă</Eyebrow>
            <h2 className="mt-6 text-headline text-gradient">
              <WordsUp>Spune-ne ce ai nevoie.</WordsUp>
            </h2>
            <ClipReveal className="mt-5">
              <p className="max-w-md text-body-lg text-ink-muted">
                Completezi în două minute, primești un preț ferm în cel mult 24 de
                ore. Fără costuri care apar la final.
              </p>
            </ClipReveal>

            <p className="mt-10 text-sm text-ink-muted">
              Preferi să vorbim direct?{" "}
              <a href={`tel:${site.phones[1]}`} className="text-accent hover:underline">
                {phoneDisplay(site.phones[1])}
              </a>
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <RentalForm kind="rental" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
