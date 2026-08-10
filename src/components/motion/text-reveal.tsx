"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * True when the element is already at or past the trigger line at setup time —
 * a deep link, a restored scroll position, or a jump-scroll.
 *
 * This guard is the whole reason these reveals are safe. A scroll-triggered
 * `fromTo` applies its from-state immediately on creation, so if the trigger
 * then never fires (because the element was already past it) the text stays
 * parked out of frame *and looks like missing content*. Rather than animate
 * from a hidden state and hope, we simply don't hide anything that the reader
 * can already see.
 */
function alreadyInView(node: HTMLElement, ratio = 0.85) {
  const rect = node.getBoundingClientRect();
  return rect.top < window.innerHeight * ratio;
}

/**
 * Scroll-linked text reveals.
 *
 * Every variant here starts from the *final, readable* DOM — the text is in the
 * markup as plain text, and GSAP only wraps it after mount. That ordering
 * matters: a headline built out of per-word spans in the server render is
 * invisible until hydration and reads as gibberish to a crawler that ignores
 * the wrappers. Under prefers-reduced-motion nothing is wrapped at all.
 */

/** Splits on words, preserving real spaces so textContent stays intact. */
function wrapWords(node: HTMLElement): HTMLElement[] {
  const text = node.textContent ?? "";
  const words = text.split(/(\s+)/);
  node.textContent = "";

  const inner: HTMLElement[] = [];

  for (const chunk of words) {
    if (/^\s+$/.test(chunk)) {
      node.appendChild(document.createTextNode(chunk));
      continue;
    }
    const mask = document.createElement("span");
    mask.style.display = "inline-block";
    mask.style.overflow = "hidden";
    mask.style.verticalAlign = "bottom";
    // Descenders (ț, ș, g) get clipped by overflow:hidden without this pad.
    mask.style.paddingBottom = "0.14em";
    mask.style.marginBottom = "-0.14em";

    const word = document.createElement("span");
    word.style.display = "inline-block";
    word.textContent = chunk;

    mask.appendChild(word);
    node.appendChild(mask);
    inner.push(word);
  }

  return inner;
}

/**
 * Words rise from behind a mask as the block enters. The signature headline
 * treatment — heavier than a fade, still readable the whole way.
 */
export function WordsUp({
  children,
  className,
  stagger = 0.045,
  duration = 1,
  start = "top 85%",
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  duration?: number;
  start?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion()) return;

    if (alreadyInView(node)) return;

    const words = wrapWords(node);
    if (words.length === 0) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        words,
        { yPercent: 115 },
        {
          yPercent: 0,
          duration,
          ease: "expo.out",
          stagger,
          scrollTrigger: { trigger: node, start, once: true, invalidateOnRefresh: true },
        },
      );
    }, node);

    // Wrapping words changed this block's height, so any trigger measured
    // before now is reading a stale position.
    ScrollTrigger.refresh();

    return () => {
      context.revert();
      // gsap.context restores the tween, not our DOM surgery.
      node.textContent = node.textContent;
    };
  }, [stagger, duration, start]);

  return (
    <span ref={ref} className={cn("inline-block", className)}>
      {children}
    </span>
  );
}

/**
 * Wipes the block in behind a travelling clip-path edge. Used where a word
 * reveal would be too busy — long paragraphs, image captions, dividers.
 */
export function ClipReveal({
  children,
  className,
  direction = "up",
  duration = 1.1,
  start = "top 88%",
}: {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "left";
  duration?: number;
  start?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion()) return;

    if (alreadyInView(node, 0.9)) return;

    const from =
      direction === "up"
        ? "inset(100% 0% 0% 0%)"
        : "inset(0% 100% 0% 0%)";

    const context = gsap.context(() => {
      gsap.fromTo(
        node,
        { clipPath: from, opacity: 0.4 },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          opacity: 1,
          duration,
          ease: "expo.out",
          scrollTrigger: { trigger: node, start, once: true, invalidateOnRefresh: true },
        },
      );
    });

    return () => context.revert();
  }, [direction, duration, start]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/**
 * Dims the text and lights it up word by word as the block crosses the
 * viewport — scrubbed, so the reader controls the pace. Reserved for one
 * statement per page; used more than that it becomes a tic.
 */
export function ReadThrough({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion()) return;

    if (alreadyInView(node, 0.8)) return;

    const words = wrapWords(node);
    if (words.length === 0) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        words,
        { opacity: 0.3 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.5,
          scrollTrigger: {
            trigger: node,
            start: "top 80%",
            end: "bottom 55%",
            scrub: 0.6,
          },
        },
      );
    }, node);

    return () => {
      context.revert();
      node.textContent = node.textContent;
    };
  }, []);

  return (
    <p ref={ref} className={className}>
      {children}
    </p>
  );
}
