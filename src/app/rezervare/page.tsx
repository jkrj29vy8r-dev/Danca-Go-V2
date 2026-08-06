import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Info, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { SearchWidget } from "@/components/home/search-widget";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { searchTrips } from "@/lib/queries";
import { featuredRoutes, phoneDisplay, site } from "@/lib/site";
import { formatDuration, formatPrice, formatTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Rezervare",
  description:
    "Caută și rezervă bilete pentru cursele Danca Go. Plecări zilnice din Otopeni, București și Constanța.",
};

// Seat availability changes constantly — never serve a cached seat count.
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function BookingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const from = first(params.from);
  const to = first(params.to);
  const date = first(params.date);
  const seats = Number(first(params.seats) ?? 1) || 1;

  const hasQuery = Boolean(from && to && date);
  const result = hasQuery ? await searchTrips({ from, to, date, seats }) : null;

  return (
    <>
      <PageHeader
        eyebrow="Rezervare"
        title="Găsește-ți cursa."
        lead="Alege plecarea, destinația și data. Îți arătăm toate plecările disponibile, cu preț final și locuri rămase."
      >
        <div className="mt-12">
          <SearchWidget />
        </div>
      </PageHeader>

      <section className="container-page pb-24">
        {!hasQuery && <NoQueryState />}

        {result?.state === "unconfigured" && <UnconfiguredState />}

        {result?.state === "error" && (
          <Notice tone="negative" title="Nu am putut încărca plecările">
            {result.message}
          </Notice>
        )}

        {result?.state === "ok" && result.trips.length === 0 && (
          <NoResultsState from={from!} to={to!} />
        )}

        {result?.state === "ok" && result.trips.length > 0 && (
          <>
            <Reveal>
              <p className="text-sm text-ink-dim">
                {result.trips.length}{" "}
                {result.trips.length === 1 ? "plecare disponibilă" : "plecări disponibile"}
              </p>
            </Reveal>

            <RevealGroup className="mt-6 flex flex-col gap-3">
              {result.trips.map((trip) => (
                <RevealItem key={trip.id}>
                  <Card>
                    <article className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-7">
                      <div className="flex items-center gap-6 md:gap-10">
                        <Timeline
                          departure={formatTime(trip.departure_time)}
                          arrival={formatTime(trip.arrival_time)}
                          origin={trip.origin_name}
                          destination={trip.dest_name}
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-ink-dim">
                        <span className="flex items-center gap-1.5">
                          <Clock className="size-3.5" aria-hidden />
                          {formatDuration(trip.duration_minutes)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="size-3.5" aria-hidden />
                          {trip.seats_available} locuri
                        </span>
                        {trip.vehicle_name && <span>{trip.vehicle_name}</span>}
                      </div>

                      <div className="flex items-center justify-between gap-5 md:justify-end">
                        <span className="text-right">
                          <span className="block text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">
                            {seats > 1 ? `${seats} pasageri` : "preț / pasager"}
                          </span>
                          <span className="text-xl font-medium tabular-nums text-ink">
                            {formatPrice(trip.price * seats)}
                          </span>
                        </span>

                        <ButtonLink
                          href={`/rezervare/${trip.id}?seats=${seats}`}
                          variant="accent"
                          size="md"
                          className="group shrink-0"
                        >
                          Alege
                          <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
                        </ButtonLink>
                      </div>
                    </article>
                  </Card>
                </RevealItem>
              ))}
            </RevealGroup>
          </>
        )}
      </section>
    </>
  );
}

function Timeline({
  departure,
  arrival,
  origin,
  destination,
}: {
  departure: string;
  arrival: string;
  origin: string;
  destination: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div>
        <p className="text-xl font-medium tabular-nums text-ink">{departure}</p>
        <p className="mt-0.5 text-sm text-ink-muted">{origin}</p>
      </div>

      <div aria-hidden className="flex w-16 items-center gap-1.5 md:w-24">
        <span className="size-1.5 rounded-full bg-accent" />
        <span className="h-px flex-1 bg-hairline-strong" />
        <span className="size-1.5 rounded-full border border-accent" />
      </div>

      <div>
        <p className="text-xl font-medium tabular-nums text-ink">{arrival}</p>
        <p className="mt-0.5 text-sm text-ink-muted">{destination}</p>
      </div>
    </div>
  );
}

function NoQueryState() {
  return (
    <Reveal>
      <p className="text-sm text-ink-dim">Rute populare</p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {featuredRoutes.slice(0, 6).map((route) => (
          <li key={route.slug}>
            <Card>
              <Link
                href={`/rezervare?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}&seats=1`}
                className="flex items-center justify-between gap-4 p-6"
              >
                <span>
                  <span className="block text-ink">{route.from}</span>
                  <span className="block text-ink-muted">→ {route.to}</span>
                </span>
                <span className="text-sm tabular-nums text-accent">
                  {formatPrice(route.fromPrice)}
                </span>
              </Link>
            </Card>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

function NoResultsState({ from, to }: { from: string; to: string }) {
  return (
    <Notice tone="neutral" title="Nicio plecare pe această combinație">
      Nu am găsit curse {from} → {to} la data selectată. Încearcă o altă zi sau
      sună-ne la{" "}
      <a href={`tel:${site.phones[0]}`} className="text-accent hover:underline">
        {phoneDisplay(site.phones[0])}
      </a>{" "}
      — de multe ori putem găsi o soluție.
    </Notice>
  );
}

function UnconfiguredState() {
  return (
    <Notice tone="neutral" title="Orarul live nu este încă conectat">
      Baza de date nu este configurată în acest mediu. Rulează migrarea din{" "}
      <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[0.8125rem] text-ink">
        supabase/migrations
      </code>{" "}
      și setează variabilele de mediu pentru a activa căutarea.
    </Notice>
  );
}

function Notice({
  title,
  children,
  tone,
}: {
  title: string;
  children: React.ReactNode;
  tone: "neutral" | "negative";
}) {
  return (
    <Reveal>
      <div className="surface-card flex gap-4 p-7">
        <Info
          className={tone === "negative" ? "size-5 shrink-0 text-negative" : "size-5 shrink-0 text-accent"}
          aria-hidden
        />
        <div>
          <h2 className="font-medium text-ink">{title}</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">{children}</p>
        </div>
      </div>
    </Reveal>
  );
}
