import { sql, hasDatabase } from "@/lib/db";
import type {
  AppointmentStatus,
  AppointmentWithJoins,
  BusinessHour,
  Service,
  Staff,
} from "./types";
import pricesData from "@/data/setmore-prices.json";

const fallbackStaff: Staff[] = [
  { id: "staff-1", name: "Yulexi Marquez", email: "Andreapalenciam@icloud.com", active: true, sort_order: 1 },
  { id: "staff-2", name: "Andrea Palencia", email: "Andreapalenciam@icloud.com", active: true, sort_order: 2 },
  { id: "staff-3", name: "Ingrid", email: null, active: true, sort_order: 3 },
];

const fallbackHours: BusinessHour[] = [
  { weekday: 0, open_time: "10:00", close_time: "18:00", is_closed: true },
  { weekday: 1, open_time: "10:00", close_time: "18:00", is_closed: true },
  { weekday: 2, open_time: "10:00", close_time: "18:00", is_closed: false },
  { weekday: 3, open_time: "10:00", close_time: "18:00", is_closed: false },
  { weekday: 4, open_time: "10:00", close_time: "18:00", is_closed: false },
  { weekday: 5, open_time: "10:00", close_time: "18:00", is_closed: false },
  { weekday: 6, open_time: "10:00", close_time: "18:00", is_closed: false },
];

function categorizeService(title: string): string {
  const t = title.toLowerCase();
  if (/gift\s*card|tarjeta/.test(t)) return "Gift Cards";
  if (/curso|master class|clase/.test(t)) return "Cursos";
  if (
    /microblad|micropigment|powder|nanobrow|labios|areola|capilar|delineado|refil micro|mantenimiento de micro|evaluacion|remoci/.test(
      t
    )
  )
    return "Micropigmentación";
  if (/pesta|lifting|racimo|volumen|hibrid|refil pest|retiro de pest/.test(t))
    return "Pestañas";
  if (/depil/.test(t)) return "Depilación";
  if (/facial|dermapen|dermaplan|limpieza/.test(t)) return "Faciales";
  if (/electro|acrocord/.test(t)) return "Electrocauterización";
  if (/ceja|henna|laminado|wax|hilo/.test(t)) return "Cejas";
  return "Otros";
}

import fs from "fs";
import path from "path";

const LOCAL_STORE_PATH = path.join(process.cwd(), "src/data/.local-appointments.json");
const LOCAL_SERVICES_STORE_PATH = path.join(process.cwd(), "src/data/.local-services.json");

function readLocalServices(): Record<string, Partial<Service>> {
  try {
    if (fs.existsSync(LOCAL_SERVICES_STORE_PATH)) {
      const raw = fs.readFileSync(LOCAL_SERVICES_STORE_PATH, "utf8");
      return JSON.parse(raw);
    }
  } catch {}
  return {};
}

