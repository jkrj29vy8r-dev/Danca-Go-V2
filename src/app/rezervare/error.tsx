"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { phoneDisplay, site } from "@/lib/site";

/**
 * Booking is the one flow where a failure costs the company a sale, so the
 * error state offers a retry *and* the phone number rather than a dead end.
 */
export default function BookingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Booking route error:", error);
  }, [error]);

  return (
    <section className="container-page flex min-h-[60vh] flex-col items-start justify-center py-32">
      <Eyebrow>Eroare</Eyebrow>
      <h1 className="mt-6 max-w-xl text-headline text-gradient">
        Nu am putut încărca cursele.
      </h1>
      <p className="mt-5 max-w-md text-body-lg text-ink-muted">
        A fost o problemă de conexiune cu sistemul de rezervări. Încearcă din nou
        — dacă persistă, sună-ne și rezolvăm pe loc.
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button type="button" variant="primary" size="lg" onClick={reset}>
          <RotateCcw className="size-4" aria-hidden />
          Încearcă din nou
        </Button>
        <ButtonLink href={`tel:${site.phones[0]}`} variant="secondary" size="lg">
          {phoneDisplay(site.phones[0])}
        </ButtonLink>
      </div>
    </section>
  );
}
