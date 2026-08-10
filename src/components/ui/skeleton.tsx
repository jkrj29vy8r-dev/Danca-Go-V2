import { cn } from "@/lib/utils";

/**
 * Loading placeholder. Sized to match the real content it stands in for, so
 * the layout doesn't jump when data arrives.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-xl bg-white/[0.06]",
        className,
      )}
    />
  );
}

/** One search result row, mid-load. */
export function TripResultSkeleton() {
  return (
    <div className="surface-card flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-7">
      <div className="flex items-center gap-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-px w-16 md:w-24" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      <div className="flex gap-6">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>

      <div className="flex items-center justify-between gap-5 md:justify-end">
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-11 w-24 rounded-full" />
      </div>
    </div>
  );
}
