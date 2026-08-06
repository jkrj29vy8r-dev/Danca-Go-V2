"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpDown, CalendarDays, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cities } from "@/lib/site";
import { cn, toDateKey } from "@/lib/utils";

type Variant = "card" | "dock";

/**
 * The primary booking action. Deliberately shallow: it collects the four
 * fields needed to run a search and hands off to /rezervare, where the
 * Supabase-backed results live.
 *
 * `card`  — a raised surface, used on the booking page.
 * `dock`  — flush fields divided by hairlines, for the hero's docked bar.
 *
 * It renders a real <form action="/rezervare">, so it degrades to a plain GET
 * submission before hydration.
 */
export function SearchWidget({
  className,
  variant = "card",
}: {
  className?: string;
  variant?: Variant;
}) {
  const router = useRouter();
  const today = useMemo(() => toDateKey(new Date()), []);

  const [from, setFrom] = useState("Aeroport Otopeni");
  const [to, setTo] = useState("Bacău");
  const [date, setDate] = useState(today);
  const [seats, setSeats] = useState(1);

  const options = useMemo(() => ["Aeroport Otopeni", ...cities.filter((c) => c !== "Otopeni")], []);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams({ from, to, date, seats: String(seats) });
    router.push(`/rezervare?${params.toString()}`);
  };

  const isDock = variant === "dock";

  return (
    <form
      onSubmit={submit}
      action="/rezervare"
      className={cn(
        isDock
          ? "w-full"
          : cn(
              "surface-card w-full p-2 backdrop-blur-2xl",
              "shadow-[0_1px_0_0_rgb(255_255_255/0.07)_inset,0_24px_64px_-24px_rgb(0_0_0/0.9)]",
            ),
        className,
      )}
    >
      <div
        className={cn(
          "grid grid-cols-2 items-center gap-2",
          "md:grid-cols-[1fr_auto_1fr_0.9fr_0.85fr_auto]",
          // In dock mode the fields are separated by rules rather than gaps.
          isDock && "md:gap-0 md:divide-x md:divide-hairline",
        )}
      >
        <Field icon={MapPin} label="Plecare" variant={variant} className="col-span-2 md:col-span-1">
          <Select
            name="from"
            value={from}
            onChange={setFrom}
            options={options}
            label="Oraș de plecare"
          />
        </Field>

        <button
          type="button"
          onClick={swap}
          aria-label="Inversează plecarea cu destinația"
          className={cn(
            "hidden size-10 shrink-0 place-items-center rounded-full border border-hairline",
            "text-ink-muted transition-all duration-300",
            "hover:rotate-180 hover:border-hairline-strong hover:text-ink md:grid",
            isDock && "md:mx-3",
          )}
        >
          <ArrowUpDown className="size-4" aria-hidden />
        </button>

        <Field
          icon={MapPin}
          label="Destinație"
          variant={variant}
          className="col-span-2 md:col-span-1"
        >
          <Select name="to" value={to} onChange={setTo} options={options} label="Destinație" />
        </Field>

        <Field icon={CalendarDays} label="Data" variant={variant}>
          <input
            type="date"
            name="date"
            aria-label="Data plecării"
            value={date}
            min={today}
            onChange={(event) => setDate(event.target.value)}
            className="w-full bg-transparent text-[0.9375rem] font-medium text-ink outline-none [color-scheme:dark]"
          />
        </Field>

        <Field icon={Users} label="Pasageri" variant={variant}>
          <select
            name="seats"
            aria-label="Număr de pasageri"
            value={seats}
            onChange={(event) => setSeats(Number(event.target.value))}
            className="w-full bg-transparent text-[0.9375rem] font-medium text-ink outline-none [&>option]:bg-raised"
          >
            {Array.from({ length: 10 }, (_, index) => index + 1).map((count) => (
              <option key={count} value={count}>
                {count} {count === 1 ? "pasager" : "pasageri"}
              </option>
            ))}
          </select>
        </Field>

        <Button
          type="submit"
          variant="accent"
          size="lg"
          className={cn(
            "group col-span-2 h-13 w-full md:col-span-1 md:w-auto md:px-7",
            isDock && "md:ml-4",
          )}
        >
          Caută curse
          <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
        </Button>
      </div>
    </form>
  );
}

function Select({
  name,
  value,
  onChange,
  options,
  label,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  label: string;
}) {
  return (
    <select
      name={name}
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full bg-transparent text-[0.9375rem] font-medium text-ink outline-none [&>option]:bg-raised"
    >
      {options.map((city) => (
        <option key={city} value={city}>
          {city}
        </option>
      ))}
    </select>
  );
}

function Field({
  icon: Icon,
  label,
  children,
  className,
  variant,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
  className?: string;
  variant: Variant;
}) {
  return (
    <label
      className={cn(
        "flex min-w-0 cursor-pointer flex-col gap-1 px-4 py-3 transition-colors duration-300",
        variant === "card"
          ? "rounded-2xl hover:bg-white/[0.04] focus-within:bg-white/[0.05]"
          : "hover:bg-white/[0.03] focus-within:bg-white/[0.04] md:px-5",
        className,
      )}
    >
      <span className="flex items-center gap-1.5 text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">
        <Icon className="size-3" aria-hidden />
        {label}
      </span>
      {children}
    </label>
  );
}
