"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { Magnetic, TiltCard } from "@/components/motion/magnetic";
import { WordsUp } from "@/components/motion/text-reveal";
import { featuredRoutes } from "@/lib/site";
import { formatDuration, formatPrice } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export function RoutesSection() {
  return (
    <section className="container-page py-28 md:py-40">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <Reveal className="max-w-2xl">
          <Eyebrow>Rețeaua</Eyebrow>
          <h2 className="mt-6 text-headline text-gradient">
            <WordsUp>Zece orașe. O singură companie.</WordsUp>
          </h2>
          <p className="mt-5 max-w-lg text-body-lg text-ink-muted">
            Din Târgu Neamț, Piatra Neamț, Roman și Bacău spre București,
            Otopeni și Constanța — zilnic, cu opriri regionale pe traseu.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <Magnetic strength={0.18}>
            <ButtonLink href="/rute" variant="secondary" size="md" className="group">
              Toate rutele
              <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
            </ButtonLink>
          </Magnetic>
        </Reveal>
      </div>

      {/*
        Cards enter on a long, low-amplitude stagger. The slowness is the point:
        0.055s between cards over a 1.1s curve reads as considered, where the
        0.02s/0.4s most sites use reads as a page finishing loading.
      */}
      <motion.ul
        className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-8% 0px -12% 0px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.055 } },
        }}
      >
        {featuredRoutes.map((route) => (
          <motion.li
            key={route.slug}
            variants={{
              hidden: { opacity: 0, y: 40, scale: 0.97, filter: "blur(8px)" },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
                transition: { duration: 1.1, ease: EASE },
              },
            }}
          >
            <TiltCard className="h-full" maxTilt={4}>
            <Card className="h-full transition-transform duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1">
              {/* The route page, not the search: a visitor arriving from the
                  homepage still wants to know duration, stops and price before
                  being dropped into a booking form. */}
              <Link
                href={`/rute/${route.slug}`}
                className="flex h-full flex-col justify-between gap-10 p-7"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">
                      {route.frequency}
                    </span>
                    <ArrowUpRight
                      aria-hidden
                      className="size-4 shrink-0 text-ink-faint transition-all duration-500 ease-[var(--ease-out-expo)] group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5 group-hover/card:text-accent"
                    />
                  </div>

                  <p className="mt-6 text-title text-ink">{route.from}</p>
                  <p className="mt-1 flex items-center gap-2.5 text-title text-ink-muted">
                    <span aria-hidden className="text-accent">↓</span>
                    {route.to}
                  </p>
                </div>

                <div className="flex items-end justify-between gap-4 border-t border-hairline pt-5">
                  <span className="flex items-center gap-1.5 text-sm text-ink-dim">
                    <Clock className="size-3.5" aria-hidden />
                    {formatDuration(route.durationMinutes)}
                  </span>
                  <span className="text-right">
                    <span className="block text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">
                      de la
                    </span>
                    <span className="text-lg font-medium tabular-nums text-ink">
                      {formatPrice(route.fromPrice)}
                    </span>
                  </span>
                </div>
              </Link>
            </Card>
            </TiltCard>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}
