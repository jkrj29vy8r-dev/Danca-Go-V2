"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** The live instance, so in-page anchors can scroll through Lenis. */
let instance: Lenis | null = null;

/** Clears the fixed navbar, with a little air above the heading. */
export const ANCHOR_OFFSET = 112;

/**
 * Smoothly scrolls to an element id.
 *
 * We resolve the destination ourselves — `rect.top + window.scrollY` — rather
 * than handing Lenis a selector. Lenis derives the target from its own
 * `animatedScroll`, which lags a native scroll by a frame, so a click that
 * lands right after one (a focus jump, a browser autoscroll) undershoots by
 * exactly the distance of that scroll. Reading the live geometry cannot drift.
 *
 * Returns false when there is nothing to scroll to, so the caller can let the
 * browser handle the link normally.
 */
export function scrollToId(id: string, offset = ANCHOR_OFFSET): boolean {
  const target = document.getElementById(id);
  if (!target) return false;

  const top = target.getBoundingClientRect().top + window.scrollY - offset;

  if (instance) instance.scrollTo(top, { duration: 1 });
  else window.scrollTo({ top, behavior: "smooth" });

  return true;
}

/**
 * Lenis owns the scroll position and drives GSAP's ticker, so ScrollTrigger
 * measurements stay in sync with the eased scroll value instead of fighting it.
 *
 * Disabled entirely under prefers-reduced-motion, which falls back to native
 * scrolling with no interpolation.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    instance = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Web fonts and the lazily-mounted canvas can change document height after
    // triggers are measured, which would leave scrubbed tweens reading stale
    // positions. Re-measure once everything has settled, and on resize.
    const refresh = () => ScrollTrigger.refresh();
    const settleTimer = window.setTimeout(refresh, 900);
    document.fonts?.ready.then(refresh).catch(() => {});
    window.addEventListener("resize", refresh);

    return () => {
      window.clearTimeout(settleTimer);
      window.removeEventListener("resize", refresh);
      gsap.ticker.remove(raf);
      lenis.destroy();
      instance = null;
    };
  }, []);

  // New page, new document height — recalculate trigger positions.
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [pathname]);

  return <>{children}</>;
}
