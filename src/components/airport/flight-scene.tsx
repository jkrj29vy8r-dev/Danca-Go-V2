"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * The flight arc: a plane tracking a great-circle route from Moldova to
 * Otopeni as the section scrolls.
 *
 * Deliberately SVG rather than a third WebGL context. The homepage hero and
 * the ambient coach already own two, and each one carries its own GL state and
 * memory — a third would be the single most expensive thing on a page whose
 * whole job is to load fast on a phone at an airport. Everything here is one
 * inline SVG plus transform writes on a handful of nodes, which costs
 * essentially nothing and looks the same on every device.
 *
 * The motion is scroll-*linked* rather than a loop: the reader drives the
 * aircraft along the route, which ties the animation to the page's own
 * narrative instead of running as decoration in the corner.
 */

/** The route, in the SVG's own coordinate space. */
const ARC = "M 196 336 C 430 152, 760 78, 1012 150";

const VIEW_W = 1200;
const VIEW_H = 420;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function FlightScene({
  from = "Moldova",
  to = "Otopeni",
  className,
}: {
  from?: string;
  to?: string;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const plane = useRef<SVGGElement>(null);
  const trail = useRef<SVGPathElement>(null);

  useEffect(() => {
    const rootNode = root.current;
    const pathNode = path.current;
    const planeNode = plane.current;
    const trailNode = trail.current;
    if (!rootNode || !pathNode || !planeNode || !trailNode) return;

    const length = pathNode.getTotalLength();

    // The trail is the same path drawn with a dash the length of the whole
    // route, so pulling its offset from `length` to 0 draws it on.
    trailNode.style.strokeDasharray = `${length}`;

    /** Position and bank the aircraft at `t` along the route. */
    const place = (t: number) => {
      const clamped = Math.min(Math.max(t, 0), 1);
      const point = pathNode.getPointAtLength(clamped * length);
      // Tangent by finite difference — cheaper and steadier than
      // differentiating the bezier, and the step is well under a pixel.
      const ahead = pathNode.getPointAtLength(Math.min(clamped * length + 1, length));
      const angle = (Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180) / Math.PI;
      planeNode.setAttribute("transform", `translate(${point.x} ${point.y}) rotate(${angle})`);
    };

    if (prefersReducedMotion()) {
      // Settle at the end state: route drawn, aircraft arrived. A static frame
      // still has to be a *finished* picture, not a half-drawn one.
      trailNode.style.strokeDashoffset = "0";
      place(1);
      return;
    }

    trailNode.style.strokeDashoffset = `${length}`;
    place(0);

    const context = gsap.context(() => {
      const progress = { t: 0 };

      gsap.to(progress, {
        t: 1,
        ease: "none",
        onUpdate: () => {
          place(progress.t);
          trailNode.style.strokeDashoffset = `${length * (1 - progress.t)}`;
        },
        scrollTrigger: {
          trigger: rootNode,
          start: "top 82%",
          end: "bottom 45%",
          scrub: 1,
        },
      });
    }, rootNode);

    return () => context.revert();
  }, []);

  return (
    <div
      ref={root}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-hairline bg-void",
        className,
      )}
    >
      {/* Night sky: a cool wash high, warm ground haze low. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 90% at 76% 12%, rgb(120 150 255 / 0.10), transparent 66%), radial-gradient(90% 70% at 18% 108%, rgb(200 164 104 / 0.14), transparent 70%)",
        }}
      />

      {/* Technical grid, masked to the centre so it reads as depth not chrome. */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(255 255 255 / 0.035) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.035) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 74% 74% at 50% 45%, black, transparent 100%)",
        }}
      />

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="relative block h-full w-full"
        role="img"
        aria-label={`Traseu aerian de la ${from} la ${to}`}
        // `meet`, not `slice`. The viewBox is 2.86:1 and the container is
        // 2.33:1 (or 1.78:1 on a phone), so `slice` scales to cover and eats
        // the left and right margins — which is exactly where the two city
        // labels live. They came out as "ova" and "Ot". The background
        // gradients are CSS on the wrapper, so letterboxing the SVG costs
        // nothing visually.
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="flight-trail" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#c8a468" stopOpacity="0.15" />
            <stop offset="55%" stopColor="#e0bf8a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#e0bf8a" stopOpacity="1" />
          </linearGradient>
          <radialGradient id="flight-pulse">
            <stop offset="0%" stopColor="#c8a468" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#c8a468" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ghost of the full route, so the arc reads as a plan even before the
            aircraft has flown it. */}
        <path
          d={ARC}
          fill="none"
          stroke="rgb(255 255 255 / 0.10)"
          strokeWidth="1.5"
          strokeDasharray="2 9"
          strokeLinecap="round"
        />

        {/* The flown portion. */}
        <path
          ref={trail}
          d={ARC}
          fill="none"
          stroke="url(#flight-trail)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Measurement path — never painted, only sampled for the aircraft's
            position. Kept separate so the visible trail can carry a dash
            pattern without disturbing `getPointAtLength`. */}
        <path ref={path} d={ARC} fill="none" stroke="none" />

        <Endpoint x={196} y={336} label={from} align="start" />
        <Endpoint x={1012} y={150} label={to} align="end" />

        {/* Aircraft, drawn nose-along-+X so the path tangent can be applied as
            the rotation directly, with no offset to keep in sync. */}
        <g ref={plane}>
          <g transform="translate(-13 -11) scale(1.15)">
            <path
              d="M22.5 9.6 L13.4 9.0 L7.2 1.2 L4.6 1.2 L7.6 9.0 L3.4 8.9 L1.5 6.4 L0 6.4 L1.1 9.6 L0 12.8 L1.5 12.8 L3.4 10.3 L7.6 10.2 L4.6 18 L7.2 18 L13.4 10.2 L22.5 9.6 Z"
              fill="#f2f5ff"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}

/** A city marker: pulse, dot, and a label that clears the arc. */
function Endpoint({
  x,
  y,
  label,
  align,
}: {
  x: number;
  y: number;
  label: string;
  align: "start" | "end";
}) {
  return (
    <g>
      <circle cx={x} cy={y} r="34" fill="url(#flight-pulse)">
        <animate
          attributeName="r"
          values="18;38;18"
          dur="4.5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.9;0.15;0.9"
          dur="4.5s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx={x} cy={y} r="5.5" fill="#c8a468" />
      <circle cx={x} cy={y} r="11" fill="none" stroke="rgb(200 164 104 / 0.4)" strokeWidth="1" />
      <text
        x={align === "start" ? x - 18 : x + 18}
        y={y + 5}
        textAnchor={align === "start" ? "end" : "start"}
        className="fill-ink-muted"
        style={{ fontSize: 17, letterSpacing: "0.02em" }}
      >
        {label}
      </text>
    </g>
  );
}
