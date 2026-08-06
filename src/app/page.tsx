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
 *   hero (desire + action) → services (what we sell) → network (where) →
 *   fleet (with what) → proof (why trust us) → standards (how) → close
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <CityMarquee />
      <ServicesSection />
      <RoutesSection />
      <FleetSection />
      <ProofSection />
      <PromiseSection />
      <CtaSection />
    </>
  );
}
