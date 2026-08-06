"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Check } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { fleet } from "@/lib/site";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Sticky scroll showcase: the section is `fleet.length` viewports tall and the
 * inner panel is pinned, so scrolling swaps the active vehicle in place. It's
 * the Apple product-page device — it gives each vehicle the full screen without
 * making the user click through a carousel.
 */
export function FleetSection() {
  const container = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

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
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 40% at 70% 50%, rgb(200 164 104 / 0.07), transparent 70%)",
          }}
        />

        <div className="container-page relative grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:items-center">
          {/* --- Copy column --- */}
          <div>
            <Eyebrow>Flota</Eyebrow>

            <AnimatePresence mode="wait">
              <motion.div
                key={vehicle.slug}
                initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
                transition={{ duration: 0.55, ease: EASE }}
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
            <ol className="mt-12 flex gap-3" aria-label="Vehicule">
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
          </div>

          {/* --- Spec column --- */}
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline">
            {vehicle.specs.map((spec) => (
              <AnimatePresence mode="wait" key={spec.label}>
                <motion.div
                  key={`${vehicle.slug}-${spec.label}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="flex flex-col justify-between gap-8 bg-surface p-7 md:p-9"
                >
                  <span className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">
                    {spec.label}
                  </span>
                  <span className="text-title font-medium text-ink">{spec.value}</span>
                </motion.div>
              </AnimatePresence>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
