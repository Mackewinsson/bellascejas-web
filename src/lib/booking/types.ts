export const BOOKING_TZ = "America/New_York";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";

export type Staff = {
  id: string;
  name: string;
  email: string | null;
  active: boolean;
  sort_order: number;
};

export type Service = {
  id: string;
  slug: string;
  title: string;
  description: string;
  duration_mins: number;
  price_cents: number;
  category: string;
  active: boolean;
  sort_order: number;
};

export type Appointment = {
  id: string;
  service_id: string;
  staff_id: string;
  starts_at: string;
  ends_at: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  status: AppointmentStatus;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type AppointmentWithJoins = Appointment & {
  service_title: string;
  service_duration_mins: number;
  service_price_cents: number;
  staff_name: string;
};

export type BusinessHour = {
  weekday: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
};

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function categorizeService(title: string): string {
  const t = title.toLowerCase();
  if (/gift\s*card|tarjeta/.test(t)) return "Gift Cards";
  if (/curso|master class|clase/.test(t)) return "Cursos";
  if (
    /microblad|micropigment|powder|nanobrow|labios|areola|capilar|delineado|refil micro|mantenimiento de micro|evaluacion|remoci[oó]n|promo micro/.test(
      t
    )
  ) {
    return "Micropigmentacion";
  }
  if (/pesta|lifting|racimo|volumen|hibrid|refil pest|retiro de pest/.test(t)) {
    return "Pestanas";
  }
  if (/depil/.test(t)) return "Depilacion";
  if (/facial|dermapen|dermaplan|limpieza/.test(t)) return "Faciales";
  if (/electro|acrocord/.test(t)) return "Electrocauterizacion";
  if (/ceja|henna|laminado|wax|hilo/.test(t)) return "Cejas";
  if (/retoque|mantenimiento|refil/.test(t)) return "Retoques y mantenimientos";
  return "Otros";
}

export function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
