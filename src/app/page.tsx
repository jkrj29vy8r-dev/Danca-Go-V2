import { Hero } from "@/components/home/hero";
import { CityMarquee } from "@/components/home/marquee";
import { ServicesSection } from "@/components/home/services-section";
import { RoutesSection } from "@/components/home/routes-section";
import { FleetSection } from "@/components/home/fleet-section";
import { ProofSection } from "@/components/home/proof-section";
import { PromiseSection } from "@/components/home/promise-section";
import { CtaSection } from "@/components/home/cta-section";
import { SectionSeam } from "@/components/motion/scroll-effects";

/**
 * Homepage narrative:
 *   hero (desire + action) → network (where) → fleet (with what) →
 *   services (what we sell) → proof (why trust us) → standards (how) → close
 *
 * `SectionSeam` marks every boundary except the two touching `CityMarquee` —
 * that section already carries its own top and bottom border as part of the
 * ticker strip's design, and a second line right against it would double up.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <CityMarquee />
      <RoutesSection />
      <SectionSeam />
      <FleetSection />
      <SectionSeam />
      <ServicesSection />
      <SectionSeam />
      <ProofSection />
      <SectionSeam />
      <PromiseSection />
      <SectionSeam />
      <CtaSection />
    </>
  );
}
