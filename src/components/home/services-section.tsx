"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/magnetic";
import { WordsUp } from "@/components/motion/text-reveal";
import { services } from "@/lib/site";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The three things Danca Go actually sells: scheduled seats, vehicles with a
 * driver, and transport for a custom day out.
 *
 * This section carries the positioning. Danca Go is a transport operator, not
 * a travel agency — the third card is deliberately "we drive you where you
 * decide", never a packaged tour with an itinerary attached.
 */
export function ServicesSection() {
  return (
    <section className="container-page py-28 md:py-36">
      <Reveal className="max-w-2xl">
        <Eyebrow>Ce facem</Eyebrow>
        <h2 className="mt-6 text-headline text-gradient">
          <WordsUp>Transport. Atât, dar făcut impecabil.</WordsUp>
        </h2>
        <p className="mt-5 max-w-lg text-body-lg text-ink-muted">
          Nu vindem pachete turistice. Vindem drumuri făcute bine — cu orar
          respectat, vehicule întreținute și șoferi pe care te poți baza.
        </p>
      </Reveal>

      <motion.ul
        className="mt-16 grid gap-4 md:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-8% 0px -12% 0px" }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
      >
        {services.map((service, index) => (
          <motion.li
            key={service.slug}
            variants={{
              hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
              visible: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { duration: 1.1, ease: EASE },
              },
            }}
          >
            <TiltCard className="h-full" maxTilt={5}>
            <Card className="h-full transition-transform duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1">
              <Link
                href={service.href}
                className="flex h-full flex-col justify-between gap-12 p-8"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm tabular-nums text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <ArrowUpRight
                      aria-hidden
                      className="size-4 shrink-0 text-ink-faint transition-all duration-500 ease-[var(--ease-out-expo)] group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5 group-hover/card:text-accent"
                    />
                  </div>

                  <h3 className="mt-7 text-title text-ink">{service.title}</h3>
                  <p className="mt-3 leading-relaxed text-ink-muted">{service.body}</p>
                </div>

                <span className="text-sm text-ink-dim transition-colors duration-300 group-hover/card:text-ink">
                  {service.cta}
                </span>
              </Link>
            </Card>
            </TiltCard>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}
