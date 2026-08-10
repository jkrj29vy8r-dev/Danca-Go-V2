"use client";

import { useEffect } from "react";
import { site } from "@/lib/site";
import "./globals.css";

/**
 * Last resort: fires only when the root layout itself throws, so it cannot
 * assume the layout's chrome (Navbar, Footer, SmoothScroll) is safe to
 * render — those are exactly the kind of complex client components that
 * could have caused the crash, and reusing them here risks the same error
 * recurring inside the boundary meant to catch it. It replaces the entire
 * document, so — uniquely among error boundaries in this app — it defines
 * its own `<html>` and `<body>`.
 *
 * `globals.css` is imported for the colour tokens and base styles (a
 * stylesheet cannot itself throw at runtime), but nothing beyond a plain
 * link and a `mailto:`.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root layout error:", error);
  }, [error]);

  return (
    <html lang="ro">
      <body className="grid min-h-dvh place-items-center bg-base px-6 text-ink antialiased">
        <div className="max-w-md text-center">
          <p className="text-eyebrow uppercase text-ink-dim">Eroare</p>
          <h1 className="mt-6 text-headline text-gradient">
            Site-ul nu s-a putut încărca.
          </h1>
          <p className="mt-5 text-body-lg text-ink-muted">
            A apărut o eroare neașteptată. Reîncarcă pagina — dacă problema
            continuă, scrie-ne la{" "}
            <a href={`mailto:${site.email}`} className="text-accent hover:underline">
              {site.email}
            </a>
            .
          </p>

          <button
            type="button"
            onClick={reset}
            className="mt-10 rounded-full bg-ink px-6 py-3 text-sm font-medium text-void transition-opacity hover:opacity-90"
          >
            Încearcă din nou
          </button>
        </div>
      </body>
    </html>
  );
}
