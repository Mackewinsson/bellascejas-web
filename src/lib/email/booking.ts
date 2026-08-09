import { Resend } from "resend";
import { SITE } from "@/lib/site";
import { formatUsd } from "@/lib/booking/types";
import { formatInMiami } from "@/lib/booking/slots";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function fromAddress() {
  return process.env.RESEND_FROM || "Bellas Cejas <onboarding@resend.dev>";
}

export async function sendBookingEmails(input: {
  appointmentId: string;
  clientName: string;
  clientEmail: string;
  serviceTitle: string;
  staffName: string;
  startsAt: string;
  priceCents: number;
  durationMins: number;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY missing — skipping booking emails");
    return { skipped: true as const };
  }

  const when = formatInMiami(input.startsAt, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const price = formatUsd(input.priceCents);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const clientHtml = `
    <div style="font-family:sans-serif;line-height:1.5;color:#1a1a1a">
      <h1 style="font-size:22px">Reserva confirmada</h1>
      <p>Hola ${input.clientName},</p>
      <p>Tu cita en <strong>Bellas Cejas</strong> quedó agendada:</p>
      <ul>
        <li><strong>Servicio:</strong> ${input.serviceTitle}</li>
        <li><strong>Profesional:</strong> ${input.staffName}</li>
        <li><strong>Fecha y hora (Miami):</strong> ${when}</li>
        <li><strong>Duración:</strong> ${input.durationMins} min</li>
        <li><strong>Precio:</strong> ${price} (pago en el salón)</li>
      </ul>
      <p><strong>Dirección:</strong> ${SITE.miami.address}<br/>${SITE.miami.suites}</p>
      <p>Política: cancela o reprograma con al menos <strong>48 horas</strong> de anticipación.</p>
      <p>WhatsApp: <a href="${SITE.whatsappUrl}">${SITE.phoneDisplay}</a></p>
      <p style="color:#6b6560;font-size:13px">ID: ${input.appointmentId}<br/>${siteUrl}</p>
    </div>
  `;

  const adminEmail = process.env.ADMIN_EMAIL;
  const results: { clientId?: string; adminId?: string } = {};

  const client = await resend.emails.send({
    from: fromAddress(),
    to: input.clientEmail,
    subject: `Cita confirmada — ${input.serviceTitle}`,
    html: clientHtml,
  });
  if (client.error) throw new Error(client.error.message);
  results.clientId = client.data?.id;

  if (adminEmail) {
    const admin = await resend.emails.send({
      from: fromAddress(),
      to: adminEmail,
      subject: `Nueva reserva — ${input.clientName}`,
      html: `
        <div style="font-family:sans-serif;line-height:1.5">
          <h1 style="font-size:20px">Nueva reserva</h1>
          <ul>
            <li><strong>Cliente:</strong> ${input.clientName}</li>
            <li><strong>Email:</strong> ${input.clientEmail}</li>
            <li><strong>Servicio:</strong> ${input.serviceTitle}</li>
            <li><strong>Staff:</strong> ${input.staffName}</li>
            <li><strong>Cuando:</strong> ${when}</li>
            <li><strong>Precio:</strong> ${price}</li>
          </ul>
          <p><a href="${siteUrl}/admin/citas/${input.appointmentId}">Ver en admin</a></p>
        </div>
      `,
    });
    if (admin.error) console.error("Admin email error", admin.error);
    else results.adminId = admin.data?.id;
  }

  return results;
}
