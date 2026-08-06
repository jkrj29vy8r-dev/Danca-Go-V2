import { cn } from "@/lib/utils";

/**
 * Small uppercase section label with a gold tick. Used once per section to
 * establish hierarchy before the headline — Apple's "Overview / Tech Specs" cue.
 */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 text-eyebrow uppercase text-ink-dim",
        className,
      )}
    >
      <span aria-hidden className="size-1 rounded-full bg-accent" />
      {children}
    </span>
  );
}
