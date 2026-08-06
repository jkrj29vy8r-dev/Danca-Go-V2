import Image from "next/image";
import { VehiclePhoto } from "./vehicle-photo";
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
      <VehiclePhoto vehicle={vehicle} priority={priority} />

      {gallery.length > 0 && (
        <ul className="grid grid-cols-2 gap-3">
          {gallery.map((shot) => (
            <li key={shot.src}>
              {/* 16:10 matches the processed source crop exactly. A different
                  aspect here would let object-cover re-crop an already-framed
                  photo — which pushed the coach interiors up into the ceiling. */}
              <figure className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-hairline bg-surface">
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, 45vw"
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
