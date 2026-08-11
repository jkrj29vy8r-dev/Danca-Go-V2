import Image from "next/image";
import { cn } from "@/lib/utils";
import type { FleetClass } from "@/lib/site";

/**
 * Primary fleet photo for a vehicle.
 *
 * Two presentations, chosen per vehicle by `FleetClass.cutout`:
 *
 *   framed  — the photo fills a rounded frame edge to edge. Correct for a
 *             normal photograph, where the background is part of the picture
 *             (a Sprinter at the airport terminal says something the vehicle
 *             alone does not).
 *   cutout  — a background-removed PNG floats on a lit stage: radial glow
 *             behind it, elliptical contact shadow beneath. This is the
 *             Tesla/Rivian configurator treatment, and it only works with a
 *             transparent source — run it on a photo with its background
 *             still attached and you get a rectangle hovering over a shadow.
 *
 * Both share the frame, aspect and gradient wash, so switching a vehicle from
 * one to the other is a one-word data change with no layout consequences.
 *
 * Falls back to a designed placeholder when `image` is unset — a vehicle added
 * to the fleet before its photo shoot still renders correctly, rather than
 * showing a broken image or a stock photo of someone else's bus.
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
  const isCutout = vehicle.cutout === true;

  return (
    <div
      className={cn(
        "group/photo relative aspect-[16/10] overflow-hidden rounded-3xl border border-hairline",
        isCutout ? "bg-void" : "bg-surface",
        className,
      )}
    >
      {isCutout && <VehicleStage />}

      {vehicle.image ? (
        <Image
          src={vehicle.image}
          alt={`${vehicle.name} din flota Danca Go, fotografiat în exterior`}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className={cn(
            "transition-transform duration-[1.2s] ease-[var(--ease-out-expo)]",
            isCutout
              ? // `contain` so a cut-out vehicle is never cropped — the
                // silhouette is the whole point — and `object-bottom` so it
                // rests on the floor line instead of floating in the middle of
                // the frame. Without the bottom anchor, a wide source image is
                // width-constrained and centres vertically, leaving the wheels
                // hovering above their own contact shadow.
                //
                // The vertical padding is scaled by 10/16 because **percentage
                // padding resolves against the containing block's width, even
                // on the top and bottom edges** — while the stage's `bottom-*`
                // offsets resolve against its height. Writing a bare `pb-[14%]`
                // here lands the vehicle at 77% down a 16:10 frame, ~9 points
                // short of the FLOOR line the shadow is drawn on. The calc
                // keeps both halves reading in the same units.
                "object-contain object-bottom px-[7%] pt-[calc(9%*10/16)] pb-[calc(14%*10/16)] drop-shadow-[0_28px_44px_rgba(0,0,0,0.7)] group-hover/photo:-translate-y-1 group-hover/photo:scale-[1.02]"
              : "object-cover group-hover/photo:scale-[1.04]",
          )}
        />
      ) : (
        <PhotoPlaceholder label={vehicle.name} />
      )}

      {/* Keeps any photo sitting in the same tonal world as the rest of the
          page. Skipped for cut-outs, where there is no background to grade
          and a bottom scrim would just fog the wheels. */}
      {!isCutout && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgb(5 5 5 / 0.55), transparent 55%), radial-gradient(70% 60% at 50% 100%, rgb(200 164 104 / 0.10), transparent 70%)",
          }}
        />
      )}
    </div>
  );
}

/**
 * The lit stage a cut-out vehicle stands on: a warm pool of light behind it
 * and a soft elliptical shadow under the wheels.
 *
 * Both are pure CSS gradients rather than images — they scale to any frame
 * size, cost nothing to download, and stay correct if the photo behind them
 * is swapped.
 *
 * The floor sits 14% up from the bottom of the frame. That number is repeated
 * in `VehiclePhoto`'s image padding (scaled for the percentage-resolves-against
 * -width rule); move one and the vehicle stops touching its own shadow.
 */
function VehicleStage() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* Key pool, behind and above the vehicle */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(58% 46% at 50% 42%, rgb(200 164 104 / 0.16), transparent 72%)",
        }}
      />
      {/* Cool counter-light, so the stage isn't a single flat wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(40% 34% at 78% 30%, rgb(120 150 255 / 0.10), transparent 70%)",
        }}
      />
      {/* Contact shadow: a wide, soft ellipse where the wheels meet the floor.
          This is what stops a cut-out reading as a sticker on a dark panel.

          Both ellipses spread and soften on hover, because the vehicle lifts on
          hover — a shadow that stayed identical while the subject rose would
          read as painted on. */}
      <div
        className="absolute inset-x-[14%] bottom-[10%] h-[9%] rounded-[50%] blur-xl transition-all duration-[1.2s] ease-[var(--ease-out-expo)] group-hover/photo:inset-x-[11%] group-hover/photo:opacity-80 group-hover/photo:blur-2xl"
        style={{ background: "rgb(0 0 0 / 0.85)" }}
      />
      <div
        className="absolute inset-x-[24%] bottom-[11%] h-[5%] rounded-[50%] blur-md transition-all duration-[1.2s] ease-[var(--ease-out-expo)] group-hover/photo:inset-x-[21%] group-hover/photo:opacity-70 group-hover/photo:blur-lg"
        style={{ background: "rgb(0 0 0 / 0.9)" }}
      />
      {/* Horizon line, echoing the hero's lit rule */}
      <div
        className="absolute inset-x-0 bottom-[14%] h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgb(200 164 104 / 0.28), transparent)",
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
