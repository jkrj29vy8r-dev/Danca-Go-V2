"use client";

import { useEffect, useState } from "react";
import { AnchorLink } from "@/components/motion/anchor-link";
import type { LegalSection } from "@/lib/legal";
import { cn } from "@/lib/utils";

/**
 * Sticky table of contents with scroll-spy.
 *
 * The observer watches a narrow horizontal band near the top of the viewport
 * rather than the whole screen, so exactly one section reads as "current" even
 * when three of them are visible at once. Sections are ranked by document
 * order, which keeps the highlight from flickering between neighbours as a
 * long clause scrolls past.
 */
export function LegalToc({ sections }: { sections: readonly LegalSection[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const nodes = sections
      .map((section) => document.getElementById(section.id))
      .filter((node): node is HTMLElement => node !== null);

    if (nodes.length === 0) return;

    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }

        const first = sections.find((section) => visible.has(section.id));
        if (first) setActive(first.id);
      },
      // Top band only: from just under the navbar to 60% down the viewport.
      { rootMargin: "-112px 0px -40% 0px", threshold: 0 },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav aria-label="Cuprins" className="hidden lg:block">
      <div className="sticky top-32">
        <p className="text-eyebrow uppercase text-ink-dim">Cuprins</p>
        <ul className="mt-6 flex flex-col gap-1 border-l border-hairline">
          {sections.map((section) => {
            const current = section.id === active;
            return (
              <li key={section.id}>
                <AnchorLink
                  id={section.id}
                  aria-current={current ? "true" : undefined}
                  className={cn(
                    "relative -ml-px block border-l py-1.5 pl-5 text-sm leading-snug transition-colors duration-300",
                    current
                      ? "border-accent text-ink"
                      : "border-transparent text-ink-dim hover:text-ink-muted",
                  )}
                >
                  {section.heading}
                </AnchorLink>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
