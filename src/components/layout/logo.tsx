import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Wordmark. The chevron doubles as a forward-motion mark and the "G" of Go.
 *
 * Carries a gold shimmer: a diagonal band that sweeps across the mark once on
 * mount, then again on every hover. This is the one element that appears on
 * every single page in the fixed navbar, so it's the cheapest place on the
 * whole site to plant "this is a considered, expensive brand" — one pass of
 * light is enough to say it once; more than that would nag.
 *
 * The sweep is a single absolutely-positioned bar with `mix-blend-mode:
 * overlay`, not a `background-clip: text` gradient animation. Overlay blend
 * lightens whatever is under it (the ring, the chevron, the wordmark) without
 * requiring the sweep to know the mark's own colours — so it works over the
 * gold "Go", the white "Danca" and the ring stroke identically, and stays
 * correct if any of those change.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Danca Go — prima pagină"
      className={cn(
        "group relative isolate inline-flex items-center gap-2.5 overflow-hidden rounded-full",
        "transition-opacity duration-300 hover:opacity-90",
        className,
      )}
    >
      <svg
        viewBox="0 0 28 28"
        className="size-[26px] shrink-0"
        aria-hidden
        fill="none"
      >
        <circle cx="14" cy="14" r="13" stroke="currentColor" strokeOpacity="0.18" />
        <path
          d="M9.5 8.5 16 14l-6.5 5.5"
          stroke="var(--color-accent)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-[2px]"
        />
        <path d="M18.5 8.5v11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>

      <span className="text-[0.9375rem] font-semibold tracking-[-0.02em]">
        Danca<span className="text-accent"> Go</span>
      </span>

      {/* The sweep. `mix-blend-mode: overlay` is what lets one element brighten
          three differently-coloured children without being told about any of
          them — it works over the gold "Go", the white "Danca" and the ring
          stroke identically.

          Two separate bars rather than one reused for both triggers: a CSS
          `animation` (the mount sweep) and a `transition` (the hover sweep)
          resolve the same `transform` property differently on interruption.
          An animation cut mid-flight simply stops — if hover ended it while
          the mount sweep was still finishing, a shared bar would freeze
          part-way across the mark. A transition, by contrast, eases back to
          its resting state from wherever it was interrupted, which is what
          makes the hover trigger safe to re-enter rapidly. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 mix-blend-overlay [animation:shimmer-sweep_1.4s_ease-out_0.6s_1_backwards]"
        style={{
          background:
            "linear-gradient(100deg, transparent, rgb(255 255 255 / 0.9), transparent)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 -translate-x-[160%] skew-x-[-20deg] mix-blend-overlay transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-[420%]"
        style={{
          background:
            "linear-gradient(100deg, transparent, rgb(255 255 255 / 0.9), transparent)",
        }}
      />
    </Link>
  );
}
