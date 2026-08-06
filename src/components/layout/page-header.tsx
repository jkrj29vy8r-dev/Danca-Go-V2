import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/** Shared masthead for every non-home page. Keeps vertical rhythm identical. */
export function PageHeader({
  eyebrow,
  title,
  lead,
  className,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className={cn("relative overflow-hidden pt-40 pb-16 md:pt-48 md:pb-20", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(70% 60% at 50% 0%, rgb(200 164 104 / 0.10), transparent 70%)",
        }}
      />

      <div className="container-page">
        <Reveal className="max-w-3xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-6 text-display text-gradient">{title}</h1>
          {lead && <p className="mt-6 max-w-xl text-body-lg text-ink-muted">{lead}</p>}
        </Reveal>

        {children}
      </div>
    </header>
  );
}
