"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { detectQuality, type QualitySettings } from "./quality";
import { cn } from "@/lib/utils";

const CoachScene = dynamic(() => import("./coach-scene"), { ssr: false, loading: () => null });

/** Tuned presets, so callers pick a role rather than six loose numbers. */
const PRESETS = {
  /** Background texture: slow, barely-there, never competes with the copy. */
  ambient: {
    autoRotate: 0.03,
    scrollInfluence: 0.35,
    pointerInfluence: 0.06,
    floatAmplitude: 0.05,
    // The glow is what separates a dark vehicle from a dark page. Too low and
    // the coach reads as a smudge; these values were set against a render,
    // not guessed.
    glow: 0.2,
  },
  /** A supporting subject: the reader is meant to notice it. */
  feature: {
    autoRotate: 0.06,
    scrollInfluence: 0.5,
    pointerInfluence: 0.14,
    floatAmplitude: 0.09,
    glow: 0.26,
  },
} as const;

export type AmbientPreset = keyof typeof PRESETS;

/**
 * A reusable secondary 3D moment.
 *
 * A second WebGL context on the same page is not free — each one carries its
 * own GL state and memory — so this is deliberately the strictest gate on the
 * site: it mounts only on the `high` tier, and only while actually on screen.
 * Below that tier the section falls back to whatever it already contains,
 * which on the fleet and service pages is real photography — the more
 * informative content anyway.
 *
 * It also *unmounts* when scrolled away rather than merely pausing, so the
 * context is released instead of idling for the rest of the session. That
 * matters most on pages that stack two of these: only the one in view is ever
 * alive.
 */
export function AmbientCoach({
  className,
  preset = "ambient",
  active = true,
}: {
  className?: string;
  preset?: AmbientPreset;
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

  const settings = PRESETS[preset];
  const mounted = Boolean(quality?.tier === "high" && inView && active);

  return (
    <div ref={ref} className={cn("relative", className)} aria-hidden>
      {/* The glow renders on every tier — it is the section's atmosphere, and
          it has to read the same whether or not the canvas ever mounts. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(55% 50% at 50% 55%, rgb(200 164 104 / ${settings.glow}), transparent 70%)`,
        }}
      />

      {mounted && quality && (
        <div className="absolute inset-0 animate-[rise-in_1.2s_var(--ease-out-expo)_backwards]">
          <CoachScene
            quality={quality}
            autoRotate={settings.autoRotate}
            scrollInfluence={settings.scrollInfluence}
            pointerInfluence={settings.pointerInfluence}
            floatAmplitude={settings.floatAmplitude}
            depthField={false}
          />
        </div>
      )}
    </div>
  );
}
