"use server";

import { revalidatePath } from "next/cache";
import {
  createAppointment,
  getAppointmentById,
  getServiceById,
  getStaffById,
  updateAppointmentStatus,
  updateService,
  upsertStaff,
} from "@/lib/booking/queries";
import { miamiLocalToUtcIso } from "@/lib/booking/slots";
import type { AppointmentStatus } from "@/lib/booking/types";
import { sendBookingEmails } from "@/lib/email/booking";

export async function actionUpdateAppointmentStatus(
  id: string,
  status: AppointmentStatus
) {
  await updateAppointmentStatus(id, status);
  revalidatePath("/admin/citas");
  revalidatePath(`/admin/citas/${id}`);
}

export async function actionUpdateService(formData: FormData) {
  const id = String(formData.get("id") || "");
  await updateService({
    id,
    title: String(formData.get("title") || ""),
    durationMins: Number(formData.get("durationMins") || 30),
    priceCents: Math.round(Number(formData.get("priceUsd") || 0) * 100),
    category: String(formData.get("category") || "Otros"),
    active: formData.get("active") === "on",
    description: String(formData.get("description") || ""),
  });
  revalidatePath("/admin/servicios");
}

export async function actionUpsertStaff(formData: FormData) {
  const id = String(formData.get("id") || "") || undefined;
  await upsertStaff({
    id,
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || ""),
    active: formData.get("active") === "on",
    sortOrder: Number(formData.get("sortOrder") || 0),
  });
  revalidatePath("/admin/equipo");
}

export async function actionCreateAppointment(formData: FormData) {
  const serviceId = String(formData.get("serviceId") || "");
  const staffId = String(formData.get("staffId") || "");
  let startsAt = String(formData.get("startsAt") || "");
  const clientName = String(formData.get("clientName") || "");
  const clientEmail = String(formData.get("clientEmail") || "");
  const clientPhone = String(formData.get("clientPhone") || "");
  const notes = String(formData.get("notes") || "");

  // datetime-local ? treat as Miami wall clock
  if (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(startsAt) &&
    !startsAt.includes("Z") &&
    !/[+-]\d{2}:\d{2}$/.test(startsAt)
  ) {
    const [datePart, timePart] = startsAt.split("T");
    startsAt = miamiLocalToUtcIso(datePart, timePart.slice(0, 5));
  }

  const service = await getServiceById(serviceId);
  if (!service) throw new Error("Servicio inválido");
  const endsAt = new Date(
    new Date(startsAt).getTime() + service.duration_mins * 60_000
  ).toISOString();

  const created = await createAppointment({
    serviceId,
    staffId,
    startsAt,
    endsAt,
    clientName,
    clientEmail,
    clientPhone,
    notes,
    status: "confirmed",
  });

  const staff = await getStaffById(staffId);
  try {
    await sendBookingEmails({
      appointmentId: created.id,
      clientName,
      clientEmail,
      serviceTitle: service.title,
      staffName: staff?.name || "",
      startsAt,
      priceCents: service.price_cents,
      durationMins: service.duration_mins,
    });
  } catch {
    /* ignore email errors in admin create */
  }

  revalidatePath("/admin/citas");
  return created.id;
}

export async function actionResendEmail(id: string) {
  const appt = await getAppointmentById(id);
  if (!appt) throw new Error("Cita no encontrada");
  await sendBookingEmails({
    appointmentId: appt.id,
    clientName: appt.client_name,
    clientEmail: appt.client_email,
    serviceTitle: appt.service_title,
    staffName: appt.staff_name,
    startsAt: appt.starts_at,
    priceCents: appt.service_price_cents,
    durationMins: appt.service_duration_mins,
  });
}
