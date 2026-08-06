"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/motion/reveal";
import { CountUp, Parallax } from "@/components/motion/scroll-effects";
import { ratingBreakdown, site, testimonials } from "@/lib/site";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Social proof. The rating is the loudest number on the page, so it gets
 * display-scale type and a distribution bar chart — an average alone is a
 * marketing claim, an average with its distribution is evidence.
 */
export function ProofSection() {
  return (
    <section className="relative overflow-hidden border-t border-hairline py-28 md:py-40">
      <Parallax speed={0.25} className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(45% 45% at 22% 40%, rgb(200 164 104 / 0.10), transparent 70%)",
          }}
        />
      </Parallax>

      <div className="container-page">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-24">
          {/* --- The number --- */}
          <div>
            <Reveal>
              <Eyebrow>Ce spun pasagerii</Eyebrow>

              <div className="mt-8 flex items-start gap-5">
                <span className="text-[clamp(4rem,9vw,7rem)] font-semibold leading-[0.85] tracking-[-0.05em] tabular-nums text-gradient">
                  <CountUp value={site.rating.score} decimals={2} />
                </span>
                <span className="mt-2 text-lg text-ink-dim">/ {site.rating.max}</span>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <Stars value={site.rating.score} />
                <span className="text-sm text-ink-muted">
                  <CountUp value={site.rating.count} suffix="+" /> evaluări
                </span>
              </div>

              <p className="mt-8 max-w-sm leading-relaxed text-ink-muted">
                Media strânsă în {new Date().getFullYear() - site.founded} ani de
                curse, de la pasageri care au călătorit efectiv cu noi.
              </p>
            </Reveal>

            {/* --- Distribution --- */}
            <motion.ul
              className="mt-12 flex max-w-sm flex-col gap-2.5"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-10% 0px" }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
            >
              {ratingBreakdown.map((row) => (
                <motion.li
                  key={row.stars}
                  className="flex items-center gap-4"
                  variants={{
                    hidden: { opacity: 0, x: -12 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
                  }}
                >
                  <span className="w-3 text-right text-sm tabular-nums text-ink-dim">
                    {row.stars}
                  </span>
                  <Star className="size-3 shrink-0 fill-current text-ink-faint" aria-hidden />

                  <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.span
                      className="block h-full rounded-full bg-accent"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: row.share / 100 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.4, ease: EASE, delay: 0.1 }}
                      style={{ transformOrigin: "left" }}
                    />
                  </span>

                  <span className="w-9 text-right text-sm tabular-nums text-ink-dim">
                    {row.share}%
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          </div>

          {/* --- Testimonials --- */}
          <motion.ul
            className="grid gap-4 sm:grid-cols-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-8% 0px" }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
          >
            {testimonials.map((testimonial) => (
              <motion.li
                key={testimonial.author}
                variants={{
                  hidden: { opacity: 0, y: 36, filter: "blur(6px)" },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: { duration: 1.1, ease: EASE },
                  },
                }}
              >
                <Card className="h-full">
                  <figure className="flex h-full flex-col justify-between gap-8 p-7">
                    <div>
                      <Stars value={testimonial.rating} size="sm" />
                      <blockquote className="mt-5 leading-relaxed text-ink-muted">
                        “{testimonial.quote}”
                      </blockquote>
                    </div>

                    <figcaption className="border-t border-hairline pt-5">
                      <span className="block text-sm text-ink">{testimonial.author}</span>
                      <span className="mt-0.5 block text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">
                        {testimonial.context}
                      </span>
                    </figcaption>
                  </figure>
                </Card>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}

/** Five glyphs with the fractional star clipped to the exact rating. */
function Stars({ value, size = "md" }: { value: number; size?: "sm" | "md" }) {
  const dimension = size === "sm" ? "size-3.5" : "size-4";

  return (
    <span
      className="inline-flex items-center gap-1"
      role="img"
      aria-label={`${value} din 5 stele`}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.min(Math.max(value - index, 0), 1);
        return (
          <span key={index} className={cn("relative", dimension)}>
            <Star className={cn(dimension, "absolute inset-0 text-ink-faint")} aria-hidden />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star className={cn(dimension, "fill-current text-accent")} aria-hidden />
            </span>
          </span>
        );
      })}
    </span>
  );
}
