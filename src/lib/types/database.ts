/**
 * Hand-maintained mirror of supabase/migrations/0001_init.sql.
 * Regenerate with:
 *   npx supabase gen types typescript --project-id <id> > src/lib/types/database.ts
 */

export type UserRole = "customer" | "staff" | "admin";
export type VehicleClass = "coach" | "minibus";
export type TripStatus = "scheduled" | "boarding" | "departed" | "arrived" | "cancelled";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "refunded" | "completed";
export type PaymentStatus = "unpaid" | "paid" | "refunded" | "failed";
export type RentalStatus = "new" | "contacted" | "quoted" | "won" | "lost";

export type City = {
  id: string;
  slug: string;
  name: string;
  county: string | null;
  latitude: number | null;
  longitude: number | null;
  is_hub: boolean;
  created_at: string;
}

export type Vehicle = {
  id: string;
  slug: string;
  name: string;
  class: VehicleClass;
  seat_count: number;
  seat_layout: { rows?: number; columns?: string[] };
  plate_number: string | null;
  amenities: string[];
  image_url: string | null;
  model_url: string | null;
  is_active: boolean;
  created_at: string;
}

export type Route = {
  id: string;
  slug: string;
  origin_city_id: string;
  dest_city_id: string;
  duration_minutes: number;
  base_price: number;
  distance_km: number | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export type RouteStop = {
  id: string;
  route_id: string;
  city_id: string;
  position: number;
  minutes_from_start: number;
  location_name: string | null;
}

export type Trip = {
  id: string;
  route_id: string;
  vehicle_id: string | null;
  departure_date: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  seats_total: number;
  seats_taken: number;
  status: TripStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** Row shape of the `trip_search` view — what the booking UI renders. */
export type TripSearchResult = {
  id: string;
  departure_date: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  seats_total: number;
  seats_taken: number;
  seats_available: number;
  status: TripStatus;
  route_id: string;
  route_slug: string;
  duration_minutes: number;
  origin_name: string;
  origin_slug: string;
  dest_name: string;
  dest_slug: string;
  vehicle_name: string | null;
  vehicle_class: VehicleClass | null;
  amenities: string[] | null;
}

export type Booking = {
  id: string;
  booking_ref: string;
  trip_id: string;
  user_id: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  seat_count: number;
  total_price: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  pickup_stop_id: string | null;
  dropoff_stop_id: string | null;
  notes: string | null;
  currency: string;
  payment_provider: string | null;
  payment_reference: string | null;
  paid_at: string | null;
  /** While pending, seats are held until this instant. */
  hold_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export type BookingPassenger = {
  id: string;
  booking_id: string;
  full_name: string;
  seat_label: string | null;
  is_child: boolean;
  created_at: string;
}

export type Rental = {
  id: string;
  reference: string;
  user_id: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  company_name: string | null;
  origin: string;
  destination: string;
  start_date: string;
  end_date: string | null;
  passenger_count: number;
  vehicle_class: VehicleClass | null;
  message: string | null;
  status: RentalStatus;
  quoted_price: number | null;
  created_at: string;
  updated_at: string;
}

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

/** Every Tables/Views entry must carry `Relationships`, or postgrest-js
 *  fails to match GenericSchema and silently resolves results to `never`. */
type Table<Row, Insert = Row, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: Table<Profile, Partial<Profile> & { id: string }>;
      cities: Table<City, Omit<City, "id" | "created_at">>;
      vehicles: Table<Vehicle, Omit<Vehicle, "id" | "created_at">>;
      routes: Table<Route, Omit<Route, "id" | "created_at">>;
      route_stops: Table<RouteStop, Omit<RouteStop, "id">>;
      trips: Table<Trip, Omit<Trip, "id" | "created_at" | "updated_at">>;
      // Writes go through book_trip() / cancel_booking(), never a direct insert.
      bookings: Table<Booking, Omit<Booking, "id" | "created_at" | "updated_at">>;
      booking_passengers: Table<BookingPassenger, Omit<BookingPassenger, "id" | "created_at">>;
      rentals: Table<
        Rental,
        Omit<Rental, "id" | "created_at" | "updated_at" | "status" | "quoted_price"> & {
          status?: RentalStatus;
        }
      >;
    };
    Views: {
      trip_search: { Row: TripSearchResult; Relationships: [] };
    };
    Functions: {
      book_trip: {
        Args: {
          p_trip_id: string;
          p_contact_name: string;
          p_contact_email: string;
          p_contact_phone: string;
          p_passengers?: { full_name: string; seat_label?: string | null; is_child?: boolean }[];
          p_seat_count?: number;
          p_notes?: string | null;
          p_hold_minutes?: number;
        };
        Returns: Booking;
      };
      release_expired_holds: {
        Args: { p_trip_id?: string | null };
        Returns: number;
      };
      confirm_booking_payment: {
        Args: {
          p_booking_ref: string;
          p_provider: string;
          p_reference?: string | null;
          p_amount?: number | null;
        };
        Returns: Booking;
      };
      get_booking_details: {
        Args: { p_booking_ref: string; p_contact_email: string };
        Returns: {
          booking: Booking;
          trip: TripSearchResult;
          passengers: BookingPassenger[];
        } | null;
      };
      cancel_booking: {
        Args: { p_booking_ref: string; p_contact_email: string };
        Returns: Booking;
      };
      get_booking_by_ref: {
        Args: { p_booking_ref: string; p_contact_email: string };
        Returns: Booking[];
      };
    };
    // postgrest-js only recognises a schema when these keys are present —
    // omitting them silently degrades every query result to `never`.
    Enums: {
      user_role: UserRole;
      vehicle_class: VehicleClass;
      trip_status: TripStatus;
      booking_status: BookingStatus;
      payment_status: PaymentStatus;
      rental_status: RentalStatus;
    };
    CompositeTypes: Record<never, never>;
  };
}
