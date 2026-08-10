import { TripResultSkeleton } from "@/components/ui/skeleton";

/**
 * Shown while the trip search runs. The page is force-dynamic, so on a slow
 * connection this is what stands between submitting the search and seeing
 * results — it mirrors the real result rows rather than showing a spinner.
 */
export default function Loading() {
  return (
    <div className="container-page pt-40 pb-24 md:pt-48">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-white/[0.06]" aria-hidden />
      <p className="sr-only">Se caută curse disponibile…</p>

      <div className="mt-10 flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <TripResultSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
