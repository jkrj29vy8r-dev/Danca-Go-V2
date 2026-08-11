"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Magnetic } from "@/components/motion/magnetic";
import { phoneDisplay, site } from "@/lib/site";

/**
 * Catches any rendering/runtime error on a route that doesn't define its own
 * `error.tsx` — `/rezervare` and `/rezervare/[tripId]` have more specific
 * ones for their live-data failure modes; this is the branded fallback for
 * everywhere else, in place of Next's default error screen.
 *
 * Root layout (navbar, footer, JSON-LD) keeps rendering around this: `error.tsx`
 * replaces only the page content inside `<main>`, not the whole document —
 * that's what `global-error.tsx` is for, and it's reserved for a crash in the
 * layout itself.
 */
export default function GlobalPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <section className="container-page flex min-h-[70vh] flex-col items-start justify-center py-32">
      <Eyebrow>Eroare</Eyebrow>
      <h1 className="mt-6 max-w-xl text-headline text-gradient">
        Ceva nu a mers cum trebuia.
      </h1>
      <p className="mt-5 max-w-md text-body-lg text-ink-muted">
        Pagina a întâmpinat o eroare neașteptată. Încearcă din nou — dacă
        persistă, sună-ne și rezolvăm pe loc.
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Magnetic strength={0.22}>
          <Button type="button" variant="primary" size="lg" onClick={reset}>
            <RotateCcw className="size-4" aria-hidden />
            Încearcă din nou
          </Button>
        </Magnetic>
        <ButtonLink href="/" variant="secondary" size="lg">
          Prima pagină
        </ButtonLink>
        {/* Plain anchor: `tel:` is a protocol handler, not a route. */}
        <Button asChild variant="ghost" size="lg">
          <a href={`tel:${site.phones[0]}`}>{phoneDisplay(site.phones[0])}</a>
        </Button>
      </div>
    </section>
  );
}
