import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ScrollLines } from "@/components/motion/scroll-effects";
import { promises } from "@/lib/site";

/**
 * Operating standards. The proof section above establishes that people rate us
 * well; this one says why — so it carries no numbers of its own and doesn't
 * repeat the rating.
 */
export function PromiseSection() {
  return (
    <section className="container-page py-28 md:py-40">
      <Reveal className="max-w-3xl">
        <Eyebrow>De ce Danca Go</Eyebrow>
      </Reveal>

      <ScrollLines className="mt-6 max-w-3xl text-headline text-gradient">
        <span className="block">Un transportator</span>
        <span className="block">se judecă în detalii.</span>
      </ScrollLines>

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
    </section>
  );
}
