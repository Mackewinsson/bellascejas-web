import { sql, hasDatabase } from "@/lib/db";
import type { Lead, LeadInput, LeadStatus, LeadSource } from "./types";
import type { AppointmentWithJoins } from "@/lib/booking/types";

// In-memory store for fallback when database is not connected
const fallbackLeads: Lead[] = [
  {
    id: "lead-demo-1",
    name: "Camila Rodríguez",
    email: "camila.rodriguez@gmail.com",
    phone: "+1 786-452-9912",
    source: "reserva",
    status: "cliente",
    notes: "Cliente habitual de Microblading y retoques anuales. Piel sensible.",
    appointments_count: 3,
    last_appointment_date: "2026-11-10T14:00:00Z",
    created_at: "2026-08-15T10:00:00Z",
    updated_at: "2026-11-10T14:00:00Z",
  },
  {
    id: "lead-demo-2",
    name: "Valentina Morales",
    email: "valentina.morales@hotmail.com",
    phone: "+1 305-671-8843",
    source: "contacto_web",
    status: "interesado",
    notes: "Consultó por WhatsApp sobre curso de Master Class en Miami.",
    appointments_count: 0,
    last_appointment_date: null,
    created_at: "2026-11-15T09:30:00Z",
    updated_at: "2026-11-15T09:30:00Z",
  },
  {
    id: "lead-demo-3",
    name: "Sofía Fernández",
    email: "sofia.f@yahoo.com",
    phone: "+1 786-339-1209",
    source: "reserva",
    status: "cliente",
    notes: "Lifting de pestañas y diseño de cejas. Muy satisfecha.",
    appointments_count: 2,
    last_appointment_date: "2026-11-14T11:00:00Z",
    created_at: "2026-09-20T12:00:00Z",
    updated_at: "2026-11-14T11:00:00Z",
  },
  {
    id: "lead-demo-4",
    name: "Mariana Silva",
    email: "mariana.silva@outlook.com",
    phone: "+1 786-882-7711",
    source: "contacto_web",
    status: "nuevo",
    notes: "Preguntó por promoción de cejas powder para el fin de semana.",
    appointments_count: 0,
    last_appointment_date: null,
    created_at: "2026-11-17T16:20:00Z",
    updated_at: "2026-11-17T16:20:00Z",
  },
  {
    id: "lead-demo-5",
    name: "Daniela Castillo",
    email: "daniela.castillo@gmail.com",
    phone: "+1 305-992-4410",
    source: "manual",
    status: "contactado",
    notes: "Referida por Andrea. Quiere evaluar despigmentación previa.",
    appointments_count: 0,
    last_appointment_date: null,
    created_at: "2026-11-12T11:15:00Z",
    updated_at: "2026-11-16T15:45:00Z",
  },
];

let tableInitialized = false;

