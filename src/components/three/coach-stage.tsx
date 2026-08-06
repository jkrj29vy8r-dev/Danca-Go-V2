"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

/**
 * Performance gate for the hero canvas.
 *
 * The Three.js bundle is code-split and only requested once the stage is
 * actually near the viewport AND the device looks capable. On reduced-motion
 * or clearly low-powered hardware we render a static silhouette instead, so
 * the hero still composes correctly with zero WebGL cost.
 */

const CoachScene = dynamic(() => import("./coach-scene"), {
  ssr: false,
  loading: () => null,
});

function deviceCanHandleWebGL() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;

  // Coarse heuristics — cheap, and wrong only in the conservative direction.
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  if (cores <= 2 || memory <= 2) return false;

  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function CoachStage({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!deviceCanHandleWebGL()) return;

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Fade the canvas in once the first frame has had a chance to paint,
  // so the hero never flashes an empty box.
  useEffect(() => {
    if (!shouldRender) return;
    const timer = window.setTimeout(() => setReady(true), 120);
    return () => window.clearTimeout(timer);
  }, [shouldRender]);

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

      {shouldRender ? (
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-[var(--ease-out-expo)]",
            ready ? "opacity-100" : "opacity-0",
          )}
        >
          <CoachScene />
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
