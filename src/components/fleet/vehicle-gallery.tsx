import Image from "next/image";
import { VehiclePhoto } from "./vehicle-photo";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import type { FleetClass } from "@/lib/site";

/**
 * Fleet imagery for a single vehicle: the primary shot, plus any additional
 * photography laid out beneath it.
 *
 * Photos are real, so they carry descriptive alt text rather than a repeated
 * model name — a screen reader user should learn what the picture actually
 * shows, not just which vehicle it belongs to.
 */
export function VehicleGallery({
  vehicle,
  priority = false,
}: {
  vehicle: FleetClass;
  priority?: boolean;
}) {
  const gallery = vehicle.gallery ?? [];

  return (
    <div className="flex flex-col gap-3">
      <VehiclePhoto vehicle={vehicle} priority={priority} kenBurns />

      {gallery.length > 0 && (
        // A lone final tile spans the row rather than leaving a hole, so the
        // gallery stays balanced at any photo count.
        //
        // Previously plain — no reveal at all, the one image grid on the site
        // that just appeared instantly rather than animating in with the rest
        // of the page.
        <RevealGroup
          className={cn(
            "grid gap-3",
            // Three across once there are enough photos to make a 2-up grid
            // taller than the copy beside it; the odd-tile rule then fills
            // whatever gap the last row leaves.
            gallery.length > 4
              ? "grid-cols-2 xl:grid-cols-3 [&>*:last-child:nth-child(odd)]:col-span-2 xl:[&>*:last-child:nth-child(odd)]:col-span-1"
              : "grid-cols-2 [&>*:last-child:nth-child(odd)]:col-span-2",
          )}
          stagger={0.07}
        >
          {gallery.map((shot) => (
            <RevealItem key={shot.src}>
              {/* 16:10 matches the processed source crop exactly. A different
                  aspect here would let object-cover re-crop an already-framed
                  photo — which pushed the coach interiors up into the ceiling. */}
              <figure className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-hairline bg-surface">
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  sizes="(min-width: 1280px) 17vw, (min-width: 1024px) 25vw, 45vw"
                  className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] hover:scale-[1.04]"
                />
                {/* Same tonal wash as the primary photo, so a bright daylight
                    shot never punches a hole in the dark layout. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgb(5 5 5 / 0.45), transparent 60%)",
                  }}
                />
              </figure>
            </RevealItem>
          ))}
        </RevealGroup>
      )}
    </div>
  );
}
