import type { Metadata } from "next";
import { ArrowRight, Phone } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { RentalForm } from "@/components/rentals/rental-form";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { experienceExamples, formatCount, phoneDisplay, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Experiențe și excursii la cerere",
  description:
    "Organizăm transportul pentru ieșiri de o zi, deplasări de echipă și evenimente. Tu alegi traseul, noi ne ocupăm de drum.",
};

/**
 * Custom day trips.
 *
 * The line this page must not cross: Danca Go moves people, it does not sell
 * holidays. Every piece of copy here says "you choose the route, we handle the
 * driving" — no itineraries, no accommodation, no packages, no guides.
 */
export default function ExperiencesPage() {
  return (
    <>
      <PageHeader
        eyebrow="La cerere"
        title="Tu alegi traseul. Noi ducem grupul."
        lead="Organizăm transportul pentru ieșiri de o zi, deplasări de echipă și evenimente. Nu vindem pachete turistice — punem la dispoziție vehiculul, șoferul și un program făcut după al vostru."
      >
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="#oferta" variant="accent" size="lg" className="group">
            Solicită ofertă
            <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
          </ButtonLink>
          <ButtonLink href={`tel:${site.phones[0]}`} variant="secondary" size="lg">
            <Phone className="size-4" aria-hidden />
            <span className="tabular-nums">{phoneDisplay(site.phones[0])}</span>
          </ButtonLink>
        </div>
      </PageHeader>

      {/* --- Trust signals --- */}
      <section className="container-page pb-24">
        <RevealGroup className="grid gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline sm:grid-cols-3">
          {[
            { value: String(new Date().getFullYear() - site.founded), suffix: "ani", label: "de experiență pe drum" },
            { value: String(site.rating.score), suffix: `/${site.rating.max}`, label: "rating de la pasageri" },
            { value: `${formatCount(site.rating.count)}+`, suffix: "", label: "pasageri mulțumiți" },
          ].map((stat) => (
            <RevealItem key={stat.label}>
              <div className="flex h-full flex-col gap-3 bg-surface p-8 md:p-10">
                <span className="text-[2.5rem] font-semibold leading-none tracking-[-0.04em] tabular-nums text-ink">
                  {stat.value}
                  {stat.suffix && (
                    <span className="ml-1.5 text-lg font-normal tracking-normal text-ink-dim">
                      {stat.suffix}
                    </span>
                  )}
                </span>
                <span className="text-sm text-ink-muted">{stat.label}</span>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* --- Examples --- */}
      <section className="border-t border-hairline">
        <div className="container-page py-28">
          <Reveal className="max-w-2xl">
            <Eyebrow>Pentru ce ne sună lumea</Eyebrow>
            <h2 className="mt-6 text-headline text-gradient">
              Orice grup, orice traseu, orice oră.
            </h2>
            <p className="mt-5 text-body-lg text-ink-muted">
              Astea sunt cele mai frecvente. Dacă planul tău nu seamănă cu
              niciunul, spune-ne oricum — de obicei se poate.
            </p>
          </Reveal>

          <RevealGroup className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {experienceExamples.map((example, index) => (
              <RevealItem key={example.title}>
                <Card className="h-full">
                  <article className="flex h-full flex-col gap-4 p-7">
                    <span className="text-sm tabular-nums text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-title text-ink">{example.title}</h3>
                    <p className="leading-relaxed text-ink-muted">{example.body}</p>
                  </article>
                </Card>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* --- How it works --- */}
      <section className="border-t border-hairline">
        <div className="container-page py-28">
          <Reveal className="max-w-2xl">
            <Eyebrow>Cum funcționează</Eyebrow>
            <h2 className="mt-6 text-headline text-gradient">Trei pași, fără bătăi de cap.</h2>
          </Reveal>

          <RevealGroup className="mt-14 grid gap-10 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Ne spui planul",
                body: "Câți sunteți, de unde plecați, unde vreți să ajungeți și pe ce dată.",
              },
              {
                step: "02",
                title: "Primești oferta",
                body: "Preț ferm în cel mult 24 de ore, cu vehiculul potrivit pentru grup și tot ce include.",
              },
              {
                step: "03",
                title: "Vă luăm de la ușă",
                body: "Șoferul vă preia la ora stabilită și rămâne cu voi până la întoarcere.",
              },
            ].map((item) => (
              <RevealItem key={item.step}>
                <article className="border-t border-hairline pt-7">
                  <span className="text-sm tabular-nums text-accent">{item.step}</span>
                  <h3 className="mt-4 text-title text-ink">{item.title}</h3>
                  <p className="mt-3 leading-relaxed text-ink-muted">{item.body}</p>
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
            <h2 className="mt-6 text-headline text-gradient">Spune-ne planul.</h2>
            <p className="mt-5 max-w-md text-body-lg text-ink-muted">
              Nu trebuie să ai totul stabilit. Scrie-ne ce știi până acum și
              construim programul împreună.
            </p>

            <p className="mt-10 text-sm text-ink-muted">
              Preferi să vorbim direct?{" "}
              <a href={`tel:${site.phones[1]}`} className="text-accent hover:underline">
                {phoneDisplay(site.phones[1])}
              </a>
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <RentalForm kind="experience" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
