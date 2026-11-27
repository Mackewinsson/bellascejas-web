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

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#F6F2F3;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#241C1E;line-height:1.6;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F6F2F3;padding:30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:580px;background-color:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(36,28,30,0.06);">
          <tr>
            <td style="background-color:#A85A68;padding:24px 30px;text-align:center;">
              <h1 style="margin:0;font-family:Georgia,serif;font-size:24px;color:#FFFFFF;letter-spacing:3px;font-weight:500;text-transform:uppercase;">
                BELLAS CEJAS
              </h1>
              <p style="margin:4px 0 0;font-size:11px;color:#F6F2F3;letter-spacing:1.5px;text-transform:uppercase;opacity:0.9;">
                Studio & Academy · Miami
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 30px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:0 30px;">
              <hr style="border:none;border-top:1px solid #EFE8EA;margin:0;">
            </td>
          </tr>
          <tr>
            <td style="padding:24px 30px;background-color:#FFFFFF;text-align:center;">
              <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#241C1E;">
                ${SITE.name} — Studio & Academy
              </p>
              <p style="margin:0 0 10px;font-size:12px;color:#6F6064;line-height:1.5;">
                <strong>Miami:</strong> ${SITE.miami.address} (${SITE.miami.suites})
              </p>
              <p style="margin:0 0 12px;font-size:13px;">
                <a href="${SITE.whatsappUrl}" target="_blank" style="color:#A85A68;text-decoration:none;font-weight:600;">
                  WhatsApp: ${SITE.phoneDisplay}
                </a>
              </p>
              <p style="margin:0;font-size:11px;color:#9E9094;">
                Política: cancela o reprograma con al menos 48 horas de anticipación.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
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

  if (!resend) {
    console.warn("RESEND_API_KEY missing — skipping booking emails (simulation mode)");
    return { skipped: true as const };
  }

  const clientContent = `
    <div style="display:inline-block;background-color:#ECFDF5;color:#047857;padding:5px 12px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">
      ✓ Reserva Confirmada
    </div>
    <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:22px;color:#241C1E;">
      ¡Tu cita ha sido agendada con éxito!
    </h2>
    <p style="font-size:15px;color:#6F6064;margin-bottom:20px;">
      Hola <strong>${input.clientName}</strong>, gracias por elegir Bellas Cejas. Te esperamos en nuestro salón de Doral:
    </p>

    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#FAF7F8;border-radius:8px;padding:18px;margin-bottom:24px;">
      <tr>
        <td style="font-size:14px;line-height:1.8;color:#33292B;">
          <strong>Tratamiento:</strong> ${input.serviceTitle}<br>
          <strong>Especialista:</strong> ${input.staffName}<br>
          <strong>Fecha y hora:</strong> ${when}<br>
          <strong>Duración estimada:</strong> ${input.durationMins} min<br>
          <strong>Precio:</strong> ${price} <span style="font-size:12px;color:#6F6064;">(pago en el salón)</span>
        </td>
      </tr>
    </table>

    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:20px;">
      <tr>
        <td align="center">
          <a href="${SITE.whatsappUrl}" target="_blank" style="display:inline-block;background-color:#A85A68;color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:30px;">
            Escribir por WhatsApp si tienes dudas &rarr;
          </a>
        </td>
      </tr>
    </table>
    <p style="font-size:12px;color:#8F8286;margin:0;">ID de Cita: ${input.appointmentId}</p>
  `;

  const results: { clientId?: string; adminId?: string } = {};

  const client = await resend.emails.send({
    from: fromAddress(),
    to: input.clientEmail,
    subject: `Cita confirmada — ${input.serviceTitle} en Bellas Cejas`,
    html: emailWrapper(clientContent),
  });
  if (client.error) throw new Error(client.error.message);
  results.clientId = client.data?.id;

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    const adminContent = `
      <div style="display:inline-block;background-color:#EFF6FF;color:#1D4ED8;padding:5px 12px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">
        Nueva Reserva Online
      </div>
      <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:22px;color:#241C1E;">
        Nueva Cita Agendada
      </h2>
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#FAF7F8;border-radius:8px;padding:18px;margin-bottom:20px;">
        <tr>
          <td style="font-size:14px;line-height:1.8;color:#33292B;">
            <strong>Clienta:</strong> ${input.clientName}<br>
            <strong>Email:</strong> ${input.clientEmail}<br>
            <strong>Servicio:</strong> ${input.serviceTitle}<br>
            <strong>Staff asignada:</strong> ${input.staffName}<br>
            <strong>Fecha y hora:</strong> ${when}<br>
            <strong>Monto:</strong> ${price}
          </td>
        </tr>
      </table>
      <p style="margin:0;">
        <a href="${siteUrl}/admin/citas/${input.appointmentId}" style="display:inline-block;background-color:#A85A68;color:#FFFFFF;text-decoration:none;font-size:13px;font-weight:600;padding:10px 22px;border-radius:20px;">
          Ver y Gestionar en Admin &rarr;
        </a>
      </p>
    `;

    const admin = await resend.emails.send({
      from: fromAddress(),
      to: adminEmail,
      subject: `Nueva reserva: ${input.clientName} — ${input.serviceTitle}`,
      html: emailWrapper(adminContent),
    });
    if (admin.error) console.error("Admin email error", admin.error);
    else results.adminId = admin.data?.id;
  }

  return results;
}

