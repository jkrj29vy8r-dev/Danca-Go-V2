import { Star } from "lucide-react";
import { CoachStage } from "@/components/three/coach-stage";
import { SearchWidget } from "./search-widget";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Hero composition, top to bottom: type → 3D coach → search widget.
 *
 * The coach lives in its own flex-1 band rather than behind the text, so it can
 * never collide with the headline on short viewports.
 *
 * This is a Server Component on purpose. Every entrance here is a CSS
 * animation, which means the headline — the LCP element — paints with the HTML
 * instead of waiting for the JS bundle to hydrate a Framer Motion tree.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-dvh flex-col overflow-hidden pt-28 pb-10 md:pt-32">
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
              {site.rating.count}+ pasageri, din {site.founded}
            </span>
          </div>
        </div>

        <h1 className="mt-8 text-center text-display-xl text-gradient">
          <WordReveal text="Drumul tău," delay={0.2} />
          <br />
          <WordReveal text="fără compromisuri." delay={0.34} />
        </h1>

        <p
          className="anim-rise mx-auto mt-7 max-w-xl text-center text-body-lg text-ink-muted"
          style={{ animationDelay: "0.75s" }}
        >
          Curse zilnice între Otopeni, București, Moldova și litoral. Autocare
          moderne, plecări la fix, bilet rezervat în mai puțin de un minut.
        </p>
      </div>

      <div className="relative z-10 min-h-[220px] flex-1 md:min-h-[300px]">
        <CoachStage className="absolute inset-0" />
      </div>

      {/* The one thing that must be reachable without any scrolling. */}
      <div
        className="anim-rise container-page relative z-20 pt-8"
        style={{ animationDelay: "0.95s" }}
      >
        <div className="mx-auto max-w-5xl">
          <SearchWidget />
        </div>
      </div>
    </section>
  );
}

/**
 * Splits a line into words that rise from behind a mask. Each word is a plain
 * span with a staggered CSS animation-delay — no client JS involved, and the
 * full string stays in the accessibility tree.
 */
function WordReveal({
  text,
  delay = 0,
  className,
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  const words = text.split(" ");

  return (
    <span className={cn("inline-block", className)}>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em]"
        >
          <span
            className="anim-word"
            style={{ animationDelay: `${delay + index * 0.055}s` }}
          >
            {word}
            {index < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </span>
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
