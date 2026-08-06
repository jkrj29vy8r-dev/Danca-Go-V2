"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpDown, CalendarDays, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cities } from "@/lib/site";
import { cn, toDateKey } from "@/lib/utils";

/**
 * The hero's primary action. Deliberately shallow: it collects the four fields
 * needed to run a search and hands off to /rezervare, where the Supabase-backed
 * results live. Keeping it a plain form means it works before hydration.
 */
export function SearchWidget({ className }: { className?: string }) {
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

  return (
    <form
      onSubmit={submit}
      action="/rezervare"
      className={cn(
        "surface-card w-full p-2 backdrop-blur-2xl",
        "shadow-[0_1px_0_0_rgb(255_255_255/0.07)_inset,0_24px_64px_-24px_rgb(0_0_0/0.9)]",
        className,
      )}
    >
      <div className="grid grid-cols-2 gap-2 md:grid-cols-[1fr_auto_1fr_0.9fr_0.85fr_auto] md:items-center">
        <Field icon={MapPin} label="Plecare" className="col-span-2 md:col-span-1">
          <select
            name="from"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="w-full bg-transparent text-[0.9375rem] font-medium text-ink outline-none [&>option]:bg-raised"
          >
            {options.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </Field>

        <button
          type="button"
          onClick={swap}
          aria-label="Inversează plecarea cu destinația"
          className="hidden size-10 shrink-0 place-items-center rounded-full border border-hairline text-ink-muted transition-all duration-300 hover:rotate-180 hover:border-hairline-strong hover:text-ink md:grid"
        >
          <ArrowUpDown className="size-4" aria-hidden />
        </button>

        <Field icon={MapPin} label="Destinație" className="col-span-2 md:col-span-1">
          <select
            name="to"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="w-full bg-transparent text-[0.9375rem] font-medium text-ink outline-none [&>option]:bg-raised"
          >
            {options.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </Field>

        <Field icon={CalendarDays} label="Data">
          <input
            type="date"
            name="date"
            value={date}
            min={today}
            onChange={(event) => setDate(event.target.value)}
            className="w-full bg-transparent text-[0.9375rem] font-medium text-ink outline-none [color-scheme:dark]"
          />
        </Field>

        <Field icon={Users} label="Pasageri">
          <SeatSelect value={seats} onChange={setSeats} />
        </Field>

        <Button
          type="submit"
          variant="accent"
          size="lg"
          className="group col-span-2 h-13 w-full md:col-span-1 md:w-auto md:px-7"
        >
          Caută curse
          <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
        </Button>
      </div>
    </form>
  );
}

function Field({
  icon: Icon,
  label,
  children,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "flex min-w-0 cursor-pointer flex-col gap-1 rounded-2xl px-4 py-3",
        "transition-colors duration-300 hover:bg-white/[0.04] focus-within:bg-white/[0.05]",
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

function SeatSelect({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <select
      name="seats"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="w-full bg-transparent text-[0.9375rem] font-medium text-ink outline-none [&>option]:bg-raised"
    >
      {Array.from({ length: 10 }, (_, index) => index + 1).map((count) => (
        <option key={count} value={count}>
          {count} {count === 1 ? "pasager" : "pasageri"}
        </option>
      ))}
    </select>
  );
}
