"use client";

import {
  cloneElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from "react";
import Link from "next/link";
import { useFieldArray, useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Baby, Check, Clock, Loader2, Users } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { createBooking } from "@/app/rezervare/[tripId]/actions";
import { passengerDetailsSchema, type PassengerDetailsInput } from "@/lib/schemas";
import { activeProvider, paymentCopy } from "@/lib/payments";
import type { TripSearchResult } from "@/lib/types/database";
import { cn, formatDateRo, formatPrice, formatTime } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

const STEPS = [
  { id: "passengers", label: "Pasageri" },
  { id: "review", label: "Verificare" },
  { id: "done", label: "Confirmare" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

type Confirmation = { reference: string; total: number; holdExpiresAt: string | null };

/**
 * Checkout, in three steps: passenger details → review → confirmation.
 *
 * The whole flow is one client component holding one form. Splitting it across
 * routes would mean either a server round-trip per step or stashing
 * half-finished passenger data somewhere; keeping it local means Back is free
 * and nothing is written until the customer actually confirms.
 */
export function BookingFlow({
  trip,
  initialSeats,
}: {
  trip: TripSearchResult;
  initialSeats: number;
}) {
  const maxSeats = Math.max(1, Math.min(trip.seats_available, 20));
  const seats = Math.max(1, Math.min(initialSeats, maxSeats));

  const [step, setStep] = useState<StepId>("passengers");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const form = useForm<PassengerDetailsInput>({
    resolver: zodResolver(passengerDetailsSchema),
    mode: "onTouched",
    defaultValues: {
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      notes: "",
      passengers: Array.from({ length: seats }, () => ({ full_name: "", is_child: false })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "passengers",
  });

  const values = form.watch();
  const total = trip.price * fields.length;

  const goReview = form.handleSubmit(() => setStep("review"));

  const submit = async () => {
    const result = await createBooking({
      trip_id: trip.id,
      contact_name: values.contact_name,
      contact_email: values.contact_email,
      contact_phone: values.contact_phone,
      notes: values.notes,
      passengers: values.passengers,
    });

    if (!result.ok) {
      toast.error(result.message);
      // Availability may have changed while they were filling the form —
      // send them back rather than leaving them on a dead review screen.
      setStep("passengers");
      return;
    }

    setConfirmation({
      reference: result.reference,
      total: result.total,
      holdExpiresAt: result.holdExpiresAt,
    });
    setStep("done");
  };

  const activeIndex = STEPS.findIndex((s) => s.id === step);

  // Each step swaps the entire view under the stepper — a screen reader user
  // who just pressed "Continuă" needs that announced, not left focused on a
  // button that no longer exists in the DOM. A tabIndex={-1} region that gets
  // programmatically focused on every step change (but not on first mount,
  // where it would steal focus from wherever the page itself put it) is the
  // standard pattern for this: focusing an unlabelled container makes a
  // screen reader read forward from it, effectively announcing the new
  // step's heading and content as if the user had navigated there.
  const stepRegionRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    stepRegionRef.current?.focus();
  }, [step]);

  return (
    <div className="flex flex-col gap-8">
      <Stepper activeIndex={activeIndex} />

      <div ref={stepRegionRef} tabIndex={-1} className="outline-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            {step === "passengers" && (
              <PassengerStep
                form={form}
                fields={fields}
                append={append}
                remove={remove}
                maxSeats={maxSeats}
                unitPrice={trip.price}
                total={total}
                onNext={goReview}
              />
            )}

            {step === "review" && (
              <ReviewStep
                trip={trip}
                values={values}
                total={total}
                submitting={form.formState.isSubmitting}
                onBack={() => setStep("passengers")}
                onConfirm={submit}
              />
            )}

            {step === "done" && confirmation && (
              <ConfirmationStep trip={trip} confirmation={confirmation} seats={fields.length} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   STEPPER                                   */
/* -------------------------------------------------------------------------- */

function Stepper({ activeIndex }: { activeIndex: number }) {
  return (
    <ol className="flex items-center gap-3" aria-label="Pașii rezervării">
      {STEPS.map((s, index) => {
        const done = index < activeIndex;
        const active = index === activeIndex;

        return (
          <li key={s.id} className="flex flex-1 items-center gap-3">
            <span
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-full text-xs font-medium transition-colors duration-500",
                done && "bg-accent text-void",
                active && "border border-accent text-accent",
                !done && !active && "border border-hairline text-ink-faint",
              )}
              aria-current={active ? "step" : undefined}
            >
              {done ? <Check className="size-3.5" aria-hidden /> : index + 1}
            </span>

            <span
              className={cn(
                "hidden text-sm transition-colors duration-500 sm:block",
                active ? "text-ink" : "text-ink-dim",
              )}
            >
              {s.label}
            </span>

            {index < STEPS.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "h-px flex-1 transition-colors duration-500",
                  done ? "bg-accent" : "bg-hairline",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* -------------------------------------------------------------------------- */
/*                             STEP 1 — PASSENGERS                             */
/* -------------------------------------------------------------------------- */

type FormApi = UseFormReturn<PassengerDetailsInput>;

function PassengerStep({
  form,
  fields,
  append,
  remove,
  maxSeats,
  unitPrice,
  total,
  onNext,
}: {
  form: FormApi;
  fields: { id: string }[];
  append: (value: { full_name: string; is_child: boolean }) => void;
  remove: (index: number) => void;
  maxSeats: number;
  unitPrice: number;
  total: number;
  onNext: () => void;
}) {
  const { register, formState, watch, setValue } = form;
  const errors = formState.errors;

  return (
    <form onSubmit={onNext} className="surface-card flex flex-col gap-8 p-6 md:p-9" noValidate>
      <section>
        <h2 className="text-title text-ink">Cine călătorește</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Numele apar pe lista de îmbarcare, așa că trebuie completate pentru
          fiecare loc.
        </p>

        <ul className="mt-6 flex flex-col gap-3">
          {fields.map((field, index) => {
            const isChild = watch(`passengers.${index}.is_child`);

            return (
              <li
                key={field.id}
                className="rounded-2xl border border-hairline bg-white/[0.02] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">
                    Pasager {index + 1}
                  </span>

                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-xs text-ink-dim transition-colors duration-300 hover:text-negative"
                    >
                      Elimină
                    </button>
                  )}
                </div>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Input
                    {...register(`passengers.${index}.full_name`)}
                    placeholder="Nume și prenume"
                    autoComplete={index === 0 ? "name" : "off"}
                    aria-label={`Nume pasager ${index + 1}`}
                    aria-invalid={errors.passengers?.[index]?.full_name ? true : undefined}
                    aria-describedby={
                      errors.passengers?.[index]?.full_name
                        ? `passenger-${index}-error`
                        : undefined
                    }
                    className="flex-1"
                  />

                  <button
                    type="button"
                    onClick={() => setValue(`passengers.${index}.is_child`, !isChild)}
                    aria-pressed={isChild}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition-colors duration-300",
                      isChild
                        ? "border-accent/60 bg-accent/10 text-accent"
                        : "border-hairline text-ink-dim hover:text-ink",
                    )}
                  >
                    <Baby className="size-3.5" aria-hidden />
                    Copil
                  </button>
                </div>

                {errors.passengers?.[index]?.full_name && (
                  <p id={`passenger-${index}-error`} role="alert" className="mt-2 text-xs text-negative">
                    {errors.passengers[index]?.full_name?.message}
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        {fields.length < maxSeats && (
          <button
            type="button"
            onClick={() => append({ full_name: "", is_child: false })}
            className="mt-4 inline-flex items-center gap-2 text-sm text-ink-muted transition-colors duration-300 hover:text-accent"
          >
            <Users className="size-3.5" aria-hidden />
            Adaugă un pasager · {formatPrice(unitPrice)}
          </button>
        )}
      </section>

      <section className="border-t border-hairline pt-8">
        <h2 className="text-title text-ink">Date de contact</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Aici trimitem confirmarea și te anunțăm dacă apare orice schimbare de orar.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Nume complet" error={errors.contact_name?.message}>
            <Input {...register("contact_name")} autoComplete="name" />
          </Field>

          <Field label="Telefon" error={errors.contact_phone?.message}>
            <Input {...register("contact_phone")} type="tel" autoComplete="tel" />
          </Field>

          <Field label="Email" error={errors.contact_email?.message} className="sm:col-span-2">
            <Input {...register("contact_email")} type="email" autoComplete="email" />
          </Field>

          <Field label="Observații (opțional)" className="sm:col-span-2">
            <Textarea {...register("notes")} rows={3} placeholder="Bagaj voluminos, stație preferată…" />
          </Field>
        </div>
      </section>

      <div className="flex flex-col gap-4 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
        <span>
          <span className="block text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">
            Total · {fields.length} {fields.length === 1 ? "loc" : "locuri"}
          </span>
          <span className="text-xl font-medium tabular-nums text-ink">{formatPrice(total)}</span>
        </span>

        <Button type="submit" variant="accent" size="lg" className="group w-full sm:w-auto">
          Continuă
          <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
        </Button>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*                               STEP 2 — REVIEW                               */
/* -------------------------------------------------------------------------- */

function ReviewStep({
  trip,
  values,
  total,
  submitting,
  onBack,
  onConfirm,
}: {
  trip: TripSearchResult;
  values: PassengerDetailsInput;
  total: number;
  submitting: boolean;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const payment = paymentCopy[activeProvider];

  return (
    <div className="surface-card flex flex-col gap-8 p-6 md:p-9">
      <section>
        <h2 className="text-title text-ink">Verifică rezervarea</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Nimic nu este rezervat până nu confirmi.
        </p>
      </section>

      <section className="rounded-2xl border border-hairline bg-white/[0.02] p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span className="text-ink">
            {trip.origin_name} → {trip.dest_name}
          </span>
          <span className="text-sm text-ink-muted">{formatDateRo(trip.departure_date)}</span>
        </div>
        <p className="mt-2 text-sm tabular-nums text-ink-muted">
          Plecare {formatTime(trip.departure_time)} · Sosire {formatTime(trip.arrival_time)}
          {trip.vehicle_name ? ` · ${trip.vehicle_name}` : ""}
        </p>
      </section>

      <section>
        <h3 className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">Pasageri</h3>
        <ul className="mt-4 flex flex-col divide-y divide-hairline">
          {values.passengers.map((passenger, index) => (
            <li key={index} className="flex items-center justify-between gap-4 py-3">
              <span className="text-ink">{passenger.full_name}</span>
              <span className="text-sm text-ink-dim">
                {passenger.is_child ? "Copil" : "Adult"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">Contact</h3>
        <dl className="mt-4 flex flex-col gap-2 text-sm">
          <Row label="Nume" value={values.contact_name} />
          <Row label="Email" value={values.contact_email} />
          <Row label="Telefon" value={values.contact_phone} />
          {values.notes ? <Row label="Observații" value={values.notes} /> : null}
        </dl>
      </section>

      <section className="rounded-2xl border border-hairline bg-white/[0.02] p-5">
        <p className="text-sm text-ink">{payment.label}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{payment.detail}</p>
      </section>

      <div className="flex flex-col gap-4 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
        <span>
          <span className="block text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">
            Total de plată
          </span>
          <span className="text-xl font-medium tabular-nums text-ink">{formatPrice(total)}</span>
        </span>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="secondary" size="lg" onClick={onBack} disabled={submitting}>
            <ArrowLeft className="size-4" aria-hidden />
            Înapoi
          </Button>

          <Button
            type="button"
            variant="accent"
            size="lg"
            onClick={onConfirm}
            disabled={submitting}
            aria-busy={submitting || undefined}
            className="group"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Se confirmă…
              </>
            ) : (
              <>
                Confirmă rezervarea
                <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-ink-dim">
        Prin confirmare accepți{" "}
        <Link href="/legal/termeni" className="text-ink-muted underline underline-offset-2">
          termenii și condițiile
        </Link>
        .
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            STEP 3 — CONFIRMATION                            */
/* -------------------------------------------------------------------------- */

function ConfirmationStep({
  trip,
  confirmation,
  seats,
}: {
  trip: TripSearchResult;
  confirmation: Confirmation;
  seats: number;
}) {
  const holdLabel = useMemo(() => {
    if (!confirmation.holdExpiresAt) return null;
    const expires = new Date(confirmation.holdExpiresAt);
    if (Number.isNaN(expires.getTime())) return null;
    return new Intl.DateTimeFormat("ro-RO", { hour: "2-digit", minute: "2-digit" }).format(expires);
  }, [confirmation.holdExpiresAt]);

  return (
    <div className="surface-card p-6 md:p-9">
      <span className="grid size-11 place-items-center rounded-full bg-accent/15 text-accent">
        <Check className="size-5" aria-hidden />
      </span>

      <h2 className="mt-6 text-title text-ink">Rezervarea ta este înregistrată</h2>
      <p className="mt-3 max-w-md leading-relaxed text-ink-muted">
        Îți trimitem confirmarea pe email. Prezintă codul de mai jos la îmbarcare.
      </p>

      <dl className="mt-8 flex flex-col gap-3 border-t border-hairline pt-6">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-sm text-ink-dim">Cod rezervare</dt>
          <dd className="font-mono text-lg text-accent">{confirmation.reference}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-sm text-ink-dim">Cursa</dt>
          <dd className="text-right text-ink">
            {trip.origin_name} → {trip.dest_name}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-sm text-ink-dim">Plecare</dt>
          <dd className="text-right tabular-nums text-ink">
            {formatDateRo(trip.departure_date)}, {formatTime(trip.departure_time)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-sm text-ink-dim">Locuri</dt>
          <dd className="tabular-nums text-ink">{seats}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-sm text-ink-dim">Total de plată</dt>
          <dd className="text-lg font-medium tabular-nums text-ink">
            {formatPrice(confirmation.total)}
          </dd>
        </div>
      </dl>

      {holdLabel && (
        <p className="mt-6 flex items-start gap-2.5 rounded-2xl border border-hairline bg-white/[0.02] p-4 text-sm text-ink-muted">
          <Clock className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden />
          <span>
            Locurile sunt rezervate până la ora {holdLabel}. Te sunăm pentru
            confirmarea finală înainte de plecare.
          </span>
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/rezervare/bilet" variant="secondary" size="md">
          Vezi rezervarea
        </ButtonLink>
        <ButtonLink href="/rezervare" variant="ghost" size="md">
          Caută altă cursă
        </ButtonLink>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/** Same wiring as `rental-form.tsx`'s `Field` — see the comment there. */
function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: ReactElement<{
    id?: string;
    "aria-invalid"?: boolean;
    "aria-describedby"?: string;
  }>;
  className?: string;
}) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <span className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">{label}</span>
      {cloneElement(children, {
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? errorId : undefined,
      })}
      {error && (
        <span id={errorId} role="alert" className="text-xs text-negative">
          {error}
        </span>
      )}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-ink-dim">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}
