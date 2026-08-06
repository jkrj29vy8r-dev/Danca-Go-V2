import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-medium tracking-[-0.01em] rounded-full select-none",
    "transition-[transform,background-color,border-color,color,box-shadow,opacity]",
    "duration-300 ease-[var(--ease-out-expo)]",
    "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        // Primary: white pill. Apple's "Buy" button energy.
        primary:
          "bg-ink text-void hover:bg-white/90 shadow-[0_1px_2px_rgb(0_0_0/0.5),0_8px_24px_-8px_rgb(255_255_255/0.25)]",
        // Accent: the one gold moment per screen.
        accent:
          "bg-accent text-void hover:bg-accent-bright shadow-[0_1px_2px_rgb(0_0_0/0.5),0_8px_28px_-8px_rgb(200_164_104/0.55)]",
        // Secondary: glass over dark, gradient hairline border.
        secondary: cn(
          "text-ink bg-white/[0.06] hover:bg-white/[0.10]",
          "border border-hairline hover:border-hairline-strong backdrop-blur-xl",
        ),
        ghost: "text-ink-muted hover:text-ink hover:bg-white/[0.06]",
        link: "text-ink-muted hover:text-ink underline-offset-4 hover:underline rounded-none px-0",
      },
      size: {
        sm: "h-9 px-4 text-[0.8125rem]",
        md: "h-11 px-6 text-sm",
        lg: "h-13 px-8 text-[0.9375rem]",
        icon: "size-11 px-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonBaseProps = VariantProps<typeof buttonVariants> & {
  className?: string;
  children?: React.ReactNode;
};

export type ButtonProps = ButtonBaseProps &
  Omit<React.ComponentPropsWithoutRef<"button">, keyof ButtonBaseProps>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}

export type ButtonLinkProps = ButtonBaseProps &
  Omit<React.ComponentPropsWithoutRef<typeof Link>, keyof ButtonBaseProps>;

/** Same visual language as Button, but renders a real anchor for navigation. */
export function ButtonLink({ className, variant, size, ...props }: ButtonLinkProps) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
