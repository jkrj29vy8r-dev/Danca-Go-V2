"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { rentalSchema, type RentalInput, type RequestKindInput } from "@/lib/schemas";
import { submitRental } from "@/app/inchirieri/actions";
import { eventTypes } from "@/lib/site";
import { cn, toDateKey } from "@/lib/utils";

/**
 * Quote request, shared by /inchirieri and /experiente.
 *
 * The two pages ask the same operational questions — when, from where, how
 * many — so they share one form and one table. `kind` records which page it
 * came from and drives the labels, so staff opening the request know whether
 * it's a coach hire or a day trip without reading the message.
 *
 * Validation runs client-side for immediate feedback and again inside the
 * Server Action; the action is the trust boundary, the client copy is UX.
 */
export function RentalForm({
  kind = "rental",
  className,
}: {
  kind?: RequestKindInput;
  className?: string;
}) {
  const [reference, setReference] = useState<string | null>(null);

  const isExperience = kind === "experience";

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RentalInput>({
    resolver: zodResolver(rentalSchema),
    defaultValues: {
      kind,
      passenger_count: isExperience ? 15 : 30,
      start_date: toDateKey(new Date()),
      flexible_dates: false,
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      company_name: "",
      origin: "",
      destination: "",
      end_date: "",
      event_type: "",
      vehicle_class: "",
      message: "",
    },
  });

  const flexible = watch("flexible_dates");

  const onSubmit = handleSubmit(async (values) => {
    const result = await submitRental(values);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    setReference(result.reference);
    reset();
    toast.success("Cererea a fost trimisă. Te contactăm în cel mult 24 de ore.");
  });

  if (reference) {
    return (
      <div className={cn("surface-card p-8 md:p-10", className)}>
        <span className="grid size-11 place-items-center rounded-full bg-accent/15 text-accent">
          <Check className="size-5" aria-hidden />
        </span>

        <p className="mt-6 text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">
          Cerere înregistrată
        </p>
        <p className="mt-3 font-mono text-title text-accent">{reference}</p>
        <p className="mt-4 max-w-md leading-relaxed text-ink-muted">
          Am primit solicitarea ta. Pregătim oferta și te contactăm în cel mult
          24 de ore. Păstrează codul de mai sus pentru referință.
        </p>

        <Button
          type="button"
          variant="secondary"
          size="md"
          className="mt-8"
          onClick={() => setReference(null)}
        >
          Trimite o altă cerere
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn("surface-card flex flex-col gap-6 p-8 md:p-10", className)}
      noValidate
    >
      <input type="hidden" {...register("kind")} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nume complet" error={errors.contact_name?.message}>
          <Input {...register("contact_name")} autoComplete="name" />
        </Field>

        <Field label="Companie (opțional)" error={errors.company_name?.message}>
          <Input {...register("company_name")} autoComplete="organization" />
        </Field>

        <Field label="Email" error={errors.contact_email?.message}>
          <Input {...register("contact_email")} type="email" autoComplete="email" />
        </Field>

        <Field label="Telefon" error={errors.contact_phone?.message}>
          <Input {...register("contact_phone")} type="tel" autoComplete="tel" />
        </Field>

        <Field
          label={isExperience ? "Plecare din" : "Punct de plecare"}
          error={errors.origin?.message}
        >
          <Input {...register("origin")} placeholder="Roman" />
        </Field>

        <Field
          label={isExperience ? "Unde vreți să ajungeți" : "Destinație"}
          error={errors.destination?.message}
        >
          <Input
            {...register("destination")}
            placeholder={isExperience ? "Mănăstirile Bucovinei" : "București"}
          />
        </Field>

        <Field label="Ocazia" error={errors.event_type?.message}>
          <Select {...register("event_type")}>
            <option value="">Alege…</option>
            {eventTypes[kind].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Număr de pasageri" error={errors.passenger_count?.message}>
          <Input
            {...register("passenger_count", { valueAsNumber: true })}
            type="number"
            min={1}
            max={90}
          />
        </Field>

        <Field label="Data plecării" error={errors.start_date?.message}>
          <Input {...register("start_date")} type="date" />
        </Field>

        <Field label="Data întoarcerii (opțional)" error={errors.end_date?.message}>
          <Input {...register("end_date")} type="date" />
        </Field>

        {!isExperience && (
          <Field label="Tip vehicul" error={errors.vehicle_class?.message}>
            <Select {...register("vehicle_class")}>
              <option value="">Recomandați voi</option>
              <option value="coach">Autocar</option>
              <option value="minibus">Microbuz</option>
            </Select>
          </Field>
        )}

        <div className={cn("flex items-end", isExperience && "sm:col-span-2")}>
          <button
            type="button"
            onClick={() => setValue("flexible_dates", !flexible)}
            aria-pressed={flexible}
            className={cn(
              "inline-flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm transition-colors duration-300",
              flexible
                ? "border-accent/60 bg-accent/10 text-accent"
                : "border-hairline text-ink-dim hover:text-ink",
            )}
          >
            <span
              className={cn(
                "grid size-4 place-items-center rounded-[5px] border transition-colors duration-300",
                flexible ? "border-accent bg-accent text-void" : "border-hairline-strong",
              )}
            >
              {flexible && <Check className="size-3" aria-hidden />}
            </span>
            Datele sunt flexibile
          </button>
        </div>
      </div>

      <Field
        label={
          isExperience
            ? "Spune-ne planul (opțional)"
            : "Detalii suplimentare (opțional)"
        }
        error={errors.message?.message}
      >
        <Textarea
          {...register("message")}
          rows={4}
          placeholder={
            isExperience
              ? "Câte opriri, cât stați în fiecare loc, ora dorită de întoarcere…"
              : "Bagaje voluminoase, opriri intermediare, cerințe de contract…"
          }
        />
      </Field>

      <Button
        type="submit"
        variant="accent"
        size="lg"
        disabled={isSubmitting}
        className="group mt-2 self-start"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Se trimite…
          </>
        ) : (
          <>
            Solicită ofertă
            <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
          </>
        )}
      </Button>

      <p className="text-xs leading-relaxed text-ink-dim">
        Îți răspundem în cel mult 24 de ore. Nu trimitem newslettere și nu
        împărtășim datele tale.
      </p>
    </form>
  );
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <span className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">{label}</span>
      {children}
      {error && <span className="text-xs text-negative">{error}</span>}
    </label>
  );
}
