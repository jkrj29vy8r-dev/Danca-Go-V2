import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ButtonLink } from "@/components/ui/button";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { featuredRoutes } from "@/lib/site";
import { formatDuration, formatPrice } from "@/lib/utils";

export function RoutesSection() {
  return (
    <section className="container-page py-28 md:py-40">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <Reveal className="max-w-2xl">
          <Eyebrow>Rețeaua</Eyebrow>
          <h2 className="mt-6 text-headline text-gradient">
            Nouă orașe. O singură companie.
          </h2>
          <p className="mt-5 max-w-lg text-body-lg text-ink-muted">
            Legături directe între aeroport, capitală, Moldova și litoral —
            operate zilnic, cu aceleași standarde pe fiecare kilometru.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <ButtonLink href="/rute" variant="secondary" size="md" className="group">
            Toate rutele
            <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
          </ButtonLink>
        </Reveal>
      </div>

      <RevealGroup className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featuredRoutes.map((route) => (
          <RevealItem key={route.slug}>
            <Card className="h-full">
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
                    <span aria-hidden className="text-accent">↓</span>
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
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
