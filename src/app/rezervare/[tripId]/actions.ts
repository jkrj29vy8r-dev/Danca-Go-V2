"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { bookingSchema, type BookingInput } from "@/lib/schemas";

export type BookingResult =
  | { ok: true; reference: string; total: number }
  | { ok: false; message: string };

/**
 * Creates a booking through the `book_trip` RPC.
 *
 * All seat arithmetic happens inside that function under a row lock, so this
 * action never touches `trips` directly — that's what makes overselling
 * impossible even with concurrent buyers.
 */
export async function createBooking(input: BookingInput): Promise<BookingResult> {
  const parsed = bookingSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datele trimise nu sunt valide.",
    };
  }

  if (!isSupabaseConfigured) {
    return {
      ok: false,
      message:
        "Rezervarea online nu este conectată în acest mediu. Sună-ne la +40 725 819 224.",
    };
  }

  const data = parsed.data;

  try {
    const supabase = await createClient();

    const { data: booking, error } = await supabase.rpc("book_trip", {
      p_trip_id: data.trip_id,
      p_contact_name: data.contact_name,
      p_contact_email: data.contact_email,
      p_contact_phone: data.contact_phone,
      p_seat_count: data.seat_count,
      p_notes: data.notes || null,
    });

    if (error) {
      // Postgres raises Romanian-language messages from book_trip, so they're
      // safe to surface directly.
      return { ok: false, message: error.message };
    }

    return {
      ok: true,
      reference: booking.booking_ref,
      total: booking.total_price,
    };
  } catch {
    return { ok: false, message: "Nu am putut finaliza rezervarea. Încearcă din nou." };
  }
}
