import { Mail, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { TiltCard, Spotlight } from "@/components/motion/magnetic";
import { WordsUp } from "@/components/motion/text-reveal";
import { ScaleIn, SectionAtmosphere } from "@/components/motion/scroll-effects";
import { openingHours, phoneDisplay, site } from "@/lib/site";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/contact",
  title: "Contact",
  description: `Sună-ne la ${phoneDisplay(site.phones[0])} sau scrie-ne la ${site.email}. Răspundem șapte zile din șapte.`,
});

const breadcrumb = breadcrumbJsonLd([
  { name: "Acasă", path: "/" },
  { name: "Contact", path: "/contact" },
]);

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <PageHeader
        eyebrow="Contact"
        title="Vorbim direct."
        lead="Fără roboți telefonici și fără formulare care se pierd. Suni, îți răspunde un om care știe orarul pe de rost."
      />

      <section className="relative container-page pb-28">
        <SectionAtmosphere align="left" />
        <RevealGroup className="grid gap-4 md:grid-cols-3">
          {site.phones.map((phone, index) => (
            <RevealItem key={phone}>
              <TiltCard maxTilt={5} className="h-full">
              <Card className="h-full transition-transform duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1">
                <a href={`tel:${phone}`} className="flex h-full flex-col gap-6 p-8">
                  <Phone className="size-5 text-accent transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/tilt:-rotate-12" aria-hidden />
                  <span>
                    <span className="block text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">
                      {index === 0 ? "Rezervări" : "Închirieri & grupuri"}
                    </span>
                    <span className="mt-2 block text-title tabular-nums text-ink">
                      {phoneDisplay(phone)}
                    </span>
                  </span>
                </a>
              </Card>
              </TiltCard>
            </RevealItem>
          ))}

          <RevealItem>
            <TiltCard maxTilt={5} className="h-full">
            <Card className="h-full transition-transform duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1">
              <a href={`mailto:${site.email}`} className="flex h-full flex-col gap-6 p-8">
                <Mail className="size-5 text-accent transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/tilt:-translate-y-0.5" aria-hidden />
                <span>
                  <span className="block text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">
                    Email
                  </span>
                  <span className="mt-2 block break-all text-ink">{site.email}</span>
                </span>
              </a>
            </Card>
            </TiltCard>
          </RevealItem>
        </RevealGroup>

        <ScaleIn className="mt-16">
          <Spotlight className="surface-card grid gap-10 overflow-hidden p-8 md:grid-cols-2 md:p-12" size={560}>
            <div>
              <h2 className="flex items-center gap-2.5 text-title text-ink">
                <MapPin className="size-4 text-accent" aria-hidden />
                <WordsUp>Sediul</WordsUp>
              </h2>
              <p className="mt-4 leading-relaxed text-ink-muted">
                {site.legalName}
                <br />
                {site.address.city}, {site.address.country}
              </p>
            </div>

            <div>
              <h2 className="text-title text-ink">Program</h2>
              <dl className="mt-4 flex flex-col gap-2 text-ink-muted">
                {openingHours.map((hours) => (
                  <div
                    key={hours.label}
                    className="flex justify-between gap-4 border-b border-hairline pb-2"
                  >
                    <dt>{hours.label}</dt>
                    <dd className="tabular-nums text-ink">
                      {hours.opens} — {hours.closes}
                    </dd>
                  </div>
                ))}
                <div className="flex justify-between gap-4">
                  <dt>Urgențe cursă</dt>
                  <dd className="text-ink">Non-stop</dd>
                </div>
              </dl>
            </div>
          </Spotlight>
        </ScaleIn>
      </section>
    </>
  );
}
