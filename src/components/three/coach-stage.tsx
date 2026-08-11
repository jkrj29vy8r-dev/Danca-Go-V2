"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { detectQuality, type QualitySettings } from "./quality";
import { cn } from "@/lib/utils";

/**
 * Performance gate for the hero canvas.
 *
 * The Three.js bundle is code-split and only requested once the stage is
 * actually near the viewport AND the device has been graded as capable. On
 * reduced-motion or clearly low-powered hardware nothing is downloaded at all —
 * a static vector silhouette renders instead, so the hero still composes with
 * zero WebGL cost and zero wasted bytes.
 */

const CoachScene = dynamic(() => import("./coach-scene"), {
  ssr: false,
  loading: () => null,
});

export function CoachStage({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [quality, setQuality] = useState<QualitySettings | null>(null);
  const [inView, setInView] = useState(false);
  const [ready, setReady] = useState(false);

  // Grade the device once, up front — this decides whether we even observe.
  useEffect(() => {
    setQuality(detectQuality());
  }, []);

  useEffect(() => {
    if (!quality || quality.tier === "none") return;

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [quality]);

  // Fade the canvas in once the first frame has had a chance to paint, so the
  // hero never flashes an empty box.
  useEffect(() => {
    if (!inView) return;
    const timer = window.setTimeout(() => setReady(true), 120);
    return () => window.clearTimeout(timer);
  }, [inView]);

  const shouldRender = Boolean(quality && quality.tier !== "none" && inView);

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* Ambient glow sitting behind the vehicle */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 animate-[glow-pulse_6s_ease-in-out_infinite]"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 58%, rgb(200 164 104 / 0.16), transparent 70%)",
        }}
      />

      {shouldRender && quality ? (
        <div
          className={cn(
            "absolute inset-0",
            // A settle, not a fade. The canvas eases down and back to rest
            // rather than simply appearing at full opacity — the vehicle
            // arrives and stops, which is a considerably stronger entrance
            // than a crossfade for the same cost (both are compositor-only).
            //
            // `backwards` holds the from-state through the delay, so there is
            // no frame where the canvas is briefly visible at its final
            // position before the animation takes over.
            ready
              ? "[animation:coach-settle_1.4s_var(--ease-out-expo)_backwards]"
              : "opacity-0",
          )}
        >
          <CoachScene quality={quality} />
        </div>
      ) : (
        <StaticCoach />
      )}
    </div>
  );
}

/** Non-WebGL fallback: a clean vector silhouette in the brand palette. */
function StaticCoach() {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-6">
      <svg
        viewBox="0 0 640 200"
        className="w-full max-w-3xl text-ink-faint"
        role="img"
        aria-label="Autocar Danca Go"
      >
        <defs>
          <linearGradient id="coach-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1b1b21" />
            <stop offset="100%" stopColor="#0b0b0e" />
          </linearGradient>
        </defs>
        <rect x="40" y="46" width="560" height="104" rx="26" fill="url(#coach-body)" />
        <rect x="70" y="62" width="470" height="42" rx="14" fill="#04060b" />
        <rect x="70" y="116" width="470" height="3" rx="1.5" fill="#c8a468" opacity="0.8" />
        <circle cx="150" cy="156" r="24" fill="#0a0a0c" />
        <circle cx="150" cy="156" r="11" fill="#8f8f96" />
        <circle cx="486" cy="156" r="24" fill="#0a0a0c" />
        <circle cx="486" cy="156" r="11" fill="#8f8f96" />
        <rect x="586" y="88" width="14" height="12" rx="6" fill="#eaf2ff" />
      </svg>
    </div>
  );
}
