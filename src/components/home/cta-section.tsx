import { ArrowRight, Phone } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { phoneDisplay, site } from "@/lib/site";

export function CtaSection() {
  return (
    <section className="container-page pb-8">
      <Reveal>
        <div className="surface-card relative overflow-hidden px-8 py-20 text-center md:px-16 md:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 80% at 50% 0%, rgb(200 164 104 / 0.14), transparent 70%)",
            }}
          />

          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-headline text-gradient">Următoarea cursă pleacă în curând.</h2>
            <p className="mx-auto mt-5 max-w-lg text-body-lg text-ink-muted">
              Rezervă online în mai puțin de un minut sau sună-ne — răspundem
              personal, șapte zile din șapte.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href="/rezervare" variant="accent" size="lg" className="group w-full sm:w-auto">
                Rezervă un bilet
                <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
              </ButtonLink>

              <ButtonLink
                href={`tel:${site.phones[0]}`}
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                <Phone className="size-4" aria-hidden />
                <span className="tabular-nums">{phoneDisplay(site.phones[0])}</span>
              </ButtonLink>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