async function ensureLeadsTable() {
  if (!hasDatabase() || tableInitialized) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT DEFAULT '',
        source TEXT DEFAULT 'manual',
        status TEXT DEFAULT 'nuevo',
        notes TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(lower(email))`;
    await sql`CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)`;
    tableInitialized = true;
  } catch (err) {
    console.warn("Could not ensure leads table:", err);
  }
}

export async function listLeads(opts?: {
  search?: string;
  status?: string;
  source?: string;
}): Promise<Lead[]> {
  if (!hasDatabase()) {
    let result = [...fallbackLeads];
    if (opts?.status && opts.status !== "all") {
      result = result.filter((l) => l.status === opts.status);
    }
    if (opts?.source && opts.source !== "all") {
      result = result.filter((l) => l.source === opts.source);
    }
    if (opts?.search) {
      const q = opts.search.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q)
      );
    }
    return result.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  await ensureLeadsTable();

  try {
    // 1. Fetch leads table
    const explicitLeads = (await sql`
      SELECT id, name, email, phone, source, status, notes, created_at, updated_at
      FROM leads
      ORDER BY created_at DESC
    `) as Lead[];

    // 2. Fetch distinct clients from appointments
    const appointmentClients = (await sql`
      SELECT 
        lower(client_email) as email,
        max(client_name) as name,
        max(client_phone) as phone,
        count(id)::int as count,
        max(starts_at) as last_date,
        min(created_at) as first_date
      FROM appointments
      WHERE client_email IS NOT NULL AND client_email <> ''
      GROUP BY lower(client_email)
    `) as {
      email: string;
      name: string;
      phone: string;
      count: number;
      last_date: string;
      first_date: string;
    }[];

    const leadMap = new Map<string, Lead>();

    // First add explicit leads
    for (const l of explicitLeads) {
      leadMap.set(l.email.toLowerCase(), {
        ...l,
        appointments_count: 0,
        last_appointment_date: null,
      });
    }

    // Merge or insert from appointmentClients
    for (const ac of appointmentClients) {
      const existing = leadMap.get(ac.email.toLowerCase());
      if (existing) {
        existing.appointments_count = ac.count;
        existing.last_appointment_date = ac.last_date;
        if (existing.status === "nuevo" && ac.count > 0) {
          existing.status = "cliente";
        }
      } else {
        leadMap.set(ac.email.toLowerCase(), {
          id: `appt-client-${Buffer.from(ac.email).toString("hex").slice(0, 16)}`,
          name: ac.name || "Clienta Bellas Cejas",
          email: ac.email,
          phone: ac.phone || "",
          source: "reserva",
          status: "cliente",
          notes: "Registrado automáticamente desde reserva de cita.",
          appointments_count: ac.count,
          last_appointment_date: ac.last_date,
          created_at: ac.first_date || new Date().toISOString(),
          updated_at: ac.last_date || new Date().toISOString(),
        });
      }
    }

    let all = Array.from(leadMap.values());

    if (opts?.status && opts.status !== "all") {
      all = all.filter((l) => l.status === opts.status);
    }
    if (opts?.source && opts.source !== "all") {
      all = all.filter((l) => l.source === opts.source);
    }
    if (opts?.search) {
      const q = opts.search.toLowerCase().trim();
      all = all.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q)
      );
    }

    return all.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (err) {
    console.error("Error in listLeads:", err);
    return fallbackLeads;
  }
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const all = await listLeads();
  const lead = all.find((l) => l.id === id || l.email.toLowerCase() === id.toLowerCase());
  return lead ?? null;
}

export async function getAppointmentsForEmail(
  email: string
): Promise<AppointmentWithJoins[]> {
  if (!hasDatabase()) {
    return [];
  }
  try {
    const rows = (await sql`
      SELECT a.*,
        s.title AS service_title,
        s.duration_mins AS service_duration_mins,
        s.price_cents AS service_price_cents,
        st.name AS staff_name
      FROM appointments a
      JOIN services s ON s.id = a.service_id
      JOIN staff st ON st.id = a.staff_id
      WHERE lower(a.client_email) = lower(${email})
      ORDER BY a.starts_at DESC
    `) as AppointmentWithJoins[];
    return rows;
  } catch (err) {
    console.error("Error getAppointmentsForEmail:", err);
    return [];
  }
}

export async function createLead(input: LeadInput): Promise<Lead> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const phone = (input.phone || "").trim();
  const source: LeadSource = input.source || "manual";
  const status: LeadStatus = input.status || "nuevo";
  const notes = (input.notes || "").trim();

  if (!hasDatabase()) {
    const existingIdx = fallbackLeads.findIndex((l) => l.email.toLowerCase() === email);
    const now = new Date().toISOString();
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name,
      email,
      phone,
      source,
      status,
      notes,
      appointments_count: 0,
      last_appointment_date: null,
      created_at: now,
      updated_at: now,
    };
    if (existingIdx >= 0) {
      fallbackLeads[existingIdx] = { ...fallbackLeads[existingIdx], ...newLead, id: fallbackLeads[existingIdx].id };
      return fallbackLeads[existingIdx];
    }
    fallbackLeads.unshift(newLead);
    return newLead;
  }

  await ensureLeadsTable();

  const rows = (await sql`
    INSERT INTO leads (name, email, phone, source, status, notes)
    VALUES (${name}, ${email}, ${phone}, ${source}, ${status}, ${notes})
    ON CONFLICT (email) DO UPDATE SET
      name = EXCLUDED.name,
      phone = CASE WHEN EXCLUDED.phone <> '' THEN EXCLUDED.phone ELSE leads.phone END,
      notes = CASE WHEN EXCLUDED.notes <> '' THEN EXCLUDED.notes ELSE leads.notes END,
      status = CASE WHEN leads.status = 'cliente' THEN 'cliente' ELSE EXCLUDED.status END,
      updated_at = now()
    RETURNING id, name, email, phone, source, status, notes, created_at, updated_at
  `) as Lead[];

  return rows[0];
}

export async function updateLead(id: string, input: Partial<LeadInput>) {
  if (!hasDatabase()) {
    const lead = fallbackLeads.find((l) => l.id === id);
    if (lead) {
      if (input.name) lead.name = input.name;
      if (input.email) lead.email = input.email;
      if (input.phone !== undefined) lead.phone = input.phone;
      if (input.status) lead.status = input.status;
      if (input.notes !== undefined) lead.notes = input.notes;
      lead.updated_at = new Date().toISOString();
    }
    return lead;
  }

  await ensureLeadsTable();

  // If this was an appt-client pseudo ID, upsert by email
  if (id.startsWith("appt-client-")) {
    const existing = await getLeadById(id);
    if (existing) {
      return createLead({
        name: input.name || existing.name,
        email: input.email || existing.email,
        phone: input.phone !== undefined ? input.phone : existing.phone,
        source: existing.source,
        status: input.status || existing.status,
        notes: input.notes !== undefined ? input.notes : existing.notes,
      });
    }
  }

  const rows = (await sql`
    UPDATE leads
    SET 
      name = COALESCE(${input.name}, name),
      phone = COALESCE(${input.phone}, phone),
      status = COALESCE(${input.status}, status),
      notes = COALESCE(${input.notes}, notes),
      updated_at = now()
    WHERE id = ${id}
    RETURNING id, name, email, phone, source, status, notes, created_at, updated_at
  `) as Lead[];

  return rows[0];
}

export async function deleteLead(id: string) {
  if (!hasDatabase()) {
    const idx = fallbackLeads.findIndex((l) => l.id === id);
    if (idx >= 0) fallbackLeads.splice(idx, 1);
    return true;
  }

  await ensureLeadsTable();
  await sql`DELETE FROM leads WHERE id = ${id}`;
  return true;
}
