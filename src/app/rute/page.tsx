import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { WordsUp } from "@/components/motion/text-reveal";
import { TiltCard } from "@/components/motion/magnetic";
import { featuredRoutes } from "@/lib/site";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { formatDuration, formatPrice } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Rute",
  description:
    "Toate rutele Danca Go: Târgu Neamț, Piatra Neamț, Roman și Bacău către București, Otopeni și Constanța.",
  path: "/rute",
});

const breadcrumb = breadcrumbJsonLd([
  { name: "Acasă", path: "/" },
  { name: "Rute", path: "/rute" },
]);

const hubs = [
  { key: "bucuresti", label: "Spre București" },
  { key: "otopeni", label: "Spre Aeroport Otopeni" },
  { key: "constanta", label: "Spre Constanța" },
] as const;

export default function RoutesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <PageHeader
        eyebrow="Rețeaua"
        title="Toate rutele noastre."
        lead="Legături directe între orașele din Moldova, capitală, aeroportul Otopeni și litoral — operate cu aceleași standarde pe fiecare kilometru."
        scene="ambient"
      />

      <div className="container-page flex flex-col gap-24 pb-24">
        {hubs.map((hub) => {
          const routes = featuredRoutes.filter((route) => route.hub === hub.key);
          if (routes.length === 0) return null;

          return (
            <section key={hub.key}>
              <Reveal>
                <h2 className="text-title text-ink">
                  <WordsUp>{hub.label}</WordsUp>
                </h2>
              </Reveal>

              <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {routes.map((route) => (
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

                          <p className="mt-6 text-title text-ink">{route.from}</p>
                          <p className="mt-1 flex items-center gap-2.5 text-title text-ink-muted">
                            <span aria-hidden className="text-accent">
                              ↓
                            </span>
                            {route.to}
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
          );
        })}
      </div>
    </>
  );
}
