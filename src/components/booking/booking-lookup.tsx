"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2, Search, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lookupBooking, type BookingDetails } from "@/app/rezervare/[tripId]/actions";
import { bookingLookupSchema, type BookingLookupInput } from "@/lib/schemas";
import { phoneDisplay, site } from "@/lib/site";
import { cn, formatDateRo, formatPrice, formatTime } from "@/lib/utils";
import type { BookingStatus, PaymentStatus } from "@/lib/types/database";

const STATUS_COPY: Record<BookingStatus, { label: string; tone: string }> = {
  pending: { label: "În așteptare", tone: "text-warning" },
  confirmed: { label: "Confirmată", tone: "text-positive" },
  cancelled: { label: "Anulată", tone: "text-negative" },
  refunded: { label: "Rambursată", tone: "text-ink-muted" },
  completed: { label: "Efectuată", tone: "text-ink-muted" },
};

const PAYMENT_COPY: Record<PaymentStatus, string> = {
  unpaid: "Neachitată — se plătește la îmbarcare",
  paid: "Achitată",
  refunded: "Rambursată",
  failed: "Plată eșuată",
};

export function BookingLookup() {
  const [details, setDetails] = useState<BookingDetails | null>(null);
  const [notFound, setNotFound] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookingLookupInput>({
    resolver: zodResolver(bookingLookupSchema),
    defaultValues: { booking_ref: "", contact_email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setNotFound(null);
    const result = await lookupBooking(values);

    if (!result.ok) {
      setDetails(null);
      setNotFound(result.message);
      return;
    }

    setDetails(result.details);
  });

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={onSubmit} className="surface-card flex flex-col gap-5 p-6 md:p-8" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">
              Cod rezervare
            </span>
            <Input
              {...register("booking_ref")}
              id="booking_ref"
              placeholder="DG-XXXXXXX"
              autoComplete="off"
              spellCheck={false}
              className="font-mono uppercase"
              aria-invalid={errors.booking_ref ? true : undefined}
              aria-describedby={errors.booking_ref ? "booking_ref-error" : undefined}
            />
            {errors.booking_ref && (
              <span id="booking_ref-error" role="alert" className="text-xs text-negative">
                {errors.booking_ref.message}
              </span>
            )}
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">
              Email
            </span>
            <Input
              {...register("contact_email")}
              id="contact_email"
              type="email"
              autoComplete="email"
              aria-invalid={errors.contact_email ? true : undefined}
              aria-describedby={errors.contact_email ? "contact_email-error" : undefined}
            />
            {errors.contact_email && (
              <span id="contact_email-error" role="alert" className="text-xs text-negative">
                {errors.contact_email.message}
              </span>
            )}
          </label>
        </div>

        <Button
          type="submit"
          variant="accent"
          size="lg"
          disabled={isSubmitting}
          aria-busy={isSubmitting || undefined}
          className="self-start"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Se caută…
            </>
          ) : (
            <>
              <Search className="size-4" aria-hidden />
              Caută rezervarea
            </>
          )}
        </Button>
      </form>

      {/* Persistent live region: a screen reader only picks up content that
          changes *inside* an already-mounted aria-live node, so this wraps
          both outcomes rather than each being its own conditionally-mounted
          block. */}
      <div aria-live="polite" aria-atomic="true">
        {notFound && (
          <div className="surface-card p-6">
            <p className="text-ink">{notFound}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Verifică dacă ai copiat codul exact așa cum apare în email. Dacă tot
              nu merge, sună-ne la{" "}
              {/* Padded to clear the 24px minimum touch target. */}
              <a
                href={`tel:${site.phones[0]}`}
                className="-my-1 inline-block py-1 text-accent hover:underline"
              >
                {phoneDisplay(site.phones[0])}
              </a>{" "}
              și îl căutăm noi.
            </p>
          </div>
        )}

        {details && <BookingCard details={details} />}
      </div>
    </div>
  );
}

function BookingCard({ details }: { details: BookingDetails }) {
  const { booking, trip, passengers } = details;
  const status = STATUS_COPY[booking.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="surface-card p-6 md:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <span className="inline-flex items-center gap-2.5 text-ink">
          <Ticket className="size-4 text-accent" aria-hidden />
          <span className="font-mono text-lg text-accent">{booking.booking_ref}</span>
        </span>
        <span className={cn("text-sm", status.tone)}>{status.label}</span>
      </div>

      <div className="mt-7 flex items-center gap-4 border-t border-hairline pt-6">
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

      <dl className="mt-6 flex flex-col gap-2.5 border-t border-hairline pt-6 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-dim">Data</dt>
          <dd className="text-ink">{formatDateRo(trip.departure_date)}</dd>
        </div>
        {trip.vehicle_name && (
          <div className="flex justify-between gap-4">
            <dt className="text-ink-dim">Vehicul</dt>
            <dd className="text-ink">{trip.vehicle_name}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt className="text-ink-dim">Plată</dt>
          <dd className="text-right text-ink">{PAYMENT_COPY[booking.payment_status]}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-dim">Total</dt>
          <dd className="text-lg font-medium tabular-nums text-ink">
            {formatPrice(booking.total_price)}
          </dd>
        </div>
      </dl>

      {passengers.length > 0 && (
        <div className="mt-6 border-t border-hairline pt-6">
          <h3 className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">
            Pasageri ({passengers.length})
          </h3>
          <ul className="mt-4 flex flex-col divide-y divide-hairline">
            {passengers.map((passenger) => (
              <li key={passenger.id} className="flex items-center justify-between gap-4 py-2.5">
                <span className="text-ink">{passenger.full_name}</span>
                <span className="text-sm text-ink-dim">
                  {passenger.is_child ? "Copil" : "Adult"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
