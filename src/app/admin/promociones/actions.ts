"use server";

import { revalidatePath } from "next/cache";
import {
  sendPromotionalCampaign,
  renderPromotionEmailHtml,
  type PromotionTemplateId,
} from "@/lib/email/promotions";
import { listLeads } from "@/lib/leads/queries";
import { getAdminSession } from "@/lib/auth/session";

export async function actionSendPromotion(formData: FormData) {
  const session = await getAdminSession();
  const templateId = (formData.get("templateId") || "promo-temporada") as PromotionTemplateId;
  const subject = String(formData.get("subject") || "").trim();
  const badge = String(formData.get("badge") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const discountCode = String(formData.get("discountCode") || "").trim();
  const ctaText = String(formData.get("ctaText") || "").trim();
  const ctaUrl = String(formData.get("ctaUrl") || "").trim();
  const audience = String(formData.get("audience") || "all");
  const specificLeadIds = formData.getAll("leadIds").map(String);
  const testEmail = String(formData.get("testEmail") || "").trim();

  if (!subject || !title || !body) {
    return { success: false, sentCount: 0, skipped: false, error: "Asunto, título y mensaje son obligatorios." };
  }

  // If test email is requested
  if (testEmail) {
    const result = await sendPromotionalCampaign({
      recipients: [{ email: testEmail, name: "Admin (Prueba)" }],
      subject: `[PRUEBA] ${subject}`,
      badge,
      title,
      body,
      discountCode,
      ctaText,
      ctaUrl,
      templateId,
      sentBy: session?.name || "Admin",
      isTestOnly: true,
    });
    return result;
  }

  // Resolve recipients based on audience
  const allLeads = await listLeads();
  let selectedRecipients: { email: string; name?: string }[] = [];

  if (specificLeadIds.length > 0) {
    selectedRecipients = allLeads
      .filter((l) => specificLeadIds.includes(l.id))
      .map((l) => ({ email: l.email, name: l.name }));
  } else if (audience === "clientes") {
    selectedRecipients = allLeads
      .filter((l) => l.status === "cliente" || (l.appointments_count || 0) > 0)
      .map((l) => ({ email: l.email, name: l.name }));
  } else if (audience === "nuevos") {
    selectedRecipients = allLeads
      .filter((l) => l.status === "nuevo")
      .map((l) => ({ email: l.email, name: l.name }));
  } else {
    // all
    selectedRecipients = allLeads.map((l) => ({ email: l.email, name: l.name }));
  }

  if (selectedRecipients.length === 0) {
    return { success: false, sentCount: 0, skipped: false, error: "No se encontraron destinatarios con el filtro seleccionado." };
  }

  const result = await sendPromotionalCampaign({
    recipients: selectedRecipients,
    subject,
    badge,
    title,
    body,
    discountCode,
    ctaText,
    ctaUrl,
    templateId,
    sentBy: session?.name || "Admin",
  });

  revalidatePath("/admin/promociones");
  return result;
}

export async function actionPreviewHtml(params: {
  subject: string;
  badge?: string;
  title: string;
  body: string;
  discountCode?: string;
  ctaText?: string;
  ctaUrl?: string;
}) {
  return renderPromotionEmailHtml(params);
}
