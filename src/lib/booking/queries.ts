import { sql } from "@/lib/db";
import type {
  AppointmentStatus,
  AppointmentWithJoins,
  BusinessHour,
  Service,
  Staff,
} from "./types";

export async function listActiveServices(): Promise<Service[]> {
  return (await sql`
    SELECT id, slug, title, description, duration_mins, price_cents, category, active, sort_order
    FROM services
    WHERE active = true
    ORDER BY category ASC, sort_order ASC, title ASC
  `) as Service[];
}

export async function listAllServices(): Promise<Service[]> {
  return (await sql`
    SELECT id, slug, title, description, duration_mins, price_cents, category, active, sort_order
    FROM services
    ORDER BY category ASC, sort_order ASC, title ASC
  `) as Service[];
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const rows = (await sql`
    SELECT id, slug, title, description, duration_mins, price_cents, category, active, sort_order
    FROM services
    WHERE slug = ${slug}
    LIMIT 1
  `) as Service[];
  return rows[0] ?? null;
}

export async function getServiceById(id: string): Promise<Service | null> {
  const rows = (await sql`
    SELECT id, slug, title, description, duration_mins, price_cents, category, active, sort_order
    FROM services
    WHERE id = ${id}
    LIMIT 1
  `) as Service[];
  return rows[0] ?? null;
}

export async function listActiveStaff(): Promise<Staff[]> {
  return (await sql`
    SELECT id, name, email, active, sort_order
    FROM staff
    WHERE active = true
    ORDER BY sort_order ASC, name ASC
  `) as Staff[];
}

export async function listAllStaff(): Promise<Staff[]> {
  return (await sql`
    SELECT id, name, email, active, sort_order
    FROM staff
    ORDER BY sort_order ASC, name ASC
  `) as Staff[];
}

export async function getStaffById(id: string): Promise<Staff | null> {
  const rows = (await sql`
    SELECT id, name, email, active, sort_order
    FROM staff
    WHERE id = ${id}
    LIMIT 1
  `) as Staff[];
  return rows[0] ?? null;
}

export async function listBusinessHours(): Promise<BusinessHour[]> {
  return (await sql`
    SELECT weekday, open_time::text, close_time::text, is_closed
    FROM business_hours
    ORDER BY weekday ASC
  `) as BusinessHour[];
}

export async function listAppointmentsInRange(
  fromIso: string,
  toIso: string,
  opts?: { staffId?: string; status?: AppointmentStatus | "all" }
): Promise<AppointmentWithJoins[]> {
  const staffId = opts?.staffId;
  const status = opts?.status ?? "all";

  if (staffId && status !== "all") {
    return (await sql`
      SELECT a.*,
        s.title AS service_title,
        s.duration_mins AS service_duration_mins,
        s.price_cents AS service_price_cents,
        st.name AS staff_name
      FROM appointments a
      JOIN services s ON s.id = a.service_id
      JOIN staff st ON st.id = a.staff_id
      WHERE a.starts_at >= ${fromIso}::timestamptz
        AND a.starts_at < ${toIso}::timestamptz
        AND a.staff_id = ${staffId}
        AND a.status = ${status}
      ORDER BY a.starts_at ASC
    `) as AppointmentWithJoins[];
  }

  if (staffId) {
    return (await sql`
      SELECT a.*,
        s.title AS service_title,
        s.duration_mins AS service_duration_mins,
        s.price_cents AS service_price_cents,
        st.name AS staff_name
      FROM appointments a
      JOIN services s ON s.id = a.service_id
      JOIN staff st ON st.id = a.staff_id
      WHERE a.starts_at >= ${fromIso}::timestamptz
        AND a.starts_at < ${toIso}::timestamptz
        AND a.staff_id = ${staffId}
      ORDER BY a.starts_at ASC
    `) as AppointmentWithJoins[];
  }

  if (status !== "all") {
    return (await sql`
      SELECT a.*,
        s.title AS service_title,
        s.duration_mins AS service_duration_mins,
        s.price_cents AS service_price_cents,
        st.name AS staff_name
      FROM appointments a
      JOIN services s ON s.id = a.service_id
      JOIN staff st ON st.id = a.staff_id
      WHERE a.starts_at >= ${fromIso}::timestamptz
        AND a.starts_at < ${toIso}::timestamptz
        AND a.status = ${status}
      ORDER BY a.starts_at ASC
    `) as AppointmentWithJoins[];
  }

  return (await sql`
    SELECT a.*,
      s.title AS service_title,
      s.duration_mins AS service_duration_mins,
      s.price_cents AS service_price_cents,
      st.name AS staff_name
    FROM appointments a
    JOIN services s ON s.id = a.service_id
    JOIN staff st ON st.id = a.staff_id
    WHERE a.starts_at >= ${fromIso}::timestamptz
      AND a.starts_at < ${toIso}::timestamptz
    ORDER BY a.starts_at ASC
  `) as AppointmentWithJoins[];
}

