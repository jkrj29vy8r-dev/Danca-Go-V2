import * as React from "react";
import { cn } from "@/lib/utils";

/** shadcn/ui Input, restyled for the Danca Go dark surface. */
function Input({ className, type, ...props }: React.ComponentPropsWithoutRef<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full rounded-xl border border-hairline bg-white/[0.03] px-4 py-3",
        "text-[0.9375rem] text-ink placeholder:text-ink-faint outline-none",
        "transition-colors duration-300 hover:border-hairline-strong",
        "focus:border-accent/60 focus:bg-white/[0.05]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink",
        "[color-scheme:dark]",
        className,
      )}
      {...props}
    />
  );
}

/** Matching textarea, same surface treatment. */
function Textarea({ className, ...props }: React.ComponentPropsWithoutRef<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "w-full resize-y rounded-xl border border-hairline bg-white/[0.03] px-4 py-3",
        "text-[0.9375rem] text-ink placeholder:text-ink-faint outline-none",
        "transition-colors duration-300 hover:border-hairline-strong",
        "focus:border-accent/60 focus:bg-white/[0.05]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Native <select> on purpose: mobile browsers render it as a platform picker,
 * which beats any custom listbox for a booking form. Styled to match Input.
 */
function Select({ className, ...props }: React.ComponentPropsWithoutRef<"select">) {
  return (
    <select
      data-slot="select"
      className={cn(
        "w-full rounded-xl border border-hairline bg-white/[0.03] px-4 py-3",
        "text-[0.9375rem] text-ink outline-none",
        "transition-colors duration-300 hover:border-hairline-strong",
        "focus:border-accent/60 focus:bg-white/[0.05]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "[&>option]:bg-raised",
        className,
      )}
      {...props}
    />
  );
}

export { Input, Textarea, Select };
