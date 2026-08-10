import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-page grid gap-10 pt-40 pb-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-16 md:pt-48">
      <p className="sr-only">Se încarcă detaliile cursei…</p>

      <aside className="surface-card flex flex-col gap-6 p-8">
        <Skeleton className="h-3 w-32" />
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-12 w-20" />
          <Skeleton className="h-px flex-1" />
          <Skeleton className="h-12 w-20" />
        </div>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </aside>

      <div className="surface-card flex flex-col gap-6 p-6 md:p-9">
        <Skeleton className="h-7 w-full max-w-xs" />
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
        <Skeleton className="h-13 w-full rounded-full sm:w-40" />
      </div>
    </div>
  );
}