export async function getAppointmentById(
  id: string
): Promise<AppointmentWithJoins | null> {
  const rows = (await sql`
    SELECT a.*,
      s.title AS service_title,
      s.duration_mins AS service_duration_mins,
      s.price_cents AS service_price_cents,
      st.name AS staff_name
    FROM appointments a
    JOIN services s ON s.id = a.service_id
    JOIN staff st ON st.id = a.staff_id
    WHERE a.id = ${id}
    LIMIT 1
  `) as AppointmentWithJoins[];
  return rows[0] ?? null;
}

export async function listBusyForStaff(
  staffId: string,
  fromIso: string,
  toIso: string
) {
  return (await sql`
    SELECT starts_at, ends_at
    FROM appointments
    WHERE staff_id = ${staffId}
      AND status <> 'cancelled'
      AND starts_at < ${toIso}::timestamptz
      AND ends_at > ${fromIso}::timestamptz
    ORDER BY starts_at ASC
  `) as { starts_at: string; ends_at: string }[];
}

export async function createAppointment(input: {
  serviceId: string;
  staffId: string;
  startsAt: string;
  endsAt: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes?: string;
  status?: AppointmentStatus;
}) {
  const rows = (await sql`
    INSERT INTO appointments (
      service_id, staff_id, starts_at, ends_at,
      client_name, client_email, client_phone, notes, status
    ) VALUES (
      ${input.serviceId},
      ${input.staffId},
      ${input.startsAt}::timestamptz,
      ${input.endsAt}::timestamptz,
      ${input.clientName},
      ${input.clientEmail},
      ${input.clientPhone},
      ${input.notes ?? ""},
      ${input.status ?? "confirmed"}
    )
    RETURNING id
  `) as { id: string }[];
  return rows[0];
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
) {
  await sql`
    UPDATE appointments
    SET status = ${status}, updated_at = now()
    WHERE id = ${id}
  `;
}

export async function updateService(input: {
  id: string;
  title: string;
  durationMins: number;
  priceCents: number;
  category: string;
  active: boolean;
  description: string;
}) {
  await sql`
    UPDATE services
    SET title = ${input.title},
        duration_mins = ${input.durationMins},
        price_cents = ${input.priceCents},
        category = ${input.category},
        active = ${input.active},
        description = ${input.description},
        updated_at = now()
    WHERE id = ${input.id}
  `;
}

export async function upsertStaff(input: {
  id?: string;
  name: string;
  email: string;
  active: boolean;
  sortOrder: number;
}) {
  if (input.id) {
    await sql`
      UPDATE staff
      SET name = ${input.name},
          email = ${input.email || null},
          active = ${input.active},
          sort_order = ${input.sortOrder}
      WHERE id = ${input.id}
    `;
    return input.id;
  }
  const rows = (await sql`
    INSERT INTO staff (name, email, active, sort_order)
    VALUES (${input.name}, ${input.email || null}, ${input.active}, ${input.sortOrder})
    RETURNING id
  `) as { id: string }[];
  return rows[0].id;
}
