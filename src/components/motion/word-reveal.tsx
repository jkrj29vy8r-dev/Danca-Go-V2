import { Fragment } from "react";
import { cn } from "@/lib/utils";

/**
 * Splits a line into words that rise from behind a mask.
 *
 * Every word is a plain span with a staggered CSS `animation-delay` — no
 * client JS, no hydration wait, and the full string stays in the accessibility
 * tree. That matters most where this is used: on an `<h1>`, which is the LCP
 * element. Driving it with Framer Motion would ship `opacity: 0` in the server
 * HTML and hold the largest paint until hydration.
 *
 * `backwards` on the keyframe holds the from-state through the delay, so a
 * word whose animation has not started yet is still positioned correctly
 * rather than flashing in place.
 */
export function WordReveal({
  text,
  delay = 0,
  stagger = 0.055,
  className,
  /** Exact token to paint in the accent colour, e.g. the "→" in a route name. */
  highlight,
  /** Accessible replacement for the highlighted token, when it is a glyph. */
  highlightLabel,
}: {
  text: string;
  delay?: number;
  stagger?: number;
  className?: string;
  highlight?: string;
  highlightLabel?: string;
}) {
  const words = text.split(" ");

  return (
    <span className={cn("inline-block", className)}>
      {words.map((word, index) => {
        const accented = highlight !== undefined && word === highlight;

        return (
          <Fragment key={`${word}-${index}`}>
            <span className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em]">
              <span
                className={cn("anim-word", accented && "text-accent")}
                style={{ animationDelay: `${delay + index * stagger}s` }}
                // role="img" swaps a glyph for a word in the accessibility
                // tree while leaving textContent untouched.
                {...(accented && highlightLabel
                  ? { role: "img", "aria-label": highlightLabel }
                  : {})}
              >
                {word}
              </span>
            </span>
            {/*
              A real space, as a text node *between* the masks — not inside one.
              Trailing whitespace within an inline-block gets trimmed, which is
              what silently ran words together ("Drumultău"). A margin fixes the
              visuals but leaves textContent unspaced, so screen readers and
              crawlers still read one long word. A sibling text node is the only
              version that is correct both ways.
            */}
            {index < words.length - 1 ? " " : null}
          </Fragment>
        );
      })}
    </span>
  );
}
