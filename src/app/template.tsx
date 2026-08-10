"use client";

import { motion } from "framer-motion";

/**
 * Page transition.
 *
 * `template.tsx` (not `layout.tsx`) is what makes this work: Next remounts a
 * template on every navigation, so the enter animation actually replays —
 * a layout would mount once and never animate again.
 *
 * Deliberately restrained: a short rise and defocus, no full-screen wipe. A
 * curtain would add ~600ms of dead time to every click, which reads as slow
 * rather than expensive once you've navigated three times.
 *
 * `initial={false}` on the first paint would skip the animation entirely, so
 * it's left on — but the transform is small enough that it never delays the
 * LCP text becoming readable.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, filter: "blur(3px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
