export type LeadStatus =
  | "nuevo"
  | "contactado"
  | "interesado"
  | "cliente"
  | "inactivo";

export type LeadSource =
  | "reserva"
  | "contacto_web"
  | "manual"
  | "instagram"
  | "whatsapp";

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  notes: string;
  appointments_count?: number;
  last_appointment_date?: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadInput = {
  name: string;
  email: string;
  phone?: string;
  source?: LeadSource;
  status?: LeadStatus;
  notes?: string;
};
