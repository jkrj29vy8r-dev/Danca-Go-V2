import type { Metadata } from "next";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { VehicleGallery } from "@/components/fleet/vehicle-gallery";
import { fleet } from "@/lib/site";

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
            <article className="grid gap-10 bg-surface p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:p-14">
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

      <div className="container-page py-20">
        <Reveal className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-body-lg text-ink-muted">
            Ai nevoie de un vehicul pentru un grup? Îți pregătim o ofertă în 24 de ore.
          </p>
          <ButtonLink href="/inchirieri" variant="secondary" size="lg">
            Cere o ofertă
          </ButtonLink>
        </Reveal>
      </div>
    </>
  );
}
