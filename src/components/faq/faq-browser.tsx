"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { AnchorLink } from "@/components/motion/anchor-link";
import { Reveal } from "@/components/motion/reveal";
import type { FaqGroup } from "@/lib/faq";
import { cn } from "@/lib/utils";

/** Strips diacritics so "intarziere" finds "întârziere". */
const fold = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export function FaqBrowser({ groups }: { groups: FaqGroup[] }) {
  const [query, setQuery] = useState("");
  // Typing stays responsive even though every keystroke re-filters and
  // re-mounts the accordions.
  const deferred = useDeferredValue(query);

  const filtered = useMemo(() => {
    const needle = fold(deferred.trim());
    if (!needle) return groups;

    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          fold(`${item.question} ${item.answer}`).includes(needle),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, deferred]);

  const total = filtered.reduce((sum, group) => sum + group.items.length, 0);
  const searching = deferred.trim().length > 0;

  return (
    <div className="grid gap-14 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-20">
      <div className="lg:sticky lg:top-32 lg:self-start">
        <label className="relative block">
          <span className="sr-only">Caută în întrebări</span>
          <Search
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Caută un răspuns"
            className="pl-11 pr-10 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Șterge căutarea"
              className="absolute right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-ink-dim transition-colors duration-300 hover:text-ink"
            >
              <X className="size-3.5" />
            </button>
          )}
        </label>

        <nav aria-label="Categorii" className="mt-8 hidden lg:block">
          <ul className="flex flex-col gap-1 border-l border-hairline">
            {groups.map((group) => {
              const empty = searching && !filtered.some((g) => g.id === group.id);
              return (
                <li key={group.id}>
                  <AnchorLink
                    id={group.id}
                    aria-disabled={empty || undefined}
                    className={cn(
                      "-ml-px block border-l border-transparent py-1.5 pl-5 text-sm transition-colors duration-300",
                      empty
                        ? "pointer-events-none text-ink-faint"
                        : "text-ink-dim hover:border-accent hover:text-ink",
                    )}
                  >
                    {group.title}
                  </AnchorLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <p aria-live="polite" className="mt-6 text-sm text-ink-dim">
          {searching
            ? total === 0
              ? "Niciun rezultat"
              : `${total} ${total === 1 ? "răspuns" : "răspunsuri"}`
            : null}
        </p>
      </div>

      {/* min-w-0: a grid item defaults to min-width:auto, so a wide child
          (a long question, a code-ish string) would stretch the track instead
          of wrapping. */}
      <div className="min-w-0">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-hairline bg-surface p-10 text-center">
            <p className="text-title text-ink">Nu am găsit nimic pentru „{deferred.trim()}”.</p>
            <p className="mt-3 text-ink-muted">
              Sună-ne sau scrie-ne — răspundem la orice întrebare, inclusiv la cele care
              nu au ajuns încă pe pagina asta.
            </p>
          </div>
        ) : (
          filtered.map((group) => (
            <section key={group.id} className="mb-16 last:mb-0">
              <h2 id={group.id} className="scroll-mt-32 text-title text-ink">
                {group.title}
              </h2>

              {/* Remounting per query resets any open panel, which is what you
                  want: a filtered list should not inherit the previous one's
                  expanded row. */}
              <Accordion
                key={`${group.id}-${deferred}`}
                type="single"
                collapsible
                className="mt-4 border-t border-hairline"
              >
                {group.items.map((item) => (
                  <AccordionItem key={item.question} value={item.question}>
                    <AccordionTrigger>{item.question}</AccordionTrigger>
                    <AccordionContent>{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

/** Compact variant for route pages — no search, no category rail. */
export function FaqList({
  items,
  className,
}: {
  items: { question: string; answer: string }[];
  className?: string;
}) {
  return (
    <Reveal className={className}>
      <Accordion type="single" collapsible className="border-t border-hairline">
        {items.map((item) => (
          <AccordionItem key={item.question} value={item.question}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Reveal>
  );
}
