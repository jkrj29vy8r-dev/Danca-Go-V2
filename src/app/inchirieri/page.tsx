import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { RentalForm } from "@/components/rentals/rental-form";
import { Reveal } from "@/components/motion/reveal";
import { phoneDisplay, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Închirieri autocare",
  description:
    "Închiriere autocare și microbuze cu șofer pentru grupuri, companii, echipe sportive și excursii. Ofertă în 24 de ore.",
};

const useCases = [
  { title: "Corporate & delegații", body: "Transport pentru echipe, training-uri și evenimente de companie, cu factură și contract." },
  { title: "Excursii & pelerinaje", body: "Grupuri organizate, în țară și în străinătate, cu șoferi obișnuiți cu drumurile lungi." },
  { title: "Echipe sportive", body: "Spațiu pentru echipament, plecări nocturne și program adaptat competițiilor." },
  { title: "Evenimente private", body: "Nunți, aniversări și transferuri de invitați între locații." },
];

export default function RentalsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Închirieri"
        title="Autocarul tău, programul tău."
        lead="Închiriem autocare și microbuze cu șofer, pentru orice grup și orice traseu. Spune-ne ce ai nevoie — îți răspundem cu o ofertă în cel mult 24 de ore."
      />

      <div className="container-page grid gap-14 pb-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-20">
        <div>
          <Reveal>
            <h2 className="text-title text-ink">Pentru ce ne sună lumea</h2>
            <ul className="mt-8 flex flex-col gap-8">
              {useCases.map((useCase, index) => (
                <li key={useCase.title} className="border-t border-hairline pt-6">
                  <span className="text-sm tabular-nums text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 text-ink">{useCase.title}</h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
                    {useCase.body}
                  </p>
                </li>
              ))}
            </ul>

            <p className="mt-12 text-sm text-ink-muted">
              Preferi să vorbim direct?{" "}
              <a href={`tel:${site.phones[0]}`} className="text-accent hover:underline">
                {phoneDisplay(site.phones[0])}
              </a>
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <RentalForm />
        </Reveal>
      </div>
    </>
  );
}
