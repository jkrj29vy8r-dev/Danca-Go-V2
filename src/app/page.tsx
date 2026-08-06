import { Hero } from "@/components/home/hero";
import { CityMarquee } from "@/components/home/marquee";
import { RoutesSection } from "@/components/home/routes-section";
import { FleetSection } from "@/components/home/fleet-section";
import { PromiseSection } from "@/components/home/promise-section";
import { CtaSection } from "@/components/home/cta-section";

/**
 * Homepage narrative:
 *   hero (desire + action) → network (where) → fleet (what) →
 *   proof (why us) → close (act now)
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <CityMarquee />
      <RoutesSection />
      <FleetSection />
      <PromiseSection />
      <CtaSection />
    </>
  );
}
