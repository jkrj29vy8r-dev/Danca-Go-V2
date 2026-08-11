import { ArrowRight, Bus, Star } from "lucide-react";
import { CoachStage } from "@/components/three/coach-stage";
import { WordReveal } from "@/components/motion/word-reveal";
import { Magnetic } from "@/components/motion/magnetic";
import { HeroMotes } from "./hero-motes";
import { SearchWidget } from "./search-widget";
import { ButtonLink } from "@/components/ui/button";
import { formatCount, site } from "@/lib/site";

/**
 * Hero composition, top to bottom: type → 3D coach → search dock.
 *
 * The coach lives in its own flex-1 band rather than behind the text, so it
 * can never collide with the headline on short viewports, and the dock reads
 * as the surface the vehicle is standing on.
 *
 * This is a Server Component on purpose. Every entrance here is a CSS
 * animation, which means the headline — the LCP element — paints with the HTML
 * instead of waiting for the JS bundle to hydrate a Framer Motion tree.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-dvh flex-col overflow-hidden pt-24 md:pt-28">
      <Backdrop />

      {/*
        The coach is a full-bleed layer spanning the whole hero rather than a
        strip below the type, and that is the single change that makes it read
        as the subject instead of an ornament.

        The arithmetic is unavoidable: a 900px viewport minus the navbar and
        the search dock leaves ~712px, and the type stack needs ~400px of it.
        Reserving a band *below* the type therefore caps the vehicle at ~280px
        no matter how the camera is tuned — it fills that band already. The
        only way to a large vehicle is to stop reserving and start overlapping,
        which is exactly what the automotive sites this is modelled on do: the
        wordmark crosses the car, it does not sit above it.

        Overlap needs the type to stay readable, so the headline is placed to
        cross the glazing band — the darkest, most even part of the body — and
        `HeroScrim` puts a soft pool of shade under the whole type block.
      */}
      <HeroScrim />

      {/* Above the scrim so the motes aren't dimmed by it, below the type so
          they never sit on top of a letterform. */}
      <HeroMotes className="pointer-events-none absolute inset-0 z-10 overflow-hidden" />

      <div className="container-page relative z-20">
        <div className="flex justify-center">
          <div
            className="anim-rise inline-flex items-center gap-2.5 rounded-full border border-hairline bg-white/[0.04] px-4 py-1.5 text-[0.8125rem] backdrop-blur-xl"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="flex items-center gap-1 text-accent">
              <Star className="size-3.5 fill-current" aria-hidden />
              <span className="font-medium tabular-nums">{site.rating.score}</span>
            </span>
            <span aria-hidden className="h-3 w-px bg-hairline-strong" />
            <span className="text-ink-muted">
              {formatCount(site.rating.count)}+ pasageri, din {site.founded}
            </span>
          </div>
        </div>

        {/*
          The shimmer is a *sibling* of the <h1>, inside a relative wrapper —
          not a child of it. That is deliberate and load-bearing: the headline
          carries `.text-gradient` (`background-clip: text; color: transparent`),
          and a positioned descendant paints in a later stacking phase than its
          ancestor's clipped background. Any text inside such a descendant
          renders in the ancestor's declared colour, which here is
          *transparent* — the exact mechanism that made 15 headings across this
          site invisible earlier in the project. Keeping the overlay outside the
          <h1> means the heading's own markup is untouched and cannot regress.
        */}
        <div className="relative mt-6">
          <h1 className="text-center text-display-xl text-gradient">
            <WordReveal text="Drumul tău," delay={0.2} />
            {/* <br> contributes no whitespace to textContent, so the two lines
                would otherwise concatenate for screen readers and crawlers. */}
            <br />{" "}
            <WordReveal text="fără compromisuri." delay={0.34} />
          </h1>

          {/* One pass of gold light across the headline, timed to land just
              after the last word has risen. `watermark-drift` animates `left`
              as a percentage of this wrapper, so the sweep crosses the full
              headline regardless of its width — a `translateX` sweep would be
              relative to the bar's own width and never reach the far edge.

              Fill mode is `both`, not `backwards`. With `backwards` alone the
              bar reverts to its un-animated state the moment the sweep ends —
              and since it sets no static `left`, that means `left: auto`, i.e.
              parked at the wrapper's left edge as a permanently visible pale
              rectangle across the headline. `both` holds the end frame
              (`left: 122%`) instead, which is off the right edge.

              The mask softens the top and bottom edges: without it this is a
              hard-cornered box of light rather than a beam. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 w-1/4 blur-[2px] mix-blend-overlay [animation:watermark-drift_2.6s_ease-in-out_1.15s_1_both]"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgb(255 245 220 / 0.55), transparent)",
              maskImage:
                "linear-gradient(to bottom, transparent, black 22%, black 78%, transparent)",
            }}
          />
        </div>

        <p
          className="anim-rise mx-auto mt-6 max-w-xl text-center text-body-lg text-ink-muted"
          style={{ animationDelay: "0.75s" }}
        >
          Curse zilnice din Moldova spre București, Otopeni și Constanța.
          Închirieri de autocare și microbuze de la 12 locuri, cu șofer.
        </p>

        <div
          className="anim-rise mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row"
          style={{ animationDelay: "0.85s" }}
        >
          {/* The two highest-stakes conversion actions on the whole site, and
              until now the only primary/accent CTAs anywhere that weren't
              wrapped in Magnetic — every other one (cta-section, fleet-section,
              faq, cariere) already pulls toward the cursor. */}
          <Magnetic strength={0.22} className="w-full sm:w-auto">
            <ButtonLink
              href="/rezervare"
              variant="primary"
              size="lg"
              className="group w-full sm:w-auto"
            >
              Rezervă bilet
              <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
            </ButtonLink>
          </Magnetic>

          <Magnetic strength={0.22} className="w-full sm:w-auto">
            <ButtonLink
              href="/inchirieri"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Bus className="size-4" aria-hidden />
              Închiriază autocar
            </ButtonLink>
          </Magnetic>
        </div>
      </div>

      {/*
        The coach lives in this band, but on desktop it *breaks out upward*
        behind the type instead of being confined to it.

        Two different problems, two different behaviours:

        Desktop — a band gets ~300px after the type and dock have taken their
        share, and the camera fit fills that band already, so tuning the camera
        cannot make the vehicle bigger. Only more canvas can. Extending 420px
        up behind the headline roughly triples the height, and the type crossing
        the bodywork is the composition the automotive references use anyway.

        Mobile — the dock is a stacked form ~300px tall, so anchoring the canvas
        to the section's bottom edge buries the whole vehicle behind it. Worse,
        a full-height layer on a 390px-wide phone is *portrait*, and the fit
        then needs a camera distance past its clamp, which crops the coach into
        an unrecognisable slab. Staying inside the band keeps the canvas
        landscape and the vehicle whole.
      */}
      <div className="relative z-0 min-h-[190px] flex-1 md:min-h-[230px]">
        <CoachStage className="pointer-events-none absolute inset-x-0 bottom-0 top-0 md:top-[-420px]" />
      </div>

      <SearchDock />
    </section>
  );
}

