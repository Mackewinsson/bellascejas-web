"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    /* Outside Next.js request context (e.g. CLI/tests) */
  }
}
import {
  createAppointment,
  getAppointmentById,
  getServiceById,
  getStaffById,
  updateAppointmentStatus,
  updateAppointment,
  deleteAppointment,
  updateService,
  upsertStaff,
} from "@/lib/booking/queries";
import { miamiLocalToUtcIso } from "@/lib/booking/slots";
import type { AppointmentStatus } from "@/lib/booking/types";
import {
  sendBookingEmails,
  sendRescheduleEmails,
  sendCancellationEmails,
} from "@/lib/email/booking";

export async function actionUpdateAppointmentStatus(
  id: string,
  status: AppointmentStatus
) {
  await updateAppointmentStatus(id, status);
  safeRevalidatePath("/admin/citas");
  safeRevalidatePath(`/admin/citas/${id}`);
}

export async function actionModifyAppointment(formData: FormData) {
  const id = String(formData.get("id") || "");
  const clientName = String(formData.get("clientName") || "").trim();
  const clientEmail = String(formData.get("clientEmail") || "").trim().toLowerCase();
  const clientPhone = String(formData.get("clientPhone") || "").trim();
  const serviceId = String(formData.get("serviceId") || "");
  const staffId = String(formData.get("staffId") || "");
  const notes = String(formData.get("notes") || "").trim();
  const status = (formData.get("status") || "confirmed") as AppointmentStatus;

  const current = await getAppointmentById(id);
  if (!current) throw new Error("Cita no encontrada");

  let endsAt = current.ends_at;
  if (serviceId && serviceId !== current.service_id) {
    const service = await getServiceById(serviceId);
    if (service) {
      endsAt = new Date(
        new Date(current.starts_at).getTime() + service.duration_mins * 60_000
      ).toISOString();
    }
  }

  await updateAppointment({
    id,
    clientName,
    clientEmail,
    clientPhone,
    serviceId: serviceId || undefined,
    staffId: staffId || undefined,
    endsAt,
    notes,
    status,
  });

  safeRevalidatePath("/admin/citas");
  safeRevalidatePath(`/admin/citas/${id}`);
}

export async function actionRescheduleAppointment(formData: FormData) {
  const id = String(formData.get("id") || "");
  let startsAt = String(formData.get("startsAt") || "");
  const dateYmd = String(formData.get("dateYmd") || "");
  const timeHm = String(formData.get("timeHm") || "");
  const staffId = String(formData.get("staffId") || "");
  const notifyClient = formData.get("notifyClient") === "on";

  if (!startsAt && dateYmd && timeHm) {
    startsAt = miamiLocalToUtcIso(dateYmd, timeHm);
  } else if (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(startsAt) &&
    !startsAt.includes("Z") &&
    !/[+-]\d{2}:\d{2}$/.test(startsAt)
  ) {
    const [datePart, timePart] = startsAt.split("T");
    startsAt = miamiLocalToUtcIso(datePart, timePart.slice(0, 5));
  }

  const current = await getAppointmentById(id);
  if (!current) throw new Error("Cita no encontrada");

  const durationMins = current.service_duration_mins || 60;
  const endsAt = new Date(
    new Date(startsAt).getTime() + durationMins * 60_000
  ).toISOString();

  await updateAppointment({
    id,
    startsAt,
    endsAt,
    staffId: staffId || current.staff_id,
    status: "confirmed",
  });

  if (notifyClient) {
    const staff = await getStaffById(staffId || current.staff_id);
    try {
      await sendRescheduleEmails({
        appointmentId: id,
        clientName: current.client_name,
        clientEmail: current.client_email,
        serviceTitle: current.service_title,
        staffName: staff?.name || current.staff_name,
        oldStartsAt: current.starts_at,
        newStartsAt: startsAt,
        durationMins,
      });
    } catch (err) {
      console.warn("Could not send reschedule email:", err);
    }
  }

  safeRevalidatePath("/admin/citas");
  safeRevalidatePath(`/admin/citas/${id}`);
}

export async function actionCancelAppointment(formData: FormData) {
  const id = String(formData.get("id") || "");
  const reason = String(formData.get("reason") || "").trim();
  const notifyClient = formData.get("notifyClient") === "on";

  const current = await getAppointmentById(id);
  if (!current) throw new Error("Cita no encontrada");

  await updateAppointmentStatus(id, "cancelled");

  if (notifyClient) {
    try {
      await sendCancellationEmails({
        appointmentId: id,
        clientName: current.client_name,
        clientEmail: current.client_email,
        serviceTitle: current.service_title,
        staffName: current.staff_name,
        startsAt: current.starts_at,
        reason,
      });
    } catch (err) {
      console.warn("Could not send cancellation email:", err);
    }
  }

  safeRevalidatePath("/admin/citas");
  safeRevalidatePath(`/admin/citas/${id}`);
}

export async function actionDeleteAppointment(id: string) {
  await deleteAppointment(id);
  safeRevalidatePath("/admin/citas");
  redirect("/admin/citas");
}

export async function actionUpdateService(formData: FormData) {
  const id = String(formData.get("id") || "");
  const imageUrlRaw = formData.get("imageUrl");
  const imageUrl = imageUrlRaw !== null ? String(imageUrlRaw).trim() : undefined;

  await updateService({
    id,
    title: String(formData.get("title") || ""),
    durationMins: Number(formData.get("durationMins") || 30),
    priceCents: Math.round(Number(formData.get("priceUsd") || 0) * 100),
    category: String(formData.get("category") || "Otros"),
    active: formData.get("active") === "on",
    description: String(formData.get("description") || ""),
    imageUrl: imageUrl || null,
  });

  safeRevalidatePath("/admin/servicios");
  safeRevalidatePath("/");
  safeRevalidatePath("/reservar");
  safeRevalidatePath("/servicios/miami");
  safeRevalidatePath("/servicios/miami/precios");
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
  safeRevalidatePath("/admin/equipo");
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

  safeRevalidatePath("/admin/citas");
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
