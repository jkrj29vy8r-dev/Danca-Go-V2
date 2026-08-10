import { ImageResponse } from "next/og";
import { renderOgCard } from "@/lib/og-image";
import { OG_SIZE } from "@/lib/og-constants";

/**
 * Applies to every route under `src/app` that doesn't define its own — Next
 * resolves this file-convention image per segment and injects it into that
 * page's `openGraph.images`, independent of whatever the page's own
 * `generateMetadata`/`metadata` export sets (see `src/lib/seo.ts`). No page
 * needs to reference this file or set `images` itself.
 *
 * Has no dynamic params, so Next renders it once at build time — a static
 * file after that, not a per-request cost.
 */
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const { node, fonts } = await renderOgCard();
  return new ImageResponse(node, { ...OG_SIZE, fonts });
}
