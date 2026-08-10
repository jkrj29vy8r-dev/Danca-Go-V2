import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { BookingLookup } from "@/components/booking/booking-lookup";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Găsește-ți rezervarea",
  description:
    "Caută o rezervare Danca Go după codul primit și adresa de email folosită la rezervare.",
  robots: { index: false, follow: false },
};

export default function BookingLookupPage() {
  return (
    <>
      <PageHeader
        eyebrow="Rezervarea mea"
        title="Găsește-ți rezervarea."
        lead="Introdu codul primit la rezervare și emailul folosit. Îți arătăm cursa, pasagerii și starea plății."
      />

      <div className="container-page pb-28">
        <Reveal className="max-w-2xl">
          <BookingLookup />
        </Reveal>
      </div>
    </>
  );
}
