"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Pointer-reactive primitives.
 *
 * All of them animate via CSS custom properties written directly to the node
 * in a pointermove handler — never React state. A magnetic button re-rendering
 * on every mouse event would be the single laggiest thing on the page, and the
 * effect only exists to feel effortless.
 *
 * Everything degrades to a plain element under prefers-reduced-motion or on
 * touch, where there is no hover to react to.
 */

function usePointerCapable() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(fine && !calm);
  }, []);

  return enabled;
}

/**
 * Pulls its child toward the cursor. `strength` is the fraction of the
 * distance from centre the element travels — 0.3 is noticeable, 0.15 is
 * subtle, above 0.5 starts to feel unglued from the layout.
 */
export function Magnetic({
  children,
  strength = 0.25,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const enabled = usePointerCapable();

  const onMove = useCallback(
    (event: React.PointerEvent<HTMLSpanElement>) => {
      const node = ref.current;
      if (!node || !enabled) return;
      const rect = node.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      node.style.setProperty("--mx", `${dx * strength}px`);
      node.style.setProperty("--my", `${dy * strength}px`);
    },
    [enabled, strength],
  );

  const reset = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty("--mx", "0px");
    node.style.setProperty("--my", "0px");
  }, []);

  if (!enabled) return <span className={className}>{children}</span>;

  return (
    <span
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={cn("inline-block will-change-transform", className)}
      style={{
        transform: "translate3d(var(--mx, 0px), var(--my, 0px), 0)",
        transition: "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {children}
    </span>
  );
}

/**
 * Tilts a card in 3D toward the cursor and lifts a specular sheen with it.
 * The rotation is small on purpose: past ~8° the text starts to look distorted
 * rather than dimensional.
 */
export function TiltCard({
  children,
  className,
  maxTilt = 6,
  sheen = true,
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  sheen?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = usePointerCapable();

  const onMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const node = ref.current;
      if (!node || !enabled) return;
      const rect = node.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      node.style.setProperty("--rx", `${(0.5 - py) * maxTilt * 2}deg`);
      node.style.setProperty("--ry", `${(px - 0.5) * maxTilt * 2}deg`);
      node.style.setProperty("--sx", `${px * 100}%`);
      node.style.setProperty("--sy", `${py * 100}%`);
    },
    [enabled, maxTilt],
  );

  const reset = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty("--rx", "0deg");
    node.style.setProperty("--ry", "0deg");
  }, []);

  if (!enabled) return <div className={className}>{children}</div>;

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={cn("group/tilt relative [perspective:1200px]", className)}
    >
      <div
        className="relative h-full [transform-style:preserve-3d] will-change-transform"
        style={{
          transform: "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
          transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {children}

        {sheen && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/tilt:opacity-100"
            style={{
              background:
                "radial-gradient(420px circle at var(--sx, 50%) var(--sy, 50%), rgb(255 255 255 / 0.07), transparent 65%)",
            }}
          />
        )}
      </div>
    </div>
  );
}

/**
 * A cursor-following spotlight for large surfaces (hero panels, CTA blocks).
 * Same custom-property approach, so the parent never re-renders.
 */
export function Spotlight({
  children,
  className,
  size = 520,
  color = "rgb(200 164 104 / 0.10)",
}: {
  children: React.ReactNode;
  className?: string;
  size?: number;
  color?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = usePointerCapable();

  const onMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const node = ref.current;
      if (!node || !enabled) return;
      const rect = node.getBoundingClientRect();
      node.style.setProperty("--px", `${event.clientX - rect.left}px`);
      node.style.setProperty("--py", `${event.clientY - rect.top}px`);
    },
    [enabled],
  );

  return (
    <div ref={ref} onPointerMove={onMove} className={cn("group/spot relative", className)}>
      {enabled && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] opacity-0 transition-opacity duration-700 group-hover/spot:opacity-100"
          style={{
            background: `radial-gradient(${size}px circle at var(--px, 50%) var(--py, 50%), ${color}, transparent 70%)`,
          }}
        />
      )}
      {children}
    </div>
  );
}
