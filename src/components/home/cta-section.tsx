import { ArrowRight, Bus, Phone } from "lucide-react";
import { ScaleIn } from "@/components/motion/scroll-effects";
import { ButtonLink } from "@/components/ui/button";
import { phoneDisplay, site } from "@/lib/site";

/**
 * Final CTA. Scroll-scrubbed scale-in rather than a discrete fade: the panel
 * settles into place as the user arrives at it, which lands harder than
 * something that has already finished animating by the time it's read.
 */
export function CtaSection() {
  return (
    <section className="container-page pb-8">
      <ScaleIn>
        <div className="surface-card relative overflow-hidden px-8 py-24 text-center md:px-16 md:py-32">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 80% at 50% 0%, rgb(200 164 104 / 0.16), transparent 70%)",
            }}
          />

          {/* Horizon line: a single lit rule across the panel */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgb(200 164 104 / 0.55), transparent)",
            }}
          />

          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-headline text-gradient">
              Următoarea cursă pleacă în curând.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-body-lg text-ink-muted">
              Rezervă online în mai puțin de un minut sau sună-ne — răspundem
              personal, șapte zile din șapte.
            </p>

            <div className="mt-11 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink
                href="/rezervare"
                variant="accent"
                size="lg"
                className="group w-full sm:w-auto"
              >
                Rezervă bilet
                <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
              </ButtonLink>

              <ButtonLink
                href="/inchirieri"
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                <Bus className="size-4" aria-hidden />
                Închiriază autocar
              </ButtonLink>
            </div>

            <a
              href={`tel:${site.phones[0]}`}
              className="mt-8 inline-flex items-center gap-2 text-sm text-ink-dim transition-colors duration-300 hover:text-ink"
            >
              <Phone className="size-3.5" aria-hidden />
              <span className="tabular-nums">{phoneDisplay(site.phones[0])}</span>
            </a>
          </div>
        </div>
      </ScaleIn>
    </section>
  );
}
