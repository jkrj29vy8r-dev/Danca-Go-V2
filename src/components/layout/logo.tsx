import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Wordmark. The chevron doubles as a forward-motion mark and the "G" of Go.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Danca Go — prima pagină"
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-full",
        "transition-opacity duration-300 hover:opacity-80",
        className,
      )}
    >
      <svg
        viewBox="0 0 28 28"
        className="size-[26px] shrink-0"
        aria-hidden
        fill="none"
      >
        <circle cx="14" cy="14" r="13" stroke="currentColor" strokeOpacity="0.18" />
        <path
          d="M9.5 8.5 16 14l-6.5 5.5"
          stroke="var(--color-accent)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-[2px]"
        />
        <path d="M18.5 8.5v11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>

      <span className="text-[0.9375rem] font-semibold tracking-[-0.02em]">
        Danca<span className="text-accent"> Go</span>
      </span>
    </Link>
  );
}
