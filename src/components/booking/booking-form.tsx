"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight, Check } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { bookingSchema, type BookingInput } from "@/lib/schemas";
import { createBooking } from "@/app/rezervare/[tripId]/actions";
import { cn, formatPrice } from "@/lib/utils";

export function BookingForm({
  tripId,
  seatCount,
  unitPrice,
  maxSeats,
}: {
  tripId: string;
  seatCount: number;
  unitPrice: number;
  maxSeats: number;
}) {
  const [confirmation, setConfirmation] = useState<{ reference: string; total: number } | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      trip_id: tripId,
      seat_count: Math.min(seatCount, maxSeats) || 1,
    },
  });

  const seats = watch("seat_count") || 1;

  const onSubmit = handleSubmit(async (values) => {
    const result = await createBooking(values);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    setConfirmation({ reference: result.reference, total: result.total });
    toast.success("Rezervare confirmată.");
  });

  if (confirmation) {
    return (
      <div className="surface-card p-8 md:p-10">
        <span className="grid size-11 place-items-center rounded-full bg-accent/15 text-accent">
          <Check className="size-5" aria-hidden />
        </span>

        <h2 className="mt-6 text-title text-ink">Rezervarea ta este înregistrată</h2>
        <p className="mt-3 max-w-md leading-relaxed text-ink-muted">
          Îți trimitem confirmarea pe email. Prezintă codul de mai jos la îmbarcare —
          plata se face la urcarea în autocar.
        </p>

        <dl className="mt-8 flex flex-col gap-3 border-t border-hairline pt-6">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-sm text-ink-dim">Cod rezervare</dt>
            <dd className="font-mono text-lg text-accent">{confirmation.reference}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-sm text-ink-dim">Total de plată</dt>
            <dd className="text-lg font-medium tabular-nums text-ink">
              {formatPrice(confirmation.total)}
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/" variant="secondary" size="md">
            Înapoi la prima pagină
          </ButtonLink>
          <ButtonLink href="/rezervare" variant="ghost" size="md">
            Caută altă cursă
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="surface-card flex flex-col gap-5 p-8 md:p-10" noValidate>
      <input type="hidden" {...register("trip_id")} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nume complet" error={errors.contact_name?.message}>
          <input {...register("contact_name")} autoComplete="name" className={inputClass} />
        </Field>

        <Field label="Număr de locuri" error={errors.seat_count?.message}>
          <select
            {...register("seat_count", { valueAsNumber: true })}
            className={cn(inputClass, "[&>option]:bg-raised")}
          >
            {Array.from({ length: Math.min(maxSeats, 20) }, (_, index) => index + 1).map((count) => (
              <option key={count} value={count}>
                {count} {count === 1 ? "loc" : "locuri"}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Email" error={errors.contact_email?.message}>
          <input {...register("contact_email")} type="email" autoComplete="email" className={inputClass} />
        </Field>

        <Field label="Telefon" error={errors.contact_phone?.message}>
          <input {...register("contact_phone")} type="tel" autoComplete="tel" className={inputClass} />
        </Field>
      </div>

      <Field label="Observații (opțional)" error={errors.notes?.message}>
        <textarea {...register("notes")} rows={3} className={cn(inputClass, "resize-y")} />
      </Field>

      <div className="mt-2 flex items-center justify-between gap-6 border-t border-hairline pt-6">
        <span>
          <span className="block text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">
            Total
          </span>
          <span className="text-xl font-medium tabular-nums text-ink">
            {formatPrice(unitPrice * seats)}
          </span>
        </span>

        <Button type="submit" variant="accent" size="lg" disabled={isSubmitting} className="group">
          {isSubmitting ? "Se procesează…" : "Confirmă rezervarea"}
          <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
        </Button>
      </div>

      <p className="text-xs leading-relaxed text-ink-dim">
        Prin confirmare accepți{" "}
        <Link href="/legal/termeni" className="text-ink-muted underline underline-offset-2">
          termenii și condițiile
        </Link>
        . Plata se face la îmbarcare.
      </p>
    </form>
  );
}

const inputClass = cn(
  "w-full rounded-xl border border-hairline bg-white/[0.03] px-4 py-3",
  "text-[0.9375rem] text-ink placeholder:text-ink-faint outline-none",
  "transition-colors duration-300 hover:border-hairline-strong",
  "focus:border-accent/60 focus:bg-white/[0.05]",
);

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">{label}</span>
      {children}
      {error && <span className="text-xs text-negative">{error}</span>}
    </label>
  );
}
