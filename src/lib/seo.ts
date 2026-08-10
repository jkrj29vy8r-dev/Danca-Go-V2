import type { Metadata } from "next";
import { site } from "./site";
import { OG_SIZE } from "./og-constants";

/**
 * Explicit dimensions rather than a bare URL string: a crawler that has to
 * fetch and decode the image before it can lay out a preview is slower to
 * unfurl, and the file-convention route already reports these for free on
 * the one segment where it auto-fills (see `pageMetadata` below) — every
 * other page should get the same completeness, not a lesser version.
 */
const shareImage = (path: "/opengraph-image" | "/twitter-image") => [
  { url: path, width: OG_SIZE.width, height: OG_SIZE.height, type: "image/png" },
];

/**
 * Builds a complete per-page `Metadata` object: title, description, canonical,
 * Open Graph and Twitter Card, all from three strings.
 *
 * Why this exists rather than hand-writing each block: Next.js does not deep
 * merge `openGraph`/`twitter` between a layout and a page — if a page sets its
 * own `openGraph`, that object *replaces* the root layout's entirely rather
 * than extending it. A page that set `openGraph: { title, description }` and
 * nothing else would silently lose the root's `type`, `locale` and
 * `siteName`, and every social share of that page would look unbranded. This
 * helper re-states those fixed fields every time, so no page can forget them.
 *
 * `images` points at the file-convention routes directly rather than relying
 * on Next to inject them: `src/app/opengraph-image.tsx` only auto-fills a
 * page's `openGraph.images` when that page has no `openGraph` object of its
 * own *and* lives in the same route segment as the image file — confirmed by
 * building and inspecting the rendered `<head>`, where the home page (same
 * segment as the file) got `og:image` for free and `/flota` (a child segment
 * with its own `openGraph` object) did not. Referencing the URL explicitly
 * sidesteps that scoping rule entirely, and is one static asset either way —
 * every page pointing at the same generated PNG is not a duplicate render.
 */
export function pageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: {
  title: string;
  description: string;
  /**
   * Site-relative, leading slash — resolved against `metadataBase`. Omit it
   * for a route whose real URL this call site cannot state correctly — a
   * dynamic segment rendered from a static `metadata` export has no params to
   * build one from, and a wrong canonical (e.g. every checkout page claiming
   * to be `/rezervare`) is worse than none.
   */
  path?: string;
  /** For pages that exist but should never be indexed or shared, e.g. a live checkout. */
  noIndex?: boolean;
}): Metadata {
  const shareTitle = `${title} — ${site.name}`;

  return {
    title,
    description,
    ...(path && { alternates: { canonical: path } }),
    openGraph: {
      type: "website",
      locale: site.locale.replace("-", "_"),
      siteName: site.name,
      ...(path && { url: path }),
      title: shareTitle,
      description,
      images: shareImage("/opengraph-image"),
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      images: shareImage("/twitter-image"),
    },
    ...(noIndex && { robots: { index: false, follow: false } }),
  };
}

/**
 * `BreadcrumbList` structured data for a page.
 *
 * Only worth adding where the trail is real: every intermediate step must be
 * a URL that actually exists and navigates there, so a nested page whose
 * parent has no index route (there is no `/legal` or `/servicii` hub) states
 * a flat two-step trail rather than inventing a middle crumb that goes
 * nowhere.
 */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      item: `${site.url}${step.path}`,
    })),
  };
}
