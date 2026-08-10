import { z } from "zod";

/** Shared between the client form and the Server Action. */
export const rentalSchema = z
  .object({
    contact_name: z.string().trim().min(3, "Introdu numele complet").max(120),
    company_name: z.string().trim().max(160).optional().or(z.literal("")),
    contact_email: z.email("Adresă de email invalidă").max(160),
    contact_phone: z
      .string()
      .trim()
      .min(9, "Număr de telefon invalid")
      .max(24)
      .regex(/^[+0-9 ().-]+$/, "Număr de telefon invalid"),
    origin: z.string().trim().min(2, "Specifică orașul de plecare").max(120),
    destination: z.string().trim().min(2, "Specifică destinația").max(120),
    start_date: z.string().min(1, "Alege data plecării"),
    end_date: z.string().optional().or(z.literal("")),
    passenger_count: z
      .number({ error: "Introdu numărul de pasageri" })
      .int()
      .min(1, "Minim 1 pasager")
      .max(90, "Pentru grupuri mai mari, sună-ne direct"),
    vehicle_class: z.enum(["coach", "minibus"]).optional().or(z.literal("")),
    message: z.string().trim().max(2000).optional().or(z.literal("")),
  })
  .refine(
    (data) => !data.end_date || data.end_date >= data.start_date,
    { message: "Data întoarcerii nu poate fi înaintea plecării", path: ["end_date"] },
  );

export type RentalInput = z.infer<typeof rentalSchema>;

/* -------------------------------------------------------------------------- */
/*                                   BOOKING                                   */
/* -------------------------------------------------------------------------- */

const phone = z
  .string()
  .trim()
  .min(9, "Număr de telefon invalid")
  .max(24)
  .regex(/^[+0-9 ().-]+$/, "Număr de telefon invalid");

/**
 * One row per seat. The name is what the driver checks against the manifest,
 * so it's required for every passenger, not just the person paying.
 */
export const passengerSchema = z.object({
  full_name: z.string().trim().min(3, "Introdu numele complet").max(120),
  // No .default() — a default makes the schema's input and output types differ,
  // which react-hook-form's resolver cannot reconcile. The form always supplies
  // this field, so the flag is simply required.
  is_child: z.boolean(),
});

export type PassengerInput = z.infer<typeof passengerSchema>;

/** Step 2 of the flow: who is travelling and who to contact. */
export const passengerDetailsSchema = z.object({
  contact_name: z.string().trim().min(3, "Introdu numele complet").max(120),
  contact_email: z.email("Adresă de email invalidă").max(160),
  contact_phone: phone,
  passengers: z
    .array(passengerSchema)
    .min(1, "Cel puțin un pasager")
    .max(20, "Pentru grupuri mai mari, sună-ne direct"),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type PassengerDetailsInput = z.infer<typeof passengerDetailsSchema>;

/** What the Server Action receives once the user confirms. */
export const bookingSchema = passengerDetailsSchema.extend({
  trip_id: z.uuid(),
});

export type BookingInput = z.infer<typeof bookingSchema>;

/** Retrieving an existing booking: reference + email act as the shared secret. */
export const bookingLookupSchema = z.object({
  booking_ref: z
    .string()
    .trim()
    .min(5, "Codul rezervării are formatul DG-XXXXXXX")
    .max(16)
    .transform((value) => value.toUpperCase()),
  contact_email: z.email("Adresă de email invalidă").max(160),
});

export type BookingLookupInput = z.infer<typeof bookingLookupSchema>;
