import { Hero } from "@/components/home/hero";
import { CityMarquee } from "@/components/home/marquee";
import { ServicesSection } from "@/components/home/services-section";
import { RoutesSection } from "@/components/home/routes-section";
import { FleetSection } from "@/components/home/fleet-section";
import { ProofSection } from "@/components/home/proof-section";
import { PromiseSection } from "@/components/home/promise-section";
import { CtaSection } from "@/components/home/cta-section";

/**
 * Homepage narrative:
 *   hero (desire + action) → network (where) → fleet (with what) →
 *   services (what we sell) → proof (why trust us) → standards (how) → close
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <CityMarquee />
      <RoutesSection />
      <FleetSection />
      <ServicesSection />
      <ProofSection />
      <PromiseSection />
      <CtaSection />
    </>
  );
}
