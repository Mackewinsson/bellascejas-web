import { SITE } from "@/lib/site";

export type PromotionTemplateId =
  | "promo-temporada"
  | "combo-mirada"
  | "reactivacion"
  | "custom";

export type PromotionTemplate = {
  id: PromotionTemplateId;
  name: string;
  defaultSubject: string;
  defaultBadge: string;
  defaultTitle: string;
  defaultBody: string;
  defaultDiscountCode?: string;
  defaultCtaText: string;
  defaultCtaUrl: string;
};

export const PROMO_TEMPLATES: PromotionTemplate[] = [
  {
    id: "promo-temporada",
    name: "Descuento de Temporada (20% OFF)",
    defaultSubject: "✨ 20% OFF en tu tratamiento de Cejas — Bellas Cejas Miami",
    defaultBadge: "✦ OFERTA EXCLUSIVA DE TEMPORADA",
    defaultTitle: "Realza tu belleza natural con 20% de descuento",
    defaultBody:
      "Porque sabemos lo importante que es sentirte segura y radiante todos los días. Esta semana te regalamos un 20% de descuento en nuestros servicios estrella de Microblading, Powder Brows o Laminado de Cejas. Diseñamos la forma perfecta para la armonía de tu rostro.",
    defaultDiscountCode: "BELLEZA20",
    defaultCtaText: "Reservar Cita con 20% OFF",
    defaultCtaUrl: "/reservar",
  },
  {
    id: "combo-mirada",
    name: "Pack Dúo: Cejas & Pestañas",
    defaultSubject: "💎 Combo Especial: Mirada Perfecta en Bellas Cejas",
    defaultBadge: "✦ PACK EXCLUSIVO DEL MES",
    defaultTitle: "Lifting de Pestañas + Diseño de Cejas con Henna",
    defaultBody:
      "Luce una mirada impactante y natural sin necesidad de maquillaje diario. Disfruta de una sesión integral donde perfilamos, estilizamos y nutrimos tus pestañas y cejas con productos de grado cosmético europeo de máxima duración.",
    defaultDiscountCode: "PACKDUO85",
    defaultCtaText: "Aprovechar Combo Especial",
    defaultCtaUrl: "/reservar",
  },
  {
    id: "reactivacion",
    name: "Reactivación: Te Extrañamos",
    defaultSubject: "🌸 ¡Te extrañamos en Bellas Cejas! Tenemos un regalo para ti",
    defaultBadge: "✦ BENEFICIO VIP CLIENTAS",
    defaultTitle: "¿Lista para tu retoque o nuevo tratamiento?",
    defaultBody:
      "Ha pasado un tiempo desde tu última visita y queremos que tus cejas y rostro sigan luciendo impecables. Te obsequiamos un bono especial de $15 USD para tu próxima cita de retoque, mantenimiento o hidratación facial en nuestro salón de Doral.",
    defaultDiscountCode: "RETOQUE15",
    defaultCtaText: "Agendar mi Cita con Bono",
    defaultCtaUrl: "/reservar",
  },
  {
    id: "custom",
    name: "Plantilla Libre Personalizada",
    defaultSubject: "Novedades y promociones especiales en Bellas Cejas",
    defaultBadge: "✦ COMUNICADO ESPECIAL",
    defaultTitle: "Una sorpresa especial para ti",
    defaultBody:
      "Nos complace compartir contigo nuestras promociones exclusivas. Agenda hoy tu cita y permítenos consentirte con la atención de excelencia que mereces.",
    defaultDiscountCode: "",
    defaultCtaText: "Ver Servicios y Reservar",
    defaultCtaUrl: "/reservar",
  },
];

export type RenderPromotionParams = {
  subject: string;
  badge?: string;
  title: string;
  body: string;
  discountCode?: string;
  ctaText?: string;
  ctaUrl?: string;
  siteUrl?: string;
  clientName?: string;
};

/**
 * Generates an email client-compatible HTML template using Bellas Cejas
 * corporate branding (#A85A68, #F6F2F3, Bodoni Moda/Sora style, Pigment Porcelain).
 */
