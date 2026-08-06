"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { rentalSchema, type RentalInput } from "@/lib/schemas";
import { submitRental } from "@/app/inchirieri/actions";
import { cn, toDateKey } from "@/lib/utils";

/**
 * Charter enquiry form. Validation runs client-side for immediate feedback and
 * again inside the Server Action — the action is the trust boundary, the
 * client copy is just UX.
 */
export function RentalForm() {
  const [reference, setReference] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RentalInput>({
    resolver: zodResolver(rentalSchema),
    defaultValues: { passenger_count: 20, start_date: toDateKey(new Date()) },
  });

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
      <div className="surface-card p-8 md:p-10">
        <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">
          Cerere înregistrată
        </p>
        <p className="mt-4 font-mono text-title text-accent">{reference}</p>
        <p className="mt-4 max-w-md leading-relaxed text-ink-muted">
          Am primit solicitarea ta. Un coleg îți pregătește oferta și te contactează
          în cel mult 24 de ore. Păstrează codul de mai sus pentru referință.
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
    <form onSubmit={onSubmit} className="surface-card flex flex-col gap-5 p-8 md:p-10" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Nume complet" error={errors.contact_name?.message}>
          <input {...register("contact_name")} autoComplete="name" className={inputClass} />
        </FormField>

        <FormField label="Companie (opțional)" error={errors.company_name?.message}>
          <input {...register("company_name")} autoComplete="organization" className={inputClass} />
        </FormField>

        <FormField label="Email" error={errors.contact_email?.message}>
          <input {...register("contact_email")} type="email" autoComplete="email" className={inputClass} />
        </FormField>

        <FormField label="Telefon" error={errors.contact_phone?.message}>
          <input {...register("contact_phone")} type="tel" autoComplete="tel" className={inputClass} />
        </FormField>

        <FormField label="Plecare din" error={errors.origin?.message}>
          <input {...register("origin")} className={inputClass} />
        </FormField>

        <FormField label="Destinație" error={errors.destination?.message}>
          <input {...register("destination")} className={inputClass} />
        </FormField>

        <FormField label="Data plecării" error={errors.start_date?.message}>
          <input {...register("start_date")} type="date" className={cn(inputClass, "[color-scheme:dark]")} />
        </FormField>

        <FormField label="Data întoarcerii (opțional)" error={errors.end_date?.message}>
          <input {...register("end_date")} type="date" className={cn(inputClass, "[color-scheme:dark]")} />
        </FormField>

        <FormField label="Număr de pasageri" error={errors.passenger_count?.message}>
          <input
            {...register("passenger_count", { valueAsNumber: true })}
            type="number"
            min={1}
            max={90}
            className={inputClass}
          />
        </FormField>

        <FormField label="Tip vehicul" error={errors.vehicle_class?.message}>
          <select {...register("vehicle_class")} className={cn(inputClass, "[&>option]:bg-raised")}>
            <option value="">Recomandă-mi voi</option>
            <option value="coach">Autocar</option>
            <option value="minibus">Microbuz</option>
          </select>
        </FormField>
      </div>

      <FormField label="Detalii suplimentare (opțional)" error={errors.message?.message}>
        <textarea {...register("message")} rows={4} className={cn(inputClass, "resize-y")} />
      </FormField>

      <Button type="submit" variant="accent" size="lg" disabled={isSubmitting} className="group mt-2 self-start">
        {isSubmitting ? "Se trimite…" : "Trimite cererea"}
        <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
      </Button>
    </form>
  );
}

const inputClass = cn(
  "w-full rounded-xl border border-hairline bg-white/[0.03] px-4 py-3",
  "text-[0.9375rem] text-ink placeholder:text-ink-faint outline-none",
  "transition-colors duration-300 hover:border-hairline-strong",
  "focus:border-accent/60 focus:bg-white/[0.05]",
);

function FormField({
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
