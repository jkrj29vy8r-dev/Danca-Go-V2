import Image from "next/image";
import { cn } from "@/lib/utils";
import type { FleetClass } from "@/lib/site";

/**
 * Fleet imagery slot.
 *
 * The brief calls for real photos of the Setra, the Sprinters and the Vito.
 * Until those are supplied, this renders a designed placeholder rather than a
 * broken image or a stock photo of someone else's bus — showing a vehicle the
 * company doesn't own would be worse than showing none.
 *
 * To go live: drop the photo in /public/fleet/<slug>.jpg and set `image` on
 * the entry in `lib/site.ts`. Nothing else changes.
 */
export function VehiclePhoto({
  vehicle,
  className,
  priority = false,
}: {
  vehicle: FleetClass;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[16/10] overflow-hidden rounded-3xl border border-hairline bg-surface",
        className,
      )}
    >
      {vehicle.image ? (
        <Image
          src={vehicle.image}
          alt={`${vehicle.name} — flota Danca Go`}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      ) : (
        <PhotoPlaceholder label={vehicle.name} />
      )}

      {/* Keeps any photo sitting in the same tonal world as the rest of the page */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgb(5 5 5 / 0.55), transparent 55%), radial-gradient(70% 60% at 50% 100%, rgb(200 164 104 / 0.10), transparent 70%)",
        }}
      />
    </div>
  );
}

function PhotoPlaceholder({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(255 255 255 / 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.04) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent 100%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-4 px-6 text-center">
        <svg viewBox="0 0 640 200" className="w-52 max-w-full" role="img" aria-label={label}>
          <rect x="40" y="46" width="560" height="104" rx="26" fill="#111116" />
          <rect x="70" y="62" width="470" height="42" rx="14" fill="#05070d" />
          <rect x="70" y="116" width="470" height="3" rx="1.5" fill="#c8a468" opacity="0.75" />
          <circle cx="150" cy="156" r="24" fill="#0a0a0c" />
          <circle cx="150" cy="156" r="11" fill="#5c6169" />
          <circle cx="486" cy="156" r="24" fill="#0a0a0c" />
          <circle cx="486" cy="156" r="11" fill="#5c6169" />
        </svg>

        <span className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-faint">
          Fotografie în curând
        </span>
      </div>
    </div>
  );
}
