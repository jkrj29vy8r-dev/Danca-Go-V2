import { Eyebrow } from "@/components/ui/eyebrow";
import { WordReveal } from "@/components/motion/word-reveal";
import { AmbientCoach, type AmbientPreset } from "@/components/three/ambient-coach";
import { cn } from "@/lib/utils";

/**
 * Shared masthead for every non-home page.
 *
 * Every entrance here is a CSS animation, deliberately. This block contains
 * the `<h1>` — the LCP element on all of these pages — and driving it with
 * Framer Motion would ship `opacity: 0` in the server HTML and hold the
 * largest paint until hydration. The same mistake was made once on the hero;
 * it does not get made twice.
 *
 * The choreography is a single downward cascade: eyebrow → headline words →
 * lead → whatever the page docks underneath. Each step overlaps the one before
 * it, so the header reads as one movement rather than four.
 */
export function PageHeader({
  eyebrow,
  title,
  titleHighlight,
  titleHighlightLabel,
  lead,
  scene,
  className,
  children,
}: {
  eyebrow: string;
  title: string;
  /** Exact token to paint in the accent colour, e.g. the "→" in a route name. */
  titleHighlight?: string;
  /** Accessible replacement for that token, when it is a glyph. */
  titleHighlightLabel?: string;
  lead?: string;
  /** Mounts a background coach behind the header on capable devices. */
  scene?: AmbientPreset;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <header
      className={cn(
        "relative overflow-hidden pt-40 pb-16 md:pt-48 md:pb-20",
        scene && "pb-24 md:pb-32",
        className,
      )}
    >
      <Backdrop />

      {scene && (
        // Sits to the right of the type column, clear of the text. A radial
        // mask rather than `mask-fade-b`: a linear fade cuts a visible
        // horizontal line straight through the wheels, where a radial one
        // lets the vehicle dissolve into the page on every edge.
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-[-14%] top-20 opacity-80 md:inset-x-auto md:right-[-4%] md:w-[58%]"
          style={{
            // Centred a little high so the wheel line falls inside the fade.
            // The procedural coach's hubs read as bright crescents at this
            // near-top-down framing, and letting the lower body dissolve into
            // the page is both the better look and the cheaper fix.
            maskImage:
              "radial-gradient(closest-side at 50% 38%, black 46%, transparent 92%)",
          }}
        >
          <AmbientCoach preset={scene} className="absolute inset-0" />
        </div>
      )}

      <div className="container-page relative">
        <div className="max-w-3xl">
          <div className="anim-rise" style={{ animationDelay: "0.05s" }}>
            <Eyebrow>{eyebrow}</Eyebrow>
          </div>

          <h1 className="mt-6 text-display text-gradient">
            <WordReveal
              text={title}
              delay={0.16}
              highlight={titleHighlight}
              highlightLabel={titleHighlightLabel}
            />
          </h1>

          {lead && (
            <p
              className="anim-rise mt-6 max-w-xl text-body-lg text-ink-muted"
              style={{ animationDelay: "0.45s" }}
            >
              {lead}
            </p>
          )}
        </div>

        {children && (
          <div className="anim-rise" style={{ animationDelay: "0.6s" }}>
            {children}
          </div>
        )}
      </div>
    </header>
  );
}

/**
 * Depth behind the masthead: a technical grid, a warm horizon and a vignette.
 * Three cheap layers rather than one flat gradient — the same recipe as the
 * hero, so a subpage feels like the same room.
 */
function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div
        className="absolute inset-0 opacity-[0.3]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(255 255 255 / 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.03) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 80% 70% at 30% 30%, black, transparent 100%)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 60% at 50% 0%, rgb(200 164 104 / 0.10), transparent 70%)",
        }}
      />

      <div
        className="absolute inset-x-0 bottom-0 h-32"
        style={{ background: "linear-gradient(to top, var(--color-base), transparent)" }}
      />
    </div>
  );
}