export function renderPromotionEmailHtml(params: RenderPromotionParams): string {
  const siteUrl = params.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://bellascejas.com";
  let targetCta = params.ctaUrl || "/reservar";
  if (targetCta.startsWith("/")) {
    targetCta = `${siteUrl}${targetCta}`;
  }

  const badgeHtml = params.badge
    ? `
      <div style="display:inline-block;background-color:#F5EBEF;color:#A85A68;padding:6px 14px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">
        ${params.badge}
      </div>
    `
    : "";

  const discountHtml = params.discountCode
    ? `
      <div style="background-color:#FAF7F8;border:2px dashed #D4A0A8;border-radius:8px;padding:16px;text-align:center;margin:24px 0;">
        <span style="font-size:12px;color:#6F6064;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px;">Código de Descuento</span>
        <span style="font-family:monospace,sans-serif;font-size:22px;font-weight:700;color:#A85A68;letter-spacing:2px;">${params.discountCode}</span>
        <span style="font-size:11px;color:#8F4A57;display:block;margin-top:4px;">Presenta o menciona este código al agendar tu cita</span>
      </div>
    `
    : "";

  const greeting = params.clientName ? `Hola ${params.clientName},` : "Hola bella,";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${params.subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#F6F2F3;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#241C1E;line-height:1.6;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F6F2F3;padding:30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:580px;background-color:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(36,28,30,0.06);">
          
          <!-- Header Bar -->
          <tr>
            <td style="background-color:#A85A68;padding:26px 30px;text-align:center;">
              <h1 style="margin:0;font-family:Georgia,serif;font-size:26px;color:#FFFFFF;letter-spacing:3px;font-weight:500;text-transform:uppercase;">
                BELLAS CEJAS
              </h1>
              <p style="margin:4px 0 0;font-size:11px;color:#F6F2F3;letter-spacing:1.5px;text-transform:uppercase;opacity:0.9;">
                Academy & Eyebrow Bar · Miami & Santiago
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding:36px 32px 28px;">
              ${badgeHtml}
              
              <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:24px;line-height:1.3;color:#241C1E;font-weight:600;">
                ${params.title}
              </h2>

              <p style="margin:0 0 16px;font-size:15px;color:#6F6064;line-height:1.6;">
                <strong>${greeting}</strong>
              </p>

              <div style="font-size:15px;color:#4A4042;line-height:1.7;white-space:pre-line;">
${params.body}
              </div>

              ${discountHtml}

              <!-- CTA Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:28px 0 16px;">
                <tr>
                  <td align="center">
                    <a href="${targetCta}" target="_blank" style="display:inline-block;background-color:#A85A68;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:600;padding:14px 34px;border-radius:30px;letter-spacing:0.5px;box-shadow:0 4px 12px rgba(168,90,104,0.3);">
                      ${params.ctaText || "Reservar Cita Online"} &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Highlights / Benefits Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#FAF7F8;border-radius:8px;padding:16px 20px;margin-top:20px;">
                <tr>
                  <td>
                    <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#A85A68;text-transform:uppercase;letter-spacing:1px;">
                      ¿Por qué elegir Bellas Cejas?
                    </p>
                    <ul style="margin:0;padding-left:18px;font-size:13px;color:#6F6064;line-height:1.6;">
                      <li>Atención exclusiva por especialistas certificadas internacionalmente.</li>
                      <li>Pigmentos hipoalergénicos biocompatibles de grado médico.</li>
                      <li>Visagismo personalizado adaptado a tus facciones.</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <hr style="border:none;border-top:1px solid #EFE8EA;margin:0;">
            </td>
          </tr>

          <!-- Footer Information -->
          <tr>
            <td style="padding:28px 32px 32px;background-color:#FFFFFF;text-align:center;">
              <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#241C1E;">
                ${SITE.name} — Studio & Academy
              </p>
              <p style="margin:0 0 12px;font-size:12px;color:#6F6064;line-height:1.5;">
                <strong>Miami:</strong> ${SITE.miami.address} (${SITE.miami.suites})<br>
                <strong>Santiago:</strong> ${SITE.santiago.address}
              </p>
              
              <p style="margin:0 0 16px;font-size:13px;">
                <a href="${SITE.whatsappUrl}" target="_blank" style="color:#A85A68;text-decoration:none;font-weight:600;">
                  WhatsApp: ${SITE.phoneDisplay}
                </a>
                &nbsp;·&nbsp;
                <a href="${siteUrl}" target="_blank" style="color:#A85A68;text-decoration:none;">
                  Visitar Sitio Web
                </a>
              </p>

              <p style="margin:0;font-size:11px;color:#9E9094;line-height:1.4;">
                Has recibido este correo electrónico porque eres clienta o te contactaste con Bellas Cejas.<br>
                Para cualquier consulta, responde directamente a este mensaje o contáctanos por WhatsApp.
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

export type CampaignRecord = {
  id: string;
  subject: string;
  title: string;
  template_id: string;
  recipient_count: number;
  recipient_emails: string[];
  sent_by: string;
  status: string;
  created_at: string;
};
