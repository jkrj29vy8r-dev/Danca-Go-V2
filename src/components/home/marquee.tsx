import { cities } from "@/lib/site";

/**
 * Infinite city ticker. The list is duplicated once and translated -50%, so the
 * loop is seamless with a single CSS animation and no JS.
 */
export function CityMarquee() {
  return (
    <section
      aria-label="Orașe deservite"
      className="relative overflow-hidden border-y border-hairline py-6"
    >
      <div
        className="flex w-max animate-marquee"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        }}
      >
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
            {cities.map((city) => (
              <li
                key={`${copy}-${city}`}
                className="flex shrink-0 items-center gap-10 px-10 text-title text-ink-faint"
              >
                {city}
                <span aria-hidden className="size-1 rounded-full bg-accent/60" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
