"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * shadcn/ui Accordion, restyled for the dark surface.
 *
 * The height transition runs on Radix's own CSS variables
 * (`--radix-accordion-content-height`), declared as keyframes in globals.css —
 * animating `height: auto` is not possible, and animating max-height guesses
 * a ceiling that a long answer eventually breaks through.
 */
const Accordion = AccordionPrimitive.Root;

function AccordionItem({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      className={cn("border-b border-hairline", className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          "group/acc flex flex-1 items-start justify-between gap-6 py-6 text-left",
          "text-[1.0625rem] font-medium tracking-[-0.015em] text-ink md:text-lg",
          "transition-colors duration-300 hover:text-accent-bright",
          className,
        )}
        {...props}
      >
        <span>{children}</span>
        <span
          aria-hidden
          className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border border-hairline text-ink-dim transition-all duration-500 ease-[var(--ease-out-expo)] group-hover/acc:border-hairline-strong group-hover/acc:text-ink group-data-[state=open]/acc:rotate-45 group-data-[state=open]/acc:border-accent/50 group-data-[state=open]/acc:text-accent"
        >
          <Plus className="size-3.5" />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn("max-w-2xl pb-7 pr-10 leading-[1.7] text-ink-muted", className)}>
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
