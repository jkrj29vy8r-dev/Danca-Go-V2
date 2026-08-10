"use client";

import * as React from "react";
import { scrollToId } from "./smooth-scroll";

/**
 * An in-page link that scrolls through Lenis instead of jumping.
 *
 * It stays a real `<a href="#id">`: modified clicks, middle-click and the
 * context menu all keep their native behaviour, and the URL still updates so
 * the section can be copied and shared. Only the plain left click is
 * intercepted — and only when the target actually exists.
 */
export function AnchorLink({
  id,
  children,
  onClick,
  ...props
}: Omit<React.ComponentPropsWithoutRef<"a">, "href"> & { id: string }) {
  return (
    <a
      href={`#${id}`}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }

        if (scrollToId(id)) {
          event.preventDefault();
          window.history.replaceState(null, "", `#${id}`);
        }
      }}
      {...props}
    >
      {children}
    </a>
  );
}