function writeLocalServices(data: Record<string, Partial<Service>>) {
  try {
    fs.writeFileSync(LOCAL_SERVICES_STORE_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.warn("Could not write local services store:", err);
  }
}

export function getPublicImages(): string[] {
  const imagesDir = path.join(process.cwd(), "public/images");
  if (!fs.existsSync(imagesDir)) return [];
  try {
    const files = fs.readdirSync(imagesDir);
    return files
      .filter((f) => /\.(webp|jpg|jpeg|png)$/i.test(f))
      .map((f) => `/images/${f}`);
  } catch {
    return [];
  }
}

function getDefaultServiceImage(title: string, category: string): string {
  const t = (title + " " + category).toLowerCase();
  if (/microblad|micropigment|pelo a pelo|cejas virgenes/.test(t)) {
    return "/images/hero-microblading.webp";
  }
  if (/mantenimiento|retoque|evaluacion|perfilado/.test(t)) {
    return "/images/microblading-detail.webp";
  }
  if (/labios|lip|liner|delineado/.test(t)) {
    return "/images/lip-brow-result.webp";
  }
  if (/ceja|laminado|pestana|lifting|extension/.test(t)) {
    return "/images/studio-experience.webp";
  }
  return "/images/hero-microblading.webp";
}

function getFallbackServices(): Service[] {
  const overrides = readLocalServices();
  return (pricesData?.services || []).map((s, idx) => {
    const category = categorizeService(s.title);
    const base: Service = {
      id: s.id,
      slug: s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
      title: s.title,
      description: s.description || "",
      duration_mins: Math.max(15, Number(s.durationMins) || 30),
      price_cents: Math.round(Number(s.price) * 100),
      category,
      active: !s.title.toLowerCase().includes("gift"),
      sort_order: idx + 1,
      image_url: getDefaultServiceImage(s.title, category),
    };
    const ov = overrides[s.id];
    return ov ? { ...base, ...ov } : base;
  });
}

// Fallback initial appointments around 2026-11-18 for demonstration & UI testing
const initialDemoAppointments: AppointmentWithJoins[] = [
  {
    id: "appt-demo-1",
    service_id: "sa920a846f5b1768aebb82d6fc9c5bb69cc576138",
    staff_id: "staff-1",
    starts_at: "2026-11-18T14:30:00.000Z",
    ends_at: "2026-11-18T16:30:00.000Z",
    client_name: "Camila Rodríguez",
    client_email: "camila.rodriguez@gmail.com",
    client_phone: "+1 786-452-9912",
    status: "confirmed",
    notes: "Primera vez en microblading pelo a pelo.",
    created_at: "2026-11-14T10:00:00.000Z",
    updated_at: "2026-11-14T10:00:00.000Z",
    service_title: "Microblading Pelo A Pelo En Cejas Virgenes",
    service_duration_mins: 120,
    service_price_cents: 40000,
    staff_name: "Yulexi Marquez",
  },
  {
    id: "appt-demo-2",
    service_id: "sc47be984f0ec7e37080234ca4b8ffb29c9571eb2",
    staff_id: "staff-2",
    starts_at: "2026-11-18T18:00:00.000Z",
    ends_at: "2026-11-18T18:45:00.000Z",
    client_name: "Sofía Fernández",
    client_email: "sofia.f@yahoo.com",
    client_phone: "+1 786-339-1209",
    status: "confirmed",
    notes: "Evaluación previa.",
    created_at: "2026-11-15T12:00:00.000Z",
    updated_at: "2026-11-15T12:00:00.000Z",
    service_title: "Evaluacion para Procedimiento",
    service_duration_mins: 45,
    service_price_cents: 0,
    staff_name: "Andrea Palencia",
  },
  {
    id: "appt-demo-3",
    service_id: "s92657a6c9aa9482f1e539bd8a42fb67f851343f9",
    staff_id: "staff-1",
    starts_at: "2026-11-19T15:00:00.000Z",
    ends_at: "2026-11-19T18:00:00.000Z",
    client_name: "Mariana Silva",
    client_email: "mariana.silva@outlook.com",
    client_phone: "+1 786-882-7711",
    status: "confirmed",
    notes: "Mantenimiento anual de cejas.",
    created_at: "2026-11-16T11:00:00.000Z",
    updated_at: "2026-11-16T11:00:00.000Z",
    service_title: "Mantenimiento De Microblading",
    service_duration_mins: 180,
    service_price_cents: 30000,
    staff_name: "Yulexi Marquez",
  },
  {
    id: "appt-demo-4",
    service_id: "sc47be984f0ec7e37080234ca4b8ffb29c9571eb2",
    staff_id: "staff-3",
    starts_at: "2026-11-20T16:00:00.000Z",
    ends_at: "2026-11-20T17:00:00.000Z",
    client_name: "Valentina Morales",
    client_email: "valentina.morales@hotmail.com",
    client_phone: "+1 305-671-8843",
    status: "pending",
    notes: "Solicitó confirmación por WhatsApp.",
    created_at: "2026-11-17T09:00:00.000Z",
    updated_at: "2026-11-17T09:00:00.000Z",
    service_title: "Diseño y Perfilado de Cejas",
    service_duration_mins: 60,
    service_price_cents: 6500,
    staff_name: "Ingrid",
  },
  {
    id: "appt-demo-5",
    service_id: "saaf3d1002be39bcde526d6cae7e5878676e18016",
    staff_id: "staff-1",
    starts_at: "2026-11-21T14:00:00.000Z",
    ends_at: "2026-11-21T17:00:00.000Z",
    client_name: "Daniela Castillo",
    client_email: "daniela.castillo@gmail.com",
    client_phone: "+1 305-992-4410",
    status: "confirmed",
    notes: "Corrección de trabajo previo.",
    created_at: "2026-11-17T15:00:00.000Z",
    updated_at: "2026-11-17T15:00:00.000Z",
    service_title: "Microblading En Cejas Con Trabajo Anterior",
    service_duration_mins: 180,
    service_price_cents: 55000,
    staff_name: "Yulexi Marquez",
  },
];

function getFallbackAppointments(): AppointmentWithJoins[] {
  try {
    if (fs.existsSync(LOCAL_STORE_PATH)) {
      const raw = fs.readFileSync(LOCAL_STORE_PATH, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* fallback to initial */
  }
  return [...initialDemoAppointments];
}

function saveFallbackAppointments(list: AppointmentWithJoins[]) {
  try {
    fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(list, null, 2), "utf8");
  } catch (err) {
    console.warn("Could not write local appointments store:", err);
  }
}

let schemaEnsured = false;
async function ensureServicesSchema() {
  if (schemaEnsured || !hasDatabase()) return;
  try {
    await sql`ALTER TABLE services ADD COLUMN IF NOT EXISTS image_url text`;
    schemaEnsured = true;
  } catch {
    /* ignore */
  }
}

export async function listActiveServices(): Promise<Service[]> {
  if (!hasDatabase()) {
    return getFallbackServices().filter((s) => s.active);
  }
  await ensureServicesSchema();
  try {
    return (await sql`
      SELECT id, slug, title, description, duration_mins, price_cents, category, active, sort_order, image_url
      FROM services
      WHERE active = true
      ORDER BY category ASC, sort_order ASC, title ASC
    `) as Service[];
  } catch {
    return (await sql`
      SELECT id, slug, title, description, duration_mins, price_cents, category, active, sort_order
      FROM services
      WHERE active = true
      ORDER BY category ASC, sort_order ASC, title ASC
    `) as Service[];
  }
}

export async function listAllServices(): Promise<Service[]> {
  if (!hasDatabase()) {
    return getFallbackServices();
  }
  await ensureServicesSchema();
  try {
    return (await sql`
      SELECT id, slug, title, description, duration_mins, price_cents, category, active, sort_order, image_url
      FROM services
      ORDER BY category ASC, sort_order ASC, title ASC
    `) as Service[];
  } catch {
    return (await sql`
      SELECT id, slug, title, description, duration_mins, price_cents, category, active, sort_order
      FROM services
      ORDER BY category ASC, sort_order ASC, title ASC
    `) as Service[];
  }
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  if (!hasDatabase()) {
    return getFallbackServices().find((s) => s.slug === slug) ?? null;
  }
  await ensureServicesSchema();
  try {
    const rows = (await sql`
      SELECT id, slug, title, description, duration_mins, price_cents, category, active, sort_order, image_url
      FROM services
      WHERE slug = ${slug}
      LIMIT 1
    `) as Service[];
    return rows[0] ?? null;
  } catch {
    const rows = (await sql`
      SELECT id, slug, title, description, duration_mins, price_cents, category, active, sort_order
      FROM services
      WHERE slug = ${slug}
      LIMIT 1
    `) as Service[];
    return rows[0] ?? null;
  }
}

export async function getServiceById(id: string): Promise<Service | null> {
  if (!hasDatabase()) {
    return getFallbackServices().find((s) => s.id === id) ?? null;
  }
  await ensureServicesSchema();
  try {
    const rows = (await sql`
      SELECT id, slug, title, description, duration_mins, price_cents, category, active, sort_order, image_url
      FROM services
      WHERE id = ${id}
      LIMIT 1
    `) as Service[];
    return rows[0] ?? null;
  } catch {
    const rows = (await sql`
      SELECT id, slug, title, description, duration_mins, price_cents, category, active, sort_order
      FROM services
      WHERE id = ${id}
      LIMIT 1
    `) as Service[];
    return rows[0] ?? null;
  }
}

export async function listActiveStaff(): Promise<Staff[]> {
  if (!hasDatabase()) {
    return fallbackStaff.filter((s) => s.active);
  }
  return (await sql`
    SELECT id, name, email, active, sort_order
    FROM staff
    WHERE active = true
    ORDER BY sort_order ASC, name ASC
  `) as Staff[];
}

export async function listAllStaff(): Promise<Staff[]> {
  if (!hasDatabase()) {
    return fallbackStaff;
  }
  return (await sql`
    SELECT id, name, email, active, sort_order
    FROM staff
    ORDER BY sort_order ASC, name ASC
  `) as Staff[];
}

export async function getStaffById(id: string): Promise<Staff | null> {
  if (!hasDatabase()) {
    return fallbackStaff.find((s) => s.id === id) ?? null;
  }
  const rows = (await sql`
    SELECT id, name, email, active, sort_order
    FROM staff
    WHERE id = ${id}
    LIMIT 1
  `) as Staff[];
  return rows[0] ?? null;
}

export async function listBusinessHours(): Promise<BusinessHour[]> {
  if (!hasDatabase()) {
    return fallbackHours;
  }
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
  if (!hasDatabase()) {
    const fromTime = new Date(fromIso).getTime();
    const toTime = new Date(toIso).getTime();
    let res = getFallbackAppointments().filter((a) => {
      const t = new Date(a.starts_at).getTime();
      return t >= fromTime && t < toTime;
    });
    if (opts?.staffId) {
      res = res.filter((a) => a.staff_id === opts.staffId);
    }
    if (opts?.status && opts.status !== "all") {
      res = res.filter((a) => a.status === opts.status);
    }
    return res.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  }

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
  if (!hasDatabase()) {
    return getFallbackAppointments().find((a) => a.id === id) ?? null;
  }
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
  if (!hasDatabase()) {
    const fromTime = new Date(fromIso).getTime();
    const toTime = new Date(toIso).getTime();
    return getFallbackAppointments()
      .filter((a) => a.staff_id === staffId && a.status !== "cancelled")
      .filter((a) => {
        const s = new Date(a.starts_at).getTime();
        const e = new Date(a.ends_at).getTime();
        return s < toTime && e > fromTime;
      })
      .map((a) => ({ starts_at: a.starts_at, ends_at: a.ends_at }));
  }

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
  if (!hasDatabase()) {
    const list = getFallbackAppointments();
    const service = getFallbackServices().find((s) => s.id === input.serviceId);
    const staff = fallbackStaff.find((s) => s.id === input.staffId);
    const id = `appt-${Date.now()}`;
    const newAppt: AppointmentWithJoins = {
      id,
      service_id: input.serviceId,
      staff_id: input.staffId,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      client_name: input.clientName,
      client_email: input.clientEmail,
      client_phone: input.clientPhone,
      notes: input.notes ?? "",
      status: input.status ?? "confirmed",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      service_title: service?.title || "Servicio",
      service_duration_mins: service?.duration_mins || 60,
      service_price_cents: service?.price_cents || 0,
      staff_name: staff?.name || "Staff",
    };
    list.unshift(newAppt);
    saveFallbackAppointments(list);
    return { id };
  }

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
  if (!hasDatabase()) {
    const list = getFallbackAppointments();
    const appt = list.find((a) => a.id === id);
    if (appt) {
      appt.status = status;
      appt.updated_at = new Date().toISOString();
      saveFallbackAppointments(list);
    }
    return;
  }

  await sql`
    UPDATE appointments
    SET status = ${status}, updated_at = now()
    WHERE id = ${id}
  `;
}

export async function updateAppointment(input: {
  id: string;
  serviceId?: string;
  staffId?: string;
  startsAt?: string;
  endsAt?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  notes?: string;
  status?: AppointmentStatus;
}): Promise<AppointmentWithJoins | null> {
  if (!hasDatabase()) {
    const list = getFallbackAppointments();
    const appt = list.find((a) => a.id === input.id);
    if (appt) {
      if (input.serviceId) {
        appt.service_id = input.serviceId;
        const s = getFallbackServices().find((x) => x.id === input.serviceId);
        if (s) {
          appt.service_title = s.title;
          appt.service_duration_mins = s.duration_mins;
          appt.service_price_cents = s.price_cents;
        }
      }
      if (input.staffId) {
        appt.staff_id = input.staffId;
        const st = fallbackStaff.find((x) => x.id === input.staffId);
        if (st) appt.staff_name = st.name;
      }
      if (input.startsAt) appt.starts_at = input.startsAt;
      if (input.endsAt) appt.ends_at = input.endsAt;
      if (input.clientName) appt.client_name = input.clientName;
      if (input.clientEmail) appt.client_email = input.clientEmail;
      if (input.clientPhone !== undefined) appt.client_phone = input.clientPhone;
      if (input.notes !== undefined) appt.notes = input.notes;
      if (input.status) appt.status = input.status;
      appt.updated_at = new Date().toISOString();
      saveFallbackAppointments(list);
      return appt;
    }
    return null;
  }

  await sql`
    UPDATE appointments
    SET 
      service_id = COALESCE(${input.serviceId}, service_id),
      staff_id = COALESCE(${input.staffId}, staff_id),
      starts_at = COALESCE(${input.startsAt}::timestamptz, starts_at),
      ends_at = COALESCE(${input.endsAt}::timestamptz, ends_at),
      client_name = COALESCE(${input.clientName}, client_name),
      client_email = COALESCE(${input.clientEmail}, client_email),
      client_phone = COALESCE(${input.clientPhone}, client_phone),
      notes = COALESCE(${input.notes}, notes),
      status = COALESCE(${input.status}, status),
      updated_at = now()
    WHERE id = ${input.id}
  `;
  return getAppointmentById(input.id);
}

export async function deleteAppointment(id: string): Promise<boolean> {
  if (!hasDatabase()) {
    const list = getFallbackAppointments();
    const idx = list.findIndex((a) => a.id === id);
    if (idx >= 0) {
      list.splice(idx, 1);
      saveFallbackAppointments(list);
    }
    return true;
  }
  await sql`DELETE FROM appointments WHERE id = ${id}`;
  return true;
}

export async function updateService(input: {
  id: string;
  title: string;
  durationMins: number;
  priceCents: number;
  category: string;
  active: boolean;
  description: string;
  imageUrl?: string | null;
}) {
  const overrides = readLocalServices();
  overrides[input.id] = {
    ...overrides[input.id],
    id: input.id,
    title: input.title,
    duration_mins: input.durationMins,
    price_cents: input.priceCents,
    category: input.category,
    active: input.active,
    description: input.description,
    image_url: input.imageUrl !== undefined ? input.imageUrl : (overrides[input.id]?.image_url || null),
  };
  writeLocalServices(overrides);

  if (!hasDatabase()) return;

  try {
    await sql`ALTER TABLE services ADD COLUMN IF NOT EXISTS image_url text`;
  } catch {}

  await sql`
    UPDATE services
    SET title = ${input.title},
        duration_mins = ${input.durationMins},
        price_cents = ${input.priceCents},
        category = ${input.category},
        active = ${input.active},
        description = ${input.description},
        image_url = ${input.imageUrl || null},
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
  if (!hasDatabase()) {
    const existing = fallbackStaff.find((s) => s.id === input.id);
    if (existing) {
      existing.name = input.name;
      existing.email = input.email || null;
      existing.active = input.active;
      existing.sort_order = input.sortOrder;
      return existing.id;
    }
    const newId = `staff-${Date.now()}`;
    fallbackStaff.push({
      id: newId,
      name: input.name,
      email: input.email || null,
      active: input.active,
      sort_order: input.sortOrder,
    });
    return newId;
  }

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

