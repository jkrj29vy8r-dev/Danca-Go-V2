import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { openingHours, priceRange, site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  keywords: [
    "transport persoane",
    "curse Piatra Neamț București",
    "transfer Otopeni Roman",
    "Târgu Neamț București autocar",
    "Roman Constanța cursa",
    "închiriere autocar microbuz România",
    "Danca Go",
  ],
  authors: [{ name: site.legalName }],
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

/** Rich result eligibility for the local business + its rating. */
const structuredData = {
  "@context": "https://schema.org",
  "@type": "TransportationCompany",
  name: site.name,
  legalName: site.legalName,
  description: site.description,
  url: site.url,
  image: `${site.url}/opengraph-image`,
  email: site.email,
  telephone: site.phones,
  foundingDate: String(site.founded),
  priceRange,
  address: {
    "@type": "PostalAddress",
    addressLocality: site.address.city,
    addressCountry: "RO",
  },
  openingHoursSpecification: openingHours.map((hours) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: hours.days,
    opens: hours.opens,
    closes: hours.closes,
  })),
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: site.rating.score,
    bestRating: site.rating.max,
    ratingCount: site.rating.count,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="grain min-h-dvh bg-base text-ink antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        <SmoothScroll>
          <Navbar />
          <main id="continut">{children}</main>
          <Footer />
        </SmoothScroll>

        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--color-raised)",
              border: "1px solid var(--color-hairline)",
              color: "var(--color-ink)",
            },
          }}
        />

        {/* Both are no-ops anywhere but Vercel's own infrastructure — safe
            to ship unconditionally rather than branching on an env var, and
            they start reporting the moment Analytics/Speed Insights is
            switched on in the Vercel project dashboard, no redeploy needed. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
