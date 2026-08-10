/**
 * 1200×630 — the OG/Twitter `summary_large_image` standard.
 *
 * Split out from `og-image.tsx` so that `seo.ts` (imported by every page) can
 * reference the dimensions without pulling that module's font-loading and
 * JSX render logic — and its `node:fs`/`node:path` imports — into every
 * page's server bundle just for two numbers.
 */
export const OG_SIZE = { width: 1200, height: 630 };
