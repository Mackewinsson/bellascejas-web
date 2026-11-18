import { NextResponse } from "next/server";
import {
  createAppointment,
  getServiceById,
  getStaffById,
  listActiveStaff,
  listBusyForStaff,
} from "@/lib/booking/queries";
import { getAvailableSlots } from "@/lib/booking/slots";
import { sendBookingEmails } from "@/lib/email/booking";
import { createLead } from "@/lib/leads/queries";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const serviceId = String(body.serviceId || "");
    let staffId = String(body.staffId || "");
    const startsAt = String(body.startsAt || "");
    const clientName = String(body.clientName || "").trim();
    const clientEmail = String(body.clientEmail || "").trim().toLowerCase();
    const clientPhone = String(body.clientPhone || "").trim();
    const notes = String(body.notes || "").trim();

    if (!serviceId || !startsAt || !clientName || !clientEmail) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    const service = await getServiceById(serviceId);
    if (!service || !service.active) {
      return NextResponse.json(
        { error: "Servicio no disponible" },
        { status: 400 }
      );
    }

    const staffList = await listActiveStaff();
    if (!staffList.length) {
      return NextResponse.json(
        { error: "No hay profesionales disponibles" },
        { status: 400 }
      );
    }

    if (!staffId || staffId === "any") {
      let chosen: string | null = null;
      for (const st of staffList) {
        const busy = await listBusyForStaff(
          st.id,
          startsAt,
          new Date(
            new Date(startsAt).getTime() + service.duration_mins * 60_000
          ).toISOString()
        );
        if (busy.length === 0) {
          chosen = st.id;
          break;
        }
      }
      if (!chosen) {
        return NextResponse.json(
          { error: "Horario no disponible" },
          { status: 409 }
        );
      }
      staffId = chosen;
    }

    const staff = await getStaffById(staffId);
    if (!staff || !staff.active) {
      return NextResponse.json(
        { error: "Profesional no disponible" },
        { status: 400 }
      );
    }

    const endsAt = new Date(
      new Date(startsAt).getTime() + service.duration_mins * 60_000
    ).toISOString();

    const ymd = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(startsAt));

    const slots = await getAvailableSlots({
      dateYmd: ymd,
      durationMins: service.duration_mins,
      staffId,
    });
    if (
      !slots.includes(startsAt) &&
      !slots.some(
        (s) =>
          Math.abs(new Date(s).getTime() - new Date(startsAt).getTime()) < 1000
      )
    ) {
      return NextResponse.json(
        { error: "El horario ya no está disponible" },
        { status: 409 }
      );
    }

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

    try {
      await createLead({
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        source: "reserva",
        status: "cliente",
        notes: `Cita reservada: ${service.title}`,
      });
    } catch (e) {
      console.warn("Lead auto-sync notice:", e);
    }

    try {
      await sendBookingEmails({
        appointmentId: created.id,
        clientName,
        clientEmail,
        serviceTitle: service.title,
        staffName: staff.name,
        startsAt,
        priceCents: service.price_cents,
        durationMins: service.duration_mins,
      });
    } catch (err) {
      console.error("Email send failed", err);
    }

    return NextResponse.json({ ok: true, id: created.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "No se pudo crear la reserva" },
      { status: 500 }
    );
  }
}
