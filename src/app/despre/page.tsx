import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { formatCount, promises, site, stats } from "@/lib/site";

export const metadata: Metadata = {
  title: "Despre noi",
  description:
    "Danca Util Ideal SRL transportă pasageri din 2019 între Moldova, București, Otopeni și Constanța. Povestea, standardele și oamenii din spatele Danca Go.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Despre noi"
        title={`Din ${site.founded}, pe același drum.`}
        lead="Am început cu un singur vehicul și o rută. Astăzi conectăm zece orașe, cu aceeași obsesie pentru punctualitate cu care am plecat la drum."
      />

      <section className="container-page pb-24">
        <RevealGroup className="grid gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
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

      <section className="container-page pb-28">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <Reveal>
            <h2 className="text-headline text-gradient">
              O companie de familie, cu standarde de corporație.
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col gap-5 text-body-lg leading-relaxed text-ink-muted">
            <p>
              {site.legalName} este o companie românească de transport persoane,
              fondată în {site.founded}, cu sediul în {site.address.city}. Am crescut încet
              și deliberat:
              fiecare vehicul adăugat în flotă a venit după ce am fost siguri că
              îl putem întreține la standardul pe care îl promitem.
            </p>
            <p>
              Operăm curse regulate între orașele din Moldova, București, aeroportul
              Otopeni și Constanța, plus închirieri de autocare și microbuze de
              la 12 locuri.
              Suntem licențiați ARR, cu toate autorizațiile de transport rutier
              de persoane la zi.
            </p>
            <p>
              Rating-ul nostru de {site.rating.score}/{site.rating.max}, strâns
              de la peste {formatCount(site.rating.count)} de pasageri, nu vine din marketing.
              Vine din faptul că plecăm la ora anunțată.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-page pb-28">
        <Reveal>
          <h2 className="text-title text-ink">Ce garantăm, de fiecare dată</h2>
        </Reveal>

        <RevealGroup className="mt-10 grid gap-x-12 gap-y-12 sm:grid-cols-2">
          {promises.map((promise, index) => (
            <RevealItem key={promise.title}>
              <article className="border-t border-hairline pt-7">
                <span className="text-sm tabular-nums text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-title text-ink">{promise.title}</h3>
                <p className="mt-3 max-w-md leading-relaxed text-ink-muted">{promise.body}</p>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="mt-16">
          <ButtonLink href="/contact" variant="secondary" size="lg">
            Vorbește cu noi
          </ButtonLink>
        </Reveal>
      </section>
    </>
  );
}
