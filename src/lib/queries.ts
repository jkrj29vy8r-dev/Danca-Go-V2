import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { TripSearchResult } from "@/lib/types/database";

export type TripSearchParams = {
  from?: string;
  to?: string;
  date?: string;
  seats?: number;
};

export type TripSearchOutcome =
  | { state: "unconfigured" }
  | { state: "error"; message: string }
  | { state: "ok"; trips: TripSearchResult[] };

/**
 * Runs a departure search against the `trip_search` view.
 *
 * The view is filtered to scheduled trips on active routes, so this only has
 * to apply the user's criteria. Returns a discriminated union rather than
 * throwing, so the page can render a designed state for every outcome instead
 * of falling back to an error boundary.
 */
export async function searchTrips(params: TripSearchParams): Promise<TripSearchOutcome> {
  if (!isSupabaseConfigured) return { state: "unconfigured" };

  try {
    const supabase = await createClient();

    let query = supabase
      .from("trip_search")
      .select("*")
      .order("departure_time", { ascending: true })
      .limit(50);

    if (params.date) query = query.eq("departure_date", params.date);
    if (params.from) query = query.ilike("origin_name", `%${params.from}%`);
    if (params.to) query = query.ilike("dest_name", `%${params.to}%`);
    if (params.seats && params.seats > 1) {
      // seats_available is a generated column on the view, so filter on the
      // underlying counts instead.
      query = query.gte("seats_total", params.seats);
    }

    const { data, error } = await query;

    if (error) return { state: "error", message: error.message };

    const trips = (data ?? []).filter(
      (trip) => trip.seats_available >= (params.seats ?? 1),
    );

    return { state: "ok", trips };
  } catch (error) {
    return {
      state: "error",
      message: error instanceof Error ? error.message : "Eroare necunoscută",
    };
  }
}