/**
 * The search widget is docked to the base of the hero as a full-bleed bar
 * rather than a card floating over the artwork: a single hairline spans the
 * viewport, the coach sits on it, and the fields are divided by rules instead
 * of being boxed. That reads as part of the page architecture, not an overlay
 * that happened to land there.
 */
function SearchDock() {
  return (
    <div
      className="anim-rise relative z-20 border-t border-hairline bg-void/55 backdrop-blur-2xl"
      style={{ animationDelay: "0.95s" }}
    >
      <div className="container-page">
        <div className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:gap-8 lg:py-3">
          <span className="hidden shrink-0 items-center gap-2.5 text-eyebrow uppercase text-ink-dim lg:flex">
            <span aria-hidden className="size-1 rounded-full bg-accent" />
            Caută o cursă
          </span>

          <SearchWidget variant="dock" className="flex-1" />
        </div>
      </div>
    </div>
  );
}

/**
 * A soft pool of shade behind the type block.
 *
 * With the vehicle running full-bleed behind the hero, the headline crosses
 * glossy bodywork that carries moving specular highlights. White type on a
 * travelling highlight is exactly the case where contrast fails intermittently
 * — it passes a static check and then breaks for a second every rotation.
 *
 * This sits between the canvas and the copy, is heaviest where the type is
 * densest, and fades out well before the edges so it never reads as a panel.
 */
function HeroScrim() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[78%]"
      style={{
        background:
          "radial-gradient(52% 46% at 50% 30%, rgb(3 3 3 / 0.9), rgb(3 3 3 / 0.62) 42%, transparent 74%), linear-gradient(to bottom, rgb(3 3 3 / 0.55), transparent 62%)",
      }}
    />
  );
}

function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {/* Faint technical grid — depth without decoration */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(255 255 255 / 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.03) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent 100%)",
        }}
      />

      {/* Horizon glow, breathing slowly. The period is deliberately long
          (19s) and the amplitude small — at this scale the eye reads it as the
          room having air in it, never as something animating. */}
      <div
        className="absolute inset-x-0 bottom-0 h-[55%] origin-bottom [animation:horizon-breathe_19s_ease-in-out_infinite]"
        style={{
          background:
            "radial-gradient(70% 100% at 50% 100%, rgb(200 164 104 / 0.10), transparent 70%)",
        }}
      />

      {/* Vignette pulls the corners down without dimming the centre band
          where the vehicle sits. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 75% at 50% 45%, transparent 45%, rgb(5 5 5 / 0.7) 100%)",
        }}
      />
    </div>
  );
}
