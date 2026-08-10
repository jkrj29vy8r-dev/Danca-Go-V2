import { AlertTriangle, Info } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { LegalToc } from "./legal-toc";
import type { LegalBlock, LegalDoc } from "@/lib/legal";
import { legalEntity, site } from "@/lib/site";

const updatedFormatter = new Intl.DateTimeFormat("ro-RO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/**
 * Registration details block.
 *
 * Anything still `null` in `legalEntity` renders as a visible amber marker
 * rather than being silently dropped. A missing CUI on a published legal page
 * is a compliance gap, and a gap you can see gets fixed — one you can't, does
 * not.
 */
function EntityDetails() {
  const rows = [
    { label: "Denumire", value: legalEntity.name },
    { label: "Cod unic de înregistrare (CUI)", value: legalEntity.cui },
    { label: "Nr. Registrul Comerțului", value: legalEntity.regCom },
    { label: "Sediu social", value: legalEntity.address },
    { label: "Licență de transport", value: legalEntity.licence },
    { label: "Email", value: site.email },
    { label: "Telefon", value: site.phones.join(" · ") },
  ];

  return (
    <dl className="my-8 grid gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-2">
      {rows.map((row) => (
        <div key={row.label} className="flex flex-col gap-1.5 bg-surface px-6 py-5">
          <dt className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-dim">
            {row.label}
          </dt>
          <dd className="text-sm text-ink">
            {row.value ?? (
              <span className="inline-flex items-center gap-1.5 text-warning">
                <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
                De completat înainte de lansare
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Block({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case "p":
      return <p className="my-5 leading-[1.75] text-ink-muted">{block.text}</p>;

    case "list":
      return (
        <ul className="my-6 flex flex-col gap-3">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3.5 leading-[1.7] text-ink-muted">
              <span aria-hidden className="mt-[0.6em] size-1 shrink-0 rounded-full bg-accent" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case "note":
      return (
        <aside className="my-8 rounded-2xl border border-hairline bg-surface p-6">
          <p className="flex items-center gap-2.5 text-sm font-medium text-ink">
            <Info className="size-4 shrink-0 text-accent" aria-hidden />
            {block.title}
          </p>
          <p className="mt-2.5 text-sm leading-[1.7] text-ink-muted">{block.text}</p>
        </aside>
      );

    case "table":
      return (
        // Long clauses in a narrow column: the table scrolls inside its own box
        // instead of pushing the page sideways on a phone.
        <div className="my-8 overflow-x-auto rounded-2xl border border-hairline">
          <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
            <thead>
              <tr>
                {block.head.map((cell) => (
                  <th
                    key={cell}
                    scope="col"
                    className="border-b border-hairline bg-surface px-5 py-4 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink-dim"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.join("|")} className="border-b border-hairline last:border-b-0">
                  {row.map((cell, index) => (
                    <td
                      key={cell}
                      className={
                        index === 0
                          ? "px-5 py-4 align-top leading-[1.65] text-ink"
                          : "px-5 py-4 align-top leading-[1.65] text-ink-muted"
                      }
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "entity":
      return <EntityDetails />;
  }
}

/**
 * Shared shell for the three legal documents.
 *
 * Deliberately plainer than the marketing pages: no scroll-linked reveals on
 * the body text, because a clause the reader is trying to find should never be
 * mid-animation. The only motion is the header entrance.
 */
export function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <article className="pb-28">
      <header className="relative overflow-hidden pt-40 pb-14 md:pt-48 md:pb-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(70% 60% at 50% 0%, rgb(200 164 104 / 0.08), transparent 70%)",
          }}
        />
        <div className="container-page">
          <Reveal className="max-w-3xl">
            <Eyebrow>{doc.eyebrow}</Eyebrow>
            <h1 className="mt-6 text-headline text-gradient">{doc.title}</h1>
            <p className="mt-6 max-w-xl text-body-lg text-ink-muted">{doc.lead}</p>
            <p className="mt-8 text-sm text-ink-dim">
              Ultima actualizare:{" "}
              <time dateTime={doc.updated} className="text-ink-muted">
                {updatedFormatter.format(new Date(doc.updated))}
              </time>
            </p>
          </Reveal>
        </div>
      </header>

      <div className="container-page">
        <div className="grid gap-16 border-t border-hairline pt-14 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-20">
          <LegalToc sections={doc.sections} />

          {/* min-w-0 is what keeps the cookie table scrolling inside its own
              box on a phone: without it the grid item's automatic minimum
              width takes the table's 34rem and widens the whole page. */}
          <div className="min-w-0 max-w-2xl">
            {doc.sections.map((section) => (
              <section key={section.id} className="mb-14 last:mb-0">
                <h2
                  id={section.id}
                  // Clears the fixed navbar when the browser handles the jump
                  // natively — reduced motion, or a link opened in a new tab.
                  className="scroll-mt-32 text-title text-ink"
                >
                  {section.heading}
                </h2>
                {section.blocks.map((block, index) => (
                  <Block key={index} block={block} />
                ))}
              </section>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
