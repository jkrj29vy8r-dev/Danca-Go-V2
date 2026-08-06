/**
 * Env resolution kept in one place so the marketing site still builds and
 * renders when Supabase isn't configured yet. Data-backed surfaces check
 * `isSupabaseConfigured` and fall back to static content from `@/lib/site`.
 */

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase nu este configurat. Setează NEXT_PUBLIC_SUPABASE_URL și NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
}
