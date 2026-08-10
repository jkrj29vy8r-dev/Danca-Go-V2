"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Phone, X } from "lucide-react";
import { Logo } from "./logo";
import { ButtonLink } from "@/components/ui/button";
import { navigation, phoneDisplay, site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Floating navbar. Transparent over the hero, then condenses into a blurred
 * pill once scrolled — the Apple/Linear pattern, which keeps the hero clean
 * while guaranteeing contrast over arbitrary content further down.
 */
export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on navigation.
  useEffect(() => setMenuOpen(false), [pathname]);

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // The overlay covers the whole screen and blocks the page behind it, so it
  // behaves like a modal even though it's a nav drawer — treat it like one:
  // move focus in on open, trap Tab inside it, close on Escape, and hand
  // focus back to the toggle button on close rather than letting it fall
  // back to <body>.
  useEffect(() => {
    if (!menuOpen) return;

    const panel = menuRef.current;
    if (!panel) return;

    const focusables = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

    focusables()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const nodes = focusables();
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !menuOpen) {
      toggleRef.current?.focus();
    }
    wasOpen.current = menuOpen;
  }, [menuOpen]);

  return (
    <>
      <a
        href="#continut"
        className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-100 focus:rounded-full focus:bg-ink focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-void"
      >
        Sari la conținut
      </a>

      <header className="fixed inset-x-0 top-0 z-50 pt-3 md:pt-5">
        <div className="container-page">
          <nav
            className={cn(
              "flex h-14 items-center justify-between gap-6 rounded-full px-4 md:px-5",
              "transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-[var(--ease-out-expo)]",
              scrolled
                ? "border border-hairline bg-void/70 shadow-[0_8px_32px_-12px_rgb(0_0_0/0.8)] backdrop-blur-2xl"
                : "border border-transparent bg-transparent",
            )}
          >
            <Logo />

            <ul className="hidden items-center gap-1 lg:flex">
              {navigation.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group/nav relative rounded-full px-3.5 py-2 text-sm transition-colors duration-300",
                        active ? "text-ink" : "text-ink-muted hover:text-ink",
                      )}
                    >
                      {item.label}
                      {/* Sweeps out from the centre on hover; skipped on the
                          active item, which already has its own pill. */}
                      {!active && (
                        <span
                          aria-hidden
                          className="absolute inset-x-3.5 bottom-1 h-px origin-center scale-x-0 bg-accent/70 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/nav:scale-x-100"
                        />
                      )}
                      {active && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 -z-10 rounded-full bg-white/[0.07]"
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${site.phones[0]}`}
                className="hidden items-center gap-2 rounded-full px-3.5 py-2 text-sm text-ink-muted transition-colors duration-300 hover:text-ink md:inline-flex"
              >
                <Phone className="size-3.5" aria-hidden />
                <span className="tabular-nums">{phoneDisplay(site.phones[0])}</span>
              </a>

              <ButtonLink href="/rezervare" variant="primary" size="sm" className="hidden sm:inline-flex">
                Rezervă
              </ButtonLink>

              <button
                ref={toggleRef}
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-controls="meniu-mobil"
                aria-label={menuOpen ? "Închide meniul" : "Deschide meniul"}
                className="grid size-10 place-items-center rounded-full text-ink transition-colors duration-300 hover:bg-white/[0.07] lg:hidden"
              >
                {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            id="meniu-mobil"
            role="dialog"
            aria-modal="true"
            aria-label="Meniu de navigare"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-void/95 backdrop-blur-2xl lg:hidden"
          >
            <div className="container-page flex h-full flex-col justify-between pb-12 pt-28">
              <ul className="flex flex-col">
                {navigation.map((item, index) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.06 * index,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="border-b border-hairline"
                  >
                    <Link
                      href={item.href}
                      className="block py-5 text-[1.75rem] font-medium tracking-[-0.03em] text-ink"
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-3"
              >
                <ButtonLink href="/rezervare" variant="accent" size="lg" className="w-full">
                  Rezervă un bilet
                </ButtonLink>
                {site.phones.map((phone) => (
                  <a
                    key={phone}
                    href={`tel:${phone}`}
                    className="flex items-center justify-center gap-2 rounded-full border border-hairline py-3 text-sm text-ink-muted"
                  >
                    <Phone className="size-3.5" aria-hidden />
                    <span className="tabular-nums">{phoneDisplay(phone)}</span>
                  </a>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
