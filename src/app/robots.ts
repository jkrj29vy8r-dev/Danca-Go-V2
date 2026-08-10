import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      // The longer, more specific rule wins, so the booking-lookup form stays
      // crawlable while the per-trip checkout URLs underneath it do not —
      // those depend on a live trip row and would 404 the moment it expires.
      allow: ["/", "/rezervare/bilet"],
      disallow: ["/rezervare/"],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
