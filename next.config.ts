import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF first: meaningfully smaller than WebP at equal quality for
    // photography like the fleet shots, with WebP as the fallback for the
    // browsers that don't decode it. Next only ships WebP by default.
    formats: ["image/avif", "image/webp"],
    // Next's own default is 60 seconds, tuned for images that might change
    // per request. The fleet photos are static marketing assets that change
    // on a "someone replaces a file" cadence, not a per-minute one — a week
    // is a deliberately generous cache window, not an oversight. Nothing
    // here is safety- or price-critical enough that a week-old cached photo
    // would ever be wrong in a way that matters.
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
  // Removes the `X-Powered-By: Next.js` response header — free information
  // disclosure otherwise, telling a scanner the framework and inviting
  // version-targeted probing for nothing gained.
  poweredByHeader: false,
};

export default nextConfig;
