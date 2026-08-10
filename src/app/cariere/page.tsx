import type { Metadata } from "next";
import { ArrowUpRight, Check, Mail, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/magnetic";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { careerBenefits, hiringSteps, openRoles } from "@/lib/careers";
import { phoneDisplay, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cariere",
  description:
    "Posturi deschise la Danca Go: șoferi autocar și microbuz, șoferi transfer aeroport și dispecer. Vehicule întreținute, salariu la timp, timpi de odihnă respectați.",
  alternates: { canonical: "/cariere" },
};

/** mailto with the role already in the subject — one less thing to type. */
function applyHref(role?: string) {
  const subject = role ? `Aplicare: ${role}` : "Candidatură spontanată";
  return `mailto:${site.email}?subject=${encodeURIComponent(subject)}`;
}

export default function CareersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Cariere"
        title="Căutăm oameni care iau volanul în serios."
        lead="Suntem o echipă mică dintr-un oraș mic, care duce zilnic oameni la aeroport, la muncă și acasă. Dacă îți place drumul și nu faci rabat la siguranță, hai să vorbim."
      />

      <section className="container-page pb-28">
        <RevealGroup className="grid gap-x-12 gap-y-12 sm:grid-cols-2">
          {careerBenefits.map((benefit, index) => (
            <RevealItem key={benefit.title}>
              <article className="border-t border-hairline pt-7">
                <span className="text-sm tabular-nums text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-4 text-title text-ink">{benefit.title}</h2>
                <p className="mt-3 max-w-md leading-relaxed text-ink-muted">{benefit.body}</p>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section className="container-page pb-28">
        <Reveal>
          <h2 className="text-headline text-gradient">Posturi deschise</h2>
          <p className="mt-5 max-w-xl text-body-lg text-ink-muted">
            Angajăm constant pe rolurile de mai jos. Chiar dacă nu vezi exact poziția
            ta, trimite-ne CV-ul — flota crește.
          </p>
        </Reveal>

        <div className="mt-12 flex flex-col gap-5">
          {openRoles.map((role) => (
            <Reveal key={role.slug}>
              <TiltCard maxTilt={3}>
                <Card className="p-8 md:p-10">
                  <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
                    <div>
                      <span className="inline-block rounded-full border border-hairline px-3 py-1 text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">
                        {role.commitment}
                      </span>

                      <h3 className="mt-5 text-title text-ink">{role.title}</h3>

                      <p className="mt-3 flex items-start gap-2 text-sm text-ink-dim">
                        <MapPin className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden />
                        {role.location}
                      </p>

                      <p className="mt-5 max-w-md leading-relaxed text-ink-muted">
                        {role.summary}
                      </p>

                      <Button asChild variant="secondary" size="md" className="group mt-8">
                        <a href={applyHref(role.title)}>
                          Aplică pentru acest rol
                          <ArrowUpRight className="size-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </a>
                      </Button>
                    </div>

                    <div className="border-t border-hairline pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                      <h4 className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">
                        Ce îți cerem
                      </h4>
                      <ul className="mt-5 flex flex-col gap-2.5">
                        {role.requirements.map((requirement) => (
                          <li
                            key={requirement}
                            className="flex gap-3 text-sm leading-relaxed text-ink-muted"
                          >
                            <Check
                              className="mt-0.5 size-3.5 shrink-0 text-accent"
                              aria-hidden
                            />
                            {requirement}
                          </li>
                        ))}
                      </ul>

                      {role.niceToHave && (
                        <>
                          <h4 className="mt-7 text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">
                            Constituie avantaj
                          </h4>
                          <ul className="mt-4 flex flex-col gap-2">
                            {role.niceToHave.map((item) => (
                              <li key={item} className="text-sm text-ink-dim">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-page pb-28">
        <Reveal>
          <h2 className="text-title text-ink">Cum decurge angajarea</h2>
        </Reveal>

        <RevealGroup className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
          {hiringSteps.map((step, index) => (
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

      <section className="container-page pb-8">
        <Reveal>
          <div className="surface-card flex flex-col items-start gap-8 overflow-hidden p-8 md:flex-row md:items-center md:justify-between md:p-12">
            <div>
              <h2 className="text-title text-ink">Nu ai găsit rolul potrivit?</h2>
              <p className="mt-3 max-w-md leading-relaxed text-ink-muted">
                Trimite-ne oricum CV-ul. Păstrăm candidaturile și revenim când
                deschidem o poziție care ți se potrivește.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button asChild variant="primary" size="lg">
                <a href={applyHref()}>
                  <Mail className="size-4" aria-hidden />
                  Trimite CV-ul
                </a>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <a href={`tel:${site.phones[0]}`}>
                  <Phone className="size-4" aria-hidden />
                  <span className="tabular-nums">{phoneDisplay(site.phones[0])}</span>
                </a>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
