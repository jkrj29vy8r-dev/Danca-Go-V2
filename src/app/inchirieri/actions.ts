"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { rentalSchema, type RentalInput } from "@/lib/schemas";
import { generateBookingRef } from "@/lib/utils";

export type RentalResult =
  | { ok: true; reference: string }
  | { ok: false; message: string };

/**
 * Persists a charter enquiry. Re-validates on the server because the client
 * schema is only a UX affordance — anything can POST to a Server Action.
 */
export async function submitRental(input: RentalInput): Promise<RentalResult> {
  const parsed = rentalSchema.safeParse(input);

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
        "Formularul nu este conectat în acest mediu. Sună-ne la +40 725 819 224 și rezolvăm imediat.",
    };
  }

  const data = parsed.data;
  const prefix = data.kind === "experience" ? "EXP-" : "RENT-";
  const reference = generateBookingRef().replace("DG-", prefix);

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("rentals").insert({
      reference,
      user_id: user?.id ?? null,
      contact_name: data.contact_name,
      contact_email: data.contact_email,
      contact_phone: data.contact_phone,
      company_name: data.company_name || null,
      origin: data.origin,
      destination: data.destination,
      start_date: data.start_date,
      end_date: data.end_date || null,
      passenger_count: data.passenger_count,
      vehicle_class: data.vehicle_class || null,
      message: data.message || null,
      kind: data.kind,
      event_type: data.event_type || null,
      flexible_dates: data.flexible_dates,
    });

    if (error) {
      return { ok: false, message: "Nu am putut trimite cererea. Încearcă din nou." };
    }

    return { ok: true, reference };
  } catch {
    return { ok: false, message: "Nu am putut trimite cererea. Încearcă din nou." };
  }
}
