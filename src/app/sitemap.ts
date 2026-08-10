import type { MetadataRoute } from "next";
import { legalDocs } from "@/lib/legal";
import { featuredRoutes, site } from "@/lib/site";

/**
 * Static sitemap.
 *
 * Only pages that make sense as an entry point are listed. The booking flow's
 * inner steps (`/rezervare/[tripId]`) are excluded on purpose: they depend on
 * a live trip row, so a crawler following one would land on an expired
 * departure.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const url = (path: string) => `${site.url}${path}`;

  const primary: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] =
    [
      { path: "", priority: 1, changeFrequency: "weekly" },
      { path: "/rute", priority: 0.9, changeFrequency: "weekly" },
      { path: "/rezervare", priority: 0.9, changeFrequency: "daily" },
      { path: "/flota", priority: 0.8, changeFrequency: "monthly" },
      { path: "/inchirieri", priority: 0.8, changeFrequency: "monthly" },
      { path: "/experiente", priority: 0.7, changeFrequency: "monthly" },
      { path: "/servicii/transfer-aeroport", priority: 0.8, changeFrequency: "monthly" },
      { path: "/despre", priority: 0.6, changeFrequency: "yearly" },
      { path: "/contact", priority: 0.6, changeFrequency: "yearly" },
      { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
      { path: "/cariere", priority: 0.5, changeFrequency: "monthly" },
      { path: "/rezervare/bilet", priority: 0.4, changeFrequency: "yearly" },
    ];

  return [
    ...primary.map((entry) => ({
      url: url(entry.path),
      lastModified: now,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
    })),
    ...featuredRoutes.map((route) => ({
      url: url(`/rute/${route.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...legalDocs.map((doc) => ({
      url: url(`/legal/${doc.slug}`),
      lastModified: new Date(doc.updated),
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
  ];
}
