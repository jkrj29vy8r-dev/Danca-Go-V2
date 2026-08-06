"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ButtonLink } from "@/components/ui/button";
import { VehiclePhoto } from "@/components/fleet/vehicle-photo";
import { fleet, fleetNote } from "@/lib/site";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Sticky scroll showcase: the section is `fleet.length` viewports tall and the
 * inner panel is pinned, so scrolling swaps the active vehicle in place. It's
 * the Apple product-page device — each vehicle gets the full screen without
 * making the user click through a carousel.
 *
 * Framer's `useScroll` is used rather than GSAP pinning here because the panel
 * is position:sticky, which the browser handles natively — no pin-spacer, no
 * layout thrash, and it survives resize without a refresh.
 */
export function FleetSection() {
  const container = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  // The backdrop drifts slowly across the whole section, giving the pinned
  // panel a sense of travel that the swapping content alone doesn't provide.
  const glowX = useTransform(scrollYProgress, [0, 1], ["62%", "38%"]);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const index = Math.min(fleet.length - 1, Math.floor(progress * fleet.length));
    setActive((current) => (current === index ? current : index));
  });

  const vehicle = fleet[active];

  return (
    <section
      ref={container}
      className="relative border-t border-hairline"
      style={{ height: `${fleet.length * 100}vh` }}
      aria-label="Flota Danca Go"
    >
      <div className="sticky top-0 flex h-dvh flex-col justify-center overflow-hidden">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(45% 40% at var(--gx) 50%, rgb(200 164 104 / 0.09), transparent 70%)",
            // @ts-expect-error — custom property consumed by the gradient above
            "--gx": glowX,
          }}
        />

        <div className="container-page relative grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:items-center">
          {/* --- Copy column --- */}
          <div>
            <Eyebrow>Flota</Eyebrow>

            <AnimatePresence mode="wait">
              <motion.div
                key={vehicle.slug}
                initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -18, filter: "blur(8px)" }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                <p className="mt-6 text-sm tabular-nums text-accent">{vehicle.seats}</p>
                <h2 className="mt-3 text-headline text-gradient">{vehicle.headline}</h2>
                <p className="mt-5 max-w-md text-body-lg text-ink-muted">
                  {vehicle.description}
                </p>

                <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
                  {vehicle.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-ink-muted"
                    >
                      <Check className="size-3.5 text-accent" aria-hidden />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>

            {/* Progress rail doubles as the section's position indicator */}
            <div className="mt-12 flex flex-wrap items-center gap-x-5 gap-y-3">
              <ol className="flex gap-3" aria-label="Vehicule">
                {fleet.map((item, index) => (
                  <li key={item.slug}>
                    <span
                      className={cn(
                        "block h-0.5 w-16 rounded-full transition-colors duration-500",
                        index === active ? "bg-accent" : "bg-hairline-strong",
                      )}
                      aria-current={index === active ? "true" : undefined}
                    />
                    <span className="sr-only">{item.name}</span>
                  </li>
                ))}
              </ol>
              {/* Three panels shouldn't imply a three-vehicle fleet. */}
              <span className="text-sm text-ink-dim">{fleetNote.title}</span>
            </div>

            <ButtonLink href="/flota" variant="secondary" size="md" className="group mt-10">
              Vezi toată flota
              <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
            </ButtonLink>
          </div>

          {/* --- Visual column: photo, then specs ---
              The photo slot is the primary element. Until the real Setra /
              Sprinter / Vito shots land it renders a designed placeholder; the
              layout is already sized for them, so dropping the files in
              changes nothing structurally. */}
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${vehicle.slug}-photo`}
                initial={{ opacity: 0, scale: 0.97, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <VehiclePhoto vehicle={vehicle} />
              </motion.div>
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-4">
              {vehicle.specs.map((spec, index) => (
                <motion.div
                  key={`${vehicle.slug}-${spec.label}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.06 * index }}
                  className="flex flex-col justify-between gap-4 bg-surface p-5"
                >
                  <span className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">
                    {spec.label}
                  </span>
                  <span className="font-medium text-ink">{spec.value}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
