import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { Logo } from "./logo";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { footerNav, formatCount, phoneDisplay, site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Shared underline-sweep hover, matching the navbar's link treatment. The
 * footer previously used a plain `hover:text-ink` colour shift here — every
 * other link on the site sweeps an underline out from the click point, so a
 * bare colour change on the page's last, largest block of links was the one
 * remaining inconsistency in how the site treats a hover.
 */
const linkClass = cn(
  "group/flink relative inline-flex w-fit items-center gap-2.5 py-1 text-sm",
  "text-ink-muted transition-colors duration-300 hover:text-ink",
);

function LinkUnderline() {
  return (
    <span
      aria-hidden
      className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-accent/70 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/flink:scale-x-100"
    />
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-32 overflow-hidden border-t border-hairline bg-void">
      {/* Oversized wordmark bleeding off the bottom edge — a confident sign-off.
          Carries a slow, continuous gold drift: see `watermark-drift` in
          globals.css for why this is safe to run non-stop rather than as a
          one-shot like the navbar logo's. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 select-none overflow-hidden"
      >
        <span className="relative block translate-y-[28%] text-center text-[22vw] font-semibold leading-none tracking-[-0.05em] text-white/[0.025]">
          DANCA GO
          <span
            className="absolute inset-y-0 w-1/4 mix-blend-overlay [animation:watermark-drift_11s_ease-in-out_infinite]"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.7), transparent)",
            }}
          />
        </span>
      </div>

      <div className="container-page relative py-20 md:py-24">
        <RevealGroup className="grid gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]" stagger={0.1}>
          <RevealItem>
            <div className="flex flex-col gap-6">
              <Logo />
              <p className="max-w-xs text-sm leading-relaxed text-ink-muted">
                {site.description}
              </p>

              <div className="flex flex-col gap-0.5">
                {site.phones.map((phone) => (
                  <a key={phone} href={`tel:${phone}`} className={linkClass}>
                    <Phone className="size-3.5 shrink-0 text-accent" aria-hidden />
                    <span className="tabular-nums">{phoneDisplay(phone)}</span>
                    <LinkUnderline />
                  </a>
                ))}
                <a href={`mailto:${site.email}`} className={linkClass}>
                  <Mail className="size-3.5 shrink-0 text-accent" aria-hidden />
                  {site.email}
                  <LinkUnderline />
                </a>
              </div>
            </div>
          </RevealItem>

          <RevealItem>
            <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
              {footerNav.map((group) => (
                <div key={group.title}>
                  <h3 className="text-eyebrow uppercase text-ink-dim">{group.title}</h3>
                  {/* gap-1 + py-1 rather than gap-3 on a bare link: the row keeps
                      the same rhythm, but the tap target grows from 18px to 26px
                      and clears the 24px minimum on a phone. */}
                  <ul className="mt-4 flex flex-col gap-1">
                    {/* Keyed by label, not href: two links can legitimately point
                        at the same page ("Închirieri autocare" / "…microbuze"),
                        and href keys would collide. */}
                    {group.links.map((link) => (
                      <li key={link.label}>
                        {"external" in link && link.external ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(linkClass, "block")}
                          >
                            {link.label}
                            <LinkUnderline />
                          </a>
                        ) : (
                          <Link href={link.href} className={cn(linkClass, "block")}>
                            {link.label}
                            <LinkUnderline />
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </RevealItem>
        </RevealGroup>

        <Reveal delay={0.15}>
          <div className="mt-20 flex flex-col gap-4 border-t border-hairline pt-8 text-xs text-ink-dim sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {site.legalName} · Toate drepturile rezervate.
            </p>
            <p className="flex items-center gap-2">
              <span className="text-accent tabular-nums">{site.rating.score}</span>
              <span>/ {site.rating.max} — evaluat de peste {formatCount(site.rating.count)} de pasageri</span>
            </p>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
