"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { bookingSchema, bookingLookupSchema, type BookingInput } from "@/lib/schemas";
import type { Booking, BookingPassenger, TripSearchResult } from "@/lib/types/database";
import { HOLD_MINUTES } from "@/lib/payments";

export type BookingResult =
  | { ok: true; reference: string; total: number; holdExpiresAt: string | null }
  | { ok: false; message: string };

/**
 * Creates a booking through the `book_trip` RPC.
 *
 * All seat arithmetic happens inside that function under a row lock, so this
 * action never touches `trips` directly — that's what makes overselling
 * impossible even with concurrent buyers. The RPC also writes one
 * `booking_passengers` row per seat and stamps a hold window, so an abandoned
 * checkout returns its seats instead of holding them forever.
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
      p_passengers: data.passengers.map((passenger) => ({
        full_name: passenger.full_name,
        is_child: passenger.is_child,
      })),
      p_seat_count: data.passengers.length,
      p_notes: data.notes || null,
      p_hold_minutes: HOLD_MINUTES,
    });

    if (error) {
      // book_trip raises Romanian-language messages, so they're safe to surface.
      return { ok: false, message: error.message };
    }

    return {
      ok: true,
      reference: booking.booking_ref,
      total: booking.total_price,
      holdExpiresAt: booking.hold_expires_at,
    };
  } catch {
    return { ok: false, message: "Nu am putut finaliza rezervarea. Încearcă din nou." };
  }
}

/* -------------------------------------------------------------------------- */
/*                              BOOKING RETRIEVAL                              */
/* -------------------------------------------------------------------------- */

export type BookingDetails = {
  booking: Booking;
  trip: TripSearchResult;
  passengers: BookingPassenger[];
};

export type LookupResult =
  | { ok: true; details: BookingDetails }
  | { ok: false; message: string };

/**
 * Guest retrieval. There is no SELECT policy on `bookings` for anonymous
 * users — the reference plus the email is the shared secret, checked inside a
 * SECURITY DEFINER function.
 */
export async function lookupBooking(input: {
  booking_ref: string;
  contact_email: string;
}): Promise<LookupResult> {
  const parsed = bookingLookupSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datele trimise nu sunt valide.",
    };
  }

  if (!isSupabaseConfigured) {
    return { ok: false, message: "Căutarea nu este conectată în acest mediu." };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_booking_details", {
      p_booking_ref: parsed.data.booking_ref,
      p_contact_email: parsed.data.contact_email,
    });

    if (error) {
      return { ok: false, message: "Nu am putut căuta rezervarea. Încearcă din nou." };
    }

    if (!data) {
      // Deliberately identical whether the ref is unknown or the email is
      // wrong — otherwise this becomes a way to test which refs exist.
      return {
        ok: false,
        message: "Nu am găsit nicio rezervare cu acest cod și email.",
      };
    }

    return { ok: true, details: data as BookingDetails };
  } catch {
    return { ok: false, message: "Nu am putut căuta rezervarea. Încearcă din nou." };
  }
}
