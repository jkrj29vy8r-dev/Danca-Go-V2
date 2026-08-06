"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * GSAP-driven scroll effects.
 *
 * Framer Motion handles discrete entrances (see `reveal.tsx`); GSAP handles
 * anything that must stay *linked* to scroll position across a long distance —
 * parallax, scale-through, pinning. ScrollTrigger reads from Lenis via the
 * ticker wired up in `smooth-scroll.tsx`, so the two never fight.
 *
 * All effects are skipped under prefers-reduced-motion, leaving the element in
 * its natural, fully-visible state.
 */

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Moves a layer at a different rate than the page. `speed` is the fraction of
 * the scrolled distance to offset by — negative moves against the scroll.
 */
export function Parallax({
  children,
  speed = 0.15,
  className,
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion()) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        node,
        { yPercent: -speed * 50 },
        {
          yPercent: speed * 50,
          ease: "none",
          scrollTrigger: {
            trigger: node,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    });

    return () => context.revert();
  }, [speed]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/**
 * Scales and fades a block as it enters, settling at rest while centred.
 * Deliberately slow (`scrub: 1`) — a lagging scrub is what separates
 * "expensive" from "jumpy".
 */
export function ScaleIn({
  children,
  className,
  from = 0.92,
}: {
  children: React.ReactNode;
  className?: string;
  from?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion()) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        node,
        // The opacity floor is deliberately high. A scrubbed tween can sit
        // mid-state after a jump-scroll (anchor link, restored position), and
        // this block holds the primary CTA — it must stay legible in every
        // intermediate frame, not just at rest.
        { scale: from, opacity: 0.75, y: 60 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: node,
            start: "top 92%",
            end: "top 50%",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        },
      );
    });

    return () => context.revert();
  }, [from]);

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}

/**
 * Line-by-line text reveal tied to scroll. Each child element of the container
 * lifts and clears its blur in sequence as the block crosses the viewport.
 * Expects children that are already block-level lines.
 */
export function ScrollLines({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion()) return;

    const context = gsap.context(() => {
      const lines = gsap.utils.toArray<HTMLElement>(node.children);

      gsap.fromTo(
        lines,
        { opacity: 0.35, y: 28, filter: "blur(4px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          ease: "power2.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: node,
            start: "top 85%",
            end: "bottom 60%",
            scrub: 1,
          },
        },
      );
    }, node);

    return () => context.revert();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/**
 * Counts a number up when it scrolls into view. Used for the proof stats —
 * a static "4,6" is a fact, an animating one is a claim being made.
 */
export function CountUp({
  value,
  decimals = 0,
  suffix = "",
  className,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const format = (n: number) =>
      `${n.toLocaleString("ro-RO", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`;

    if (prefersReducedMotion()) {
      node.textContent = format(value);
      return;
    }

    const counter = { current: 0 };

    const context = gsap.context(() => {
      gsap.to(counter, {
        current: value,
        duration: 1.8,
        ease: "power2.out",
        onUpdate: () => {
          node.textContent = format(counter.current);
        },
        scrollTrigger: { trigger: node, start: "top 88%", once: true },
      });
    });

    return () => context.revert();
  }, [value, decimals, suffix]);

  // Server-rendered with the final value so it's correct without JS.
  return (
    <span ref={ref} className={className}>
      {value.toLocaleString("ro-RO", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
