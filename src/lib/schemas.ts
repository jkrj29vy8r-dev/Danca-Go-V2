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

export const bookingSchema = z.object({
  trip_id: z.uuid(),
  contact_name: z.string().trim().min(3, "Introdu numele complet").max(120),
  contact_email: z.email("Adresă de email invalidă").max(160),
  contact_phone: z
    .string()
    .trim()
    .min(9, "Număr de telefon invalid")
    .max(24)
    .regex(/^[+0-9 ().-]+$/, "Număr de telefon invalid"),
  seat_count: z.number().int().min(1).max(20),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type BookingInput = z.infer<typeof bookingSchema>;