export async function sendRescheduleEmails(input: {
  appointmentId: string;
  clientName: string;
  clientEmail: string;
  serviceTitle: string;
  staffName: string;
  oldStartsAt?: string;
  newStartsAt: string;
  durationMins: number;
}) {
  const resend = getResend();
  const newWhen = formatInMiami(input.newStartsAt, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (!resend) {
    console.warn("RESEND_API_KEY missing — simulated reschedule email notification");
    return { skipped: true as const };
  }

  const clientContent = `
    <div style="display:inline-block;background-color:#FEF3C7;color:#D97706;padding:5px 12px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">
      Cita Reprogramada
    </div>
    <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:22px;color:#241C1E;">
      Tu cita ha sido modificada
    </h2>
    <p style="font-size:15px;color:#6F6064;margin-bottom:20px;">
      Hola <strong>${input.clientName}</strong>, te informamos que el horario de tu cita en Bellas Cejas ha sido actualizado:
    </p>

    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#FAF7F8;border-radius:8px;padding:18px;margin-bottom:24px;">
      <tr>
        <td style="font-size:14px;line-height:1.8;color:#33292B;">
          <strong>Tratamiento:</strong> ${input.serviceTitle}<br>
          <strong>Especialista:</strong> ${input.staffName}<br>
          <strong>Nuevo Horario (Miami):</strong> <span style="color:#A85A68;font-weight:700;">${newWhen}</span><br>
          <strong>Duración:</strong> ${input.durationMins} min<br>
          <strong>Ubicación:</strong> ${SITE.miami.address}
        </td>
      </tr>
    </table>

    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:20px;">
      <tr>
        <td align="center">
          <a href="${SITE.whatsappUrl}" target="_blank" style="display:inline-block;background-color:#A85A68;color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:30px;">
            Consultar por WhatsApp &rarr;
          </a>
        </td>
      </tr>
    </table>
  `;

  await resend.emails.send({
    from: fromAddress(),
    to: input.clientEmail,
    subject: `Cita reprogramada — ${input.serviceTitle} en Bellas Cejas`,
    html: emailWrapper(clientContent),
  });

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    const adminContent = `
      <div style="display:inline-block;background-color:#FEF3C7;color:#D97706;padding:5px 12px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">
        Aviso de Reprogramación
      </div>
      <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:20px;color:#241C1E;">
        Cita Reprogramada
      </h2>
      <p style="font-size:14px;color:#33292B;">
        La cita de <strong>${input.clientName}</strong> (${input.serviceTitle}) fue movida a: <strong>${newWhen}</strong>.
      </p>
      <p style="margin-top:16px;">
        <a href="${siteUrl}/admin/citas/${input.appointmentId}" style="display:inline-block;background-color:#A85A68;color:#FFFFFF;text-decoration:none;font-size:13px;font-weight:600;padding:10px 22px;border-radius:20px;">
          Ver Cita en Admin &rarr;
        </a>
      </p>
    `;

    await resend.emails.send({
      from: fromAddress(),
      to: adminEmail,
      subject: `[Admin] Cita reprogramada: ${input.clientName} a ${newWhen}`,
      html: emailWrapper(adminContent),
    });
  }

  return { success: true };
}

export async function sendCancellationEmails(input: {
  appointmentId: string;
  clientName: string;
  clientEmail: string;
  serviceTitle: string;
  staffName: string;
  startsAt: string;
  reason?: string;
}) {
  const resend = getResend();
  const when = formatInMiami(input.startsAt, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (!resend) {
    console.warn("RESEND_API_KEY missing — simulated cancellation email notification");
    return { skipped: true as const };
  }

  const reasonHtml = input.reason
    ? `<p style="font-size:14px;color:#6F6064;margin-bottom:16px;"><strong>Motivo:</strong> ${input.reason}</p>`
    : "";

  const clientContent = `
    <div style="display:inline-block;background-color:#FEE2E2;color:#B91C1C;padding:5px 12px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">
      Cita Cancelada
    </div>
    <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:22px;color:#241C1E;">
      Tu cita ha sido cancelada
    </h2>
    <p style="font-size:15px;color:#6F6064;margin-bottom:16px;">
      Hola <strong>${input.clientName}</strong>, te confirmamos que la siguiente cita ha sido cancelada:
    </p>

    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#FAF7F8;border-radius:8px;padding:18px;margin-bottom:20px;">
      <tr>
        <td style="font-size:14px;line-height:1.8;color:#33292B;">
          <strong>Tratamiento:</strong> ${input.serviceTitle}<br>
          <strong>Especialista:</strong> ${input.staffName}<br>
          <strong>Fecha y hora cancelada:</strong> ${when}
        </td>
      </tr>
    </table>

    ${reasonHtml}

    <p style="font-size:14px;color:#6F6064;margin-bottom:20px;">
      Si deseas reprogramar para otra fecha, puedes reservar en línea cuando gustes:
    </p>

    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:20px;">
      <tr>
        <td align="center">
          <a href="${siteUrl}/reservar" target="_blank" style="display:inline-block;background-color:#A85A68;color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:30px;">
            Agendar Nueva Cita &rarr;
          </a>
        </td>
      </tr>
    </table>
  `;

  await resend.emails.send({
    from: fromAddress(),
    to: input.clientEmail,
    subject: `Cita cancelada — Bellas Cejas`,
    html: emailWrapper(clientContent),
  });

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    const adminContent = `
      <div style="display:inline-block;background-color:#FEE2E2;color:#B91C1C;padding:5px 12px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">
        Aviso de Cancelación
      </div>
      <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:20px;color:#241C1E;">
        Cita Cancelada
      </h2>
      <p style="font-size:14px;color:#33292B;">
        La cita de <strong>${input.clientName}</strong> (${input.serviceTitle}) programada para <strong>${when}</strong> fue cancelada.
      </p>
      ${reasonHtml}
    `;

    await resend.emails.send({
      from: fromAddress(),
      to: adminEmail,
      subject: `[Admin] Cita cancelada: ${input.clientName} — ${input.serviceTitle}`,
      html: emailWrapper(adminContent),
    });
  }

  return { success: true };
}
