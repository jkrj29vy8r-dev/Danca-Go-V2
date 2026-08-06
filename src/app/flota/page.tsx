import type { Metadata } from "next";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { VehicleGallery } from "@/components/fleet/vehicle-gallery";
import { fleet, fleetNote } from "@/lib/site";

export const metadata: Metadata = {
  title: "Flota",
  description:
    "Un autocar Setra, mai multe microbuze Mercedes-Benz Sprinter de la 12 locuri și un Mercedes-Benz Vito — întreținute obsesiv și verificate înainte de fiecare cursă lungă.",
};

export default function FleetPage() {
  return (
    <>
      <PageHeader
        eyebrow="Flota"
        title="Vehicule pe care te poți baza."
        lead="Un autocar Setra, mai multe Sprintere de la 12 locuri și un Vito. Fiecare vehicul trece printr-o verificare tehnică înainte de orice cursă lungă."
      />

      <div className="container-page flex flex-col gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline pb-0">
        {fleet.map((vehicle, vehicleIndex) => (
          <Reveal key={vehicle.slug}>
            {/* items-center: the media column is much taller than the copy once the
                gallery is in, so left-aligned text left a large void beneath it. */}
            <article className="grid gap-10 bg-surface p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:items-center md:p-14">
              <div>
                <p className="text-sm tabular-nums text-accent">{vehicle.seats}</p>
                <h2 className="mt-3 text-headline text-gradient">{vehicle.name}</h2>
                <p className="mt-4 text-title text-ink-muted">{vehicle.headline}</p>
                <p className="mt-5 max-w-md leading-relaxed text-ink-muted">
                  {vehicle.description}
                </p>

                <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                  {vehicle.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-ink-muted">
                      <Check className="size-3.5 text-accent" aria-hidden />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-6">
                <VehicleGallery vehicle={vehicle} priority={vehicleIndex === 0} />

                <RevealGroup className="grid grid-cols-2 gap-px self-start overflow-hidden rounded-2xl border border-hairline bg-hairline">
                  {vehicle.specs.map((spec) => (
                    <RevealItem key={spec.label}>
                      <div className="flex h-full flex-col justify-between gap-8 bg-raised p-6">
                        <span className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">
                          {spec.label}
                        </span>
                        <span className="text-title font-medium text-ink">{spec.value}</span>
                      </div>
                    </RevealItem>
                  ))}
                </RevealGroup>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      {/* The list above is representative, not exhaustive — say so plainly
          rather than letting three entries read as the whole fleet. */}
      <div className="container-page pt-20 pb-24">
        <Reveal>
          <div className="surface-card relative overflow-hidden p-8 md:p-14">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(55% 70% at 15% 0%, rgb(200 164 104 / 0.12), transparent 70%)",
              }}
            />

            <div className="relative grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16">
              <div>
                <span aria-hidden className="flex items-center gap-2">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-0.5 w-10 rounded-full bg-hairline-strong" />
                  ))}
                  <span className="h-0.5 w-10 rounded-full bg-accent" />
                </span>
                <h2 className="mt-7 text-headline text-gradient">{fleetNote.title}</h2>
              </div>

              <div>
                <p className="max-w-xl text-body-lg leading-relaxed text-ink-muted">
                  {fleetNote.body}
                </p>
                <ButtonLink
                  href={fleetNote.cta.href}
                  variant="accent"
                  size="lg"
                  className="mt-9"
                >
                  {fleetNote.cta.label}
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </>
  );
}
