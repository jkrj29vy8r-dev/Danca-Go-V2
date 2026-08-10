import { notFound } from "next/navigation";
import { Clock, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { BookingFlow } from "@/components/booking/booking-flow";
import { Reveal } from "@/components/motion/reveal";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { TripSearchResult } from "@/lib/types/database";
import { pageMetadata } from "@/lib/seo";
import { formatDateRo, formatDuration, formatPrice, formatTime } from "@/lib/utils";

/**
 * Not `generateMetadata`: the trip row is fetched once, by the page body
 * below, and a per-trip title isn't worth a second Supabase round-trip on a
 * route that's already noindexed and never meant to be linked externally.
 */
export const metadata = pageMetadata({
  title: "Finalizează rezervarea",
  description: "Ultimul pas al rezervării: datele pasagerilor și confirmarea locului.",
  noIndex: true,
});

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { tripId } = await params;
  const query = await searchParams;
  const requestedSeats = Number(
    Array.isArray(query.seats) ? query.seats[0] : (query.seats ?? 1),
  ) || 1;

  if (!isSupabaseConfigured) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trip_search")
    .select("*")
    .eq("id", tripId)
    .maybeSingle();

  if (error || !data) notFound();

  const trip = data as TripSearchResult;

  return (
    <>
      <PageHeader
        eyebrow="Finalizare"
        title={`${trip.origin_name} → ${trip.dest_name}`}
        lead={`${formatDateRo(trip.departure_date)}, plecare la ${formatTime(trip.departure_time)}.`}
      />

      <div className="container-page grid gap-10 pb-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-16">
        <Reveal>
          <aside className="surface-card sticky top-28 p-8">
            <h2 className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">
              Rezumatul cursei
            </h2>

            <div className="mt-7 flex items-center gap-4">
              <div>
                <p className="text-xl font-medium tabular-nums text-ink">
                  {formatTime(trip.departure_time)}
                </p>
                <p className="mt-0.5 text-sm text-ink-muted">{trip.origin_name}</p>
              </div>

              <div aria-hidden className="flex flex-1 items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-accent" />
                <span className="h-px flex-1 bg-hairline-strong" />
                <span className="size-1.5 rounded-full border border-accent" />
              </div>

              <div className="text-right">
                <p className="text-xl font-medium tabular-nums text-ink">
                  {formatTime(trip.arrival_time)}
                </p>
                <p className="mt-0.5 text-sm text-ink-muted">{trip.dest_name}</p>
              </div>
            </div>

            <dl className="mt-8 flex flex-col gap-3 border-t border-hairline pt-6 text-sm">
              <Row label="Data" value={formatDateRo(trip.departure_date)} />
              <Row
                label="Durată"
                value={formatDuration(trip.duration_minutes)}
                icon={<Clock className="size-3.5" aria-hidden />}
              />
              <Row
                label="Locuri libere"
                value={String(trip.seats_available)}
                icon={<Users className="size-3.5" aria-hidden />}
              />
              {trip.vehicle_name && <Row label="Vehicul" value={trip.vehicle_name} />}
              <Row label="Preț / pasager" value={formatPrice(trip.price)} />
            </dl>
          </aside>
        </Reveal>

        <Reveal delay={0.1}>
          <BookingFlow trip={trip} initialSeats={requestedSeats} />
        </Reveal>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="flex items-center gap-1.5 text-ink-dim">
        {icon}
        {label}
      </dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}
