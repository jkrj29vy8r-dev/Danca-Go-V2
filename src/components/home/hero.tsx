import { ArrowRight, Bus, Star } from "lucide-react";
import { CoachStage } from "@/components/three/coach-stage";
import { WordReveal } from "@/components/motion/word-reveal";
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

        <h1 className="mt-6 text-center text-display-xl text-gradient">
          <WordReveal text="Drumul tău," delay={0.2} />
          {/* <br> contributes no whitespace to textContent, so the two lines
              would otherwise concatenate for screen readers and crawlers. */}
          <br />{" "}
          <WordReveal text="fără compromisuri." delay={0.34} />
        </h1>

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
          <ButtonLink
            href="/rezervare"
            variant="primary"
            size="lg"
            className="group w-full sm:w-auto"
          >
            Rezervă bilet
            <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
          </ButtonLink>

          <ButtonLink
            href="/inchirieri"
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Bus className="size-4" aria-hidden />
            Închiriază autocar
          </ButtonLink>
        </div>
      </div>

      {/* flex-1 with a modest floor: the band absorbs whatever height is left
          after the type and dock, so the dock stays above the fold at 900px
          and the coach simply gets larger on taller screens.
          The camera fit is bound by this band's *height* on every viewport we
          ship — the coach is a wide, short subject in a wide, short box — so
          every pixel added here is a directly larger vehicle. */}
      <div className="relative z-10 min-h-[200px] flex-1 md:min-h-[250px]">
        <CoachStage className="absolute inset-0" />
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

      {/* Horizon glow */}
      <div
        className="absolute inset-x-0 bottom-0 h-[55%]"
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
