import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { promises, stats } from "@/lib/site";

export function PromiseSection() {
  return (
    <section className="container-page py-28 md:py-40">
      <Reveal className="max-w-3xl">
        <Eyebrow>De ce Danca Go</Eyebrow>
        <h2 className="mt-6 text-headline text-gradient">
          Un transportator se judecă în detalii.
        </h2>
      </Reveal>

      <RevealGroup className="mt-16 grid gap-x-12 gap-y-12 sm:grid-cols-2">
        {promises.map((promise, index) => (
          <RevealItem key={promise.title}>
            <article className="border-t border-hairline pt-7">
              <span className="text-sm tabular-nums text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-title text-ink">{promise.title}</h3>
              <p className="mt-3 max-w-md leading-relaxed text-ink-muted">{promise.body}</p>
            </article>
          </RevealItem>
        ))}
      </RevealGroup>

      <RevealGroup className="mt-28 grid gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <RevealItem key={stat.label}>
            <div className="flex h-full flex-col gap-3 bg-surface p-8 md:p-10">
              <span className="text-[2.5rem] font-semibold leading-none tracking-[-0.04em] tabular-nums text-ink">
                {stat.value}
                {stat.suffix && (
                  <span className="ml-1.5 text-lg font-normal tracking-normal text-ink-dim">
                    {stat.suffix}
                  </span>
                )}
              </span>
              <span className="text-sm text-ink-muted">{stat.label}</span>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
