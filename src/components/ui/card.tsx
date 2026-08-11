"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Surface card with a cursor-tracked radial highlight on the border —
 * the Linear/Stripe "spotlight" treatment. Pure CSS variables, no re-render
 * per mousemove.
 */
export function Card({
  className,
  children,
  interactive = true,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { interactive?: boolean }) {
  const ref = React.useRef<HTMLDivElement>(null);

  const handleMove = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!interactive) return;
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      node.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      node.style.setProperty("--my", `${event.clientY - rect.top}px`);
    },
    [interactive],
  );

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className={cn(
        "surface-card group/card overflow-hidden",
        interactive && [
          // Depth on hover, not just a colour change. A card that only tints
          // reads as a link; one that lifts off the page and casts under
          // itself reads as an object, which is the whole point of a dark
          // layered surface.
          "transition-[color,background-color,border-color,box-shadow,transform] duration-500 ease-[var(--ease-out-expo)]",
          "hover:-translate-y-1 hover:border-hairline-strong",
          "hover:shadow-[0_24px_50px_-24px_rgb(0_0_0/0.9),0_0_0_1px_rgb(200_164_104/0.12)]",
          // Highlight layer follows the pointer; fades in on hover only.
          "before:pointer-events-none before:absolute before:inset-0 before:z-10",
          "before:rounded-[inherit] before:opacity-0 before:transition-opacity before:duration-500",
          "hover:before:opacity-100",
          "before:bg-[radial-gradient(320px_circle_at_var(--mx,50%)_var(--my,50%),rgb(200_164_104/0.10),transparent_70%)]",
        ],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
