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
          "transition-colors duration-500",
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
