import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FaqBrowser } from "@/components/faq/faq-browser";
import { Reveal } from "@/components/motion/reveal";
import { Button, ButtonLink } from "@/components/ui/button";
import { faqGroups, faqJsonLd } from "@/lib/faq";
import { phoneDisplay, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Întrebări frecvente",
  description:
    "Răspunsuri clare despre rezervări, bagaje, transfer aeroport, plată și închirieri de autocare la Danca Go.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }}
      />

      <PageHeader
        eyebrow="Ajutor"
        title="Întrebări frecvente."
        lead="Tot ce ne întreabă pasagerii cel mai des, răspuns fără ocolișuri. Dacă nu găsești ce cauți, suntem la un telefon distanță."
      />

      <section className="container-page pb-28">
        <FaqBrowser groups={faqGroups} />
      </section>

      <section className="container-page pb-8">
        <Reveal>
          <div className="surface-card flex flex-col items-start gap-8 overflow-hidden p-8 md:flex-row md:items-center md:justify-between md:p-12">
            <div>
              <h2 className="text-title text-ink">A rămas o întrebare fără răspuns?</h2>
              <p className="mt-3 max-w-md leading-relaxed text-ink-muted">
                Scrie-ne sau sună-ne. Răspunde un om care știe exact ce vehicul pleacă
                mâine dimineață și de unde.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <ButtonLink href="/contact" variant="primary" size="lg">
                <Mail className="size-4" aria-hidden />
                Scrie-ne
              </ButtonLink>
              {/* Plain anchor, not ButtonLink: `tel:` is a protocol handler,
                  not a route for the client router to prefetch. */}
              <Button asChild variant="secondary" size="lg">
                <a href={`tel:${site.phones[0]}`}>
                  <Phone className="size-4" aria-hidden />
                  <span className="tabular-nums">{phoneDisplay(site.phones[0])}</span>
                </a>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
