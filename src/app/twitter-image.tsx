import { ImageResponse } from "next/og";
import { renderOgCard } from "@/lib/og-image";
import { OG_SIZE } from "@/lib/og-constants";

/**
 * Same card as `opengraph-image.tsx`, as its own file rather than reused via
 * fallback: X's card validator reads `twitter:image` directly and doesn't
 * reliably fall back to `og:image` the way some other unfurlers do, so a
 * site with only an opengraph-image file can end up with an imageless X
 * card even though Facebook/WhatsApp/Slack all render it fine.
 */
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const { node, fonts } = await renderOgCard();
  return new ImageResponse(node, { ...OG_SIZE, fonts });
}
