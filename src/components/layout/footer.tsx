import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { Logo } from "./logo";
import { footerNav, formatCount, phoneDisplay, site } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-32 overflow-hidden border-t border-hairline bg-void">
      {/* Oversized wordmark bleeding off the bottom edge — a confident sign-off */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 select-none overflow-hidden"
      >
        <span className="block translate-y-[28%] text-center text-[22vw] font-semibold leading-none tracking-[-0.05em] text-white/[0.025]">
          DANCA GO
        </span>
      </div>

      <div className="container-page relative py-20 md:py-24">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
          <div className="flex flex-col gap-6">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-ink-muted">
              {site.description}
            </p>

            <div className="flex flex-col gap-2.5">
              {site.phones.map((phone) => (
                <a
                  key={phone}
                  href={`tel:${phone}`}
                  className="inline-flex w-fit items-center gap-2.5 text-sm text-ink-muted transition-colors duration-300 hover:text-ink"
                >
                  <Phone className="size-3.5 text-accent" aria-hidden />
                  <span className="tabular-nums">{phoneDisplay(phone)}</span>
                </a>
              ))}
              <a
                href={`mailto:${site.email}`}
                className="inline-flex w-fit items-center gap-2.5 text-sm text-ink-muted transition-colors duration-300 hover:text-ink"
              >
                <Mail className="size-3.5 text-accent" aria-hidden />
                {site.email}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {footerNav.map((group) => (
              <div key={group.title}>
                <h3 className="text-eyebrow uppercase text-ink-dim">{group.title}</h3>
                <ul className="mt-5 flex flex-col gap-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      {"external" in link && link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-ink-muted transition-colors duration-300 hover:text-ink"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-ink-muted transition-colors duration-300 hover:text-ink"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-hairline pt-8 text-xs text-ink-dim sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.legalName} · Toate drepturile rezervate.
          </p>
          <p className="flex items-center gap-2">
            <span className="text-accent tabular-nums">{site.rating.score}</span>
            <span>/ {site.rating.max} — evaluat de peste {formatCount(site.rating.count)} de pasageri</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
