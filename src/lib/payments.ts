/**
 * Payment seam.
 *
 * Today every booking is settled on boarding: `book_trip` leaves the row
 * `pending` / `unpaid`, staff confirm it, and no money moves online. This file
 * exists so that adding Stripe is a matter of implementing one interface
 * rather than rewriting the checkout.
 *
 * The pieces already in place for it:
 *
 *  - `bookings.total_price` is an integer in **bani**, which is exactly what
 *    Stripe's `amount` expects (minor currency units). No float conversion.
 *  - `bookings.currency` defaults to RON.
 *  - `bookings.payment_reference` is uniquely indexed and sized for a
 *    PaymentIntent id, so a webhook replay can't create a second row.
 *  - `confirm_booking_payment()` is idempotent and granted to `service_role`
 *    only — it is the single function a webhook route should call.
 *  - `hold_expires_at` gives the payment window a deadline; seats come back
 *    automatically if the customer never completes checkout.
 *
 * To wire Stripe up:
 *   1. Implement `StripeProvider` below against the Stripe SDK.
 *   2. Create the PaymentIntent with `amount: booking.total_price`,
 *      `currency: booking.currency.toLowerCase()`, and put the booking
 *      reference in `metadata.booking_ref`.
 *   3. Add `app/api/webhooks/stripe/route.ts`, verify the signature, and on
 *      `payment_intent.succeeded` call `confirm_booking_payment` with a
 *      service-role Supabase client.
 */

/** How long seats stay held while the customer completes checkout. */
export const HOLD_MINUTES = 30;

export type PaymentProvider = "cash" | "stripe";

/** What the customer is told about settlement, per provider. */
export const paymentCopy: Record<PaymentProvider, { label: string; detail: string }> = {
  cash: {
    label: "Plata la îmbarcare",
    detail:
      "Plătești șoferului la urcarea în vehicul, numerar sau card. Locurile rămân rezervate pe numele tău.",
  },
  stripe: {
    label: "Plată online cu cardul",
    detail: "Plătești securizat cu cardul. Primești biletul pe email imediat după confirmare.",
  },
};

/** The provider currently in effect. Flip to "stripe" once the route exists. */
export const activeProvider: PaymentProvider = "cash";

export type PaymentSession = {
  /** Where to send the customer to pay. Null when settlement is offline. */
  redirectUrl: string | null;
  /** Provider-side identifier, stored on the booking. */
  reference: string | null;
};

/**
 * Implement this against Stripe to switch the flow from pay-on-boarding to
 * pay-online. `createSession` is called right after `book_trip` succeeds,
 * while the seats are held.
 */
export interface PaymentGateway {
  readonly provider: PaymentProvider;
  createSession(input: {
    bookingRef: string;
    amount: number; // bani — pass straight to Stripe's `amount`
    currency: string;
    contactEmail: string;
  }): Promise<PaymentSession>;
}

/** Settlement on boarding: nothing to redirect to, nothing to reference. */
export const cashGateway: PaymentGateway = {
  provider: "cash",
  async createSession() {
    return { redirectUrl: null, reference: null };
  },
};

export function getGateway(): PaymentGateway {
  // A StripeGateway would be selected here once implemented.
  return cashGateway;
}
