import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { phoneDisplay, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Sună-ne la ${phoneDisplay(site.phones[0])} sau scrie-ne la ${site.email}. Răspundem șapte zile din șapte.`,
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Vorbim direct."
        lead="Fără roboți telefonici și fără formulare care se pierd. Suni, îți răspunde un om care știe orarul pe de rost."
      />

      <section className="container-page pb-28">
        <RevealGroup className="grid gap-4 md:grid-cols-3">
          {site.phones.map((phone, index) => (
            <RevealItem key={phone}>
              <Card className="h-full">
                <a href={`tel:${phone}`} className="flex h-full flex-col gap-6 p-8">
                  <Phone className="size-5 text-accent" aria-hidden />
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
            </RevealItem>
          ))}

          <RevealItem>
            <Card className="h-full">
              <a href={`mailto:${site.email}`} className="flex h-full flex-col gap-6 p-8">
                <Mail className="size-5 text-accent" aria-hidden />
                <span>
                  <span className="block text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">
                    Email
                  </span>
                  <span className="mt-2 block break-all text-ink">{site.email}</span>
                </span>
              </a>
            </Card>
          </RevealItem>
        </RevealGroup>

        <Reveal className="mt-16">
          <div className="surface-card grid gap-10 p-8 md:grid-cols-2 md:p-12">
            <div>
              <h2 className="flex items-center gap-2.5 text-title text-ink">
                <MapPin className="size-4 text-accent" aria-hidden />
                Sediul
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
                <div className="flex justify-between gap-4 border-b border-hairline pb-2">
                  <dt>Luni — Vineri</dt>
                  <dd className="tabular-nums text-ink">07:00 — 21:00</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-hairline pb-2">
                  <dt>Sâmbătă — Duminică</dt>
                  <dd className="tabular-nums text-ink">08:00 — 20:00</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Urgențe cursă</dt>
                  <dd className="text-ink">Non-stop</dd>
                </div>
              </dl>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
