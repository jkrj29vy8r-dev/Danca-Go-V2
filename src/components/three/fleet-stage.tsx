"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { detectQuality, type QualitySettings } from "./quality";
import { cn } from "@/lib/utils";

const CoachScene = dynamic(() => import("./coach-scene"), { ssr: false, loading: () => null });

/**
 * Second 3D moment, in the fleet section.
 *
 * A second WebGL context on the same page is not free — each one carries its
 * own GL state and memory — so this is deliberately the strictest gate on the
 * site: it mounts only on the `high` tier, and only while actually on screen.
 * Everywhere else the section falls back to the photography, which is the more
 * informative content anyway.
 *
 * It also unmounts when scrolled away rather than merely pausing, so the
 * context is released instead of sitting idle for the rest of the session.
 */
export function FleetStage({
  className,
  active = true,
}: {
  className?: string;
  /** Parent can force it down, e.g. while a different vehicle is selected. */
  active?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [quality, setQuality] = useState<QualitySettings | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    setQuality(detectQuality());
  }, []);

  useEffect(() => {
    if (!quality || quality.tier !== "high") return;

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "120px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [quality]);

  const mounted = Boolean(quality?.tier === "high" && inView && active);

  return (
    <div ref={ref} className={cn("relative", className)} aria-hidden>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 50% at 50% 55%, rgb(200 164 104 / 0.12), transparent 70%)",
        }}
      />

      {mounted && quality && (
        <div className="absolute inset-0 animate-[rise-in_1.2s_var(--ease-out-expo)_backwards]">
          <CoachScene
            quality={quality}
            // Slower turntable than the hero: this one is background texture,
            // not the subject, and a matching speed would compete with it.
            autoRotate={0.03}
            scrollInfluence={0.35}
            pointerInfluence={0.06}
            floatAmplitude={0.05}
            depthField={false}
          />
        </div>
      )}
    </div>
  );
}
