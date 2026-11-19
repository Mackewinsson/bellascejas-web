import { Resend } from "resend";
import { sql, hasDatabase } from "@/lib/db";
export * from "./promotion-templates";
import {
  type PromotionTemplateId,
  type CampaignRecord,
  type RenderPromotionParams,
  renderPromotionEmailHtml,
} from "./promotion-templates";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function fromAddress() {
  return process.env.RESEND_FROM || "Bellas Cejas <onboarding@resend.dev>";
}



// Fallback in-memory history when DB is not configured
const fallbackCampaigns: CampaignRecord[] = [
  {
    id: "camp-demo-1",
    subject: "✨ 20% OFF en tu tratamiento de Cejas — Bellas Cejas Miami",
    title: "Realza tu belleza natural con 20% de descuento",
    template_id: "promo-temporada",
    recipient_count: 5,
    recipient_emails: [
      "camila.rodriguez@gmail.com",
      "valentina.morales@hotmail.com",
      "sofia.f@yahoo.com",
      "mariana.silva@outlook.com",
      "daniela.castillo@gmail.com",
    ],
    sent_by: "Admin Bellas Cejas",
    status: "sent",
    created_at: "2026-11-16T15:00:00Z",
  },
];

let campaignTableInitialized = false;

async function ensureCampaignsTable() {
  if (!hasDatabase() || campaignTableInitialized) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS campaign_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        subject TEXT NOT NULL,
        title TEXT NOT NULL,
        template_id TEXT NOT NULL,
        content_html TEXT NOT NULL,
        recipient_count INT NOT NULL DEFAULT 0,
        recipient_emails TEXT[] NOT NULL DEFAULT '{}',
        sent_by TEXT DEFAULT 'Admin',
        status TEXT DEFAULT 'sent',
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `;
    campaignTableInitialized = true;
  } catch (err) {
    console.warn("Could not ensure campaign_logs table:", err);
  }
}

export async function listCampaignHistory(): Promise<CampaignRecord[]> {
  if (!hasDatabase()) {
    return [...fallbackCampaigns];
  }
  await ensureCampaignsTable();
  try {
    const rows = (await sql`
      SELECT id, subject, title, template_id, recipient_count, recipient_emails, sent_by, status, created_at
      FROM campaign_logs
      ORDER BY created_at DESC
      LIMIT 50
    `) as CampaignRecord[];
    return rows;
  } catch (err) {
    console.error("Error listing campaigns:", err);
    return fallbackCampaigns;
  }
}

export async function sendPromotionalCampaign(input: {
  recipients: { email: string; name?: string }[];
  subject: string;
  badge?: string;
  title: string;
  body: string;
  discountCode?: string;
  ctaText?: string;
  ctaUrl?: string;
  templateId: PromotionTemplateId;
  sentBy?: string;
  isTestOnly?: boolean;
}): Promise<{
  success: boolean;
  sentCount: number;
  skipped: boolean;
  error?: string;
}> {
  if (!input.recipients || input.recipients.length === 0) {
    return { success: false, sentCount: 0, skipped: false, error: "No hay destinatarios seleccionados" };
  }

  const resend = getResend();
  const emails = input.recipients.map((r) => r.email.toLowerCase().trim()).filter(Boolean);
  const sentBy = input.sentBy || "Admin";

  // Render HTML
  const html = renderPromotionEmailHtml({
    subject: input.subject,
    badge: input.badge,
    title: input.title,
    body: input.body,
    discountCode: input.discountCode,
    ctaText: input.ctaText,
    ctaUrl: input.ctaUrl,
  });

  if (!resend) {
    console.warn("RESEND_API_KEY is not set. Simulating promotion send in demo mode.");
    
    // Save to campaign history (fallback or db)
    const newRecord: CampaignRecord = {
      id: `camp-${Date.now()}`,
      subject: input.subject,
      title: input.title,
      template_id: input.templateId,
      recipient_count: emails.length,
      recipient_emails: emails,
      sent_by: sentBy,
      status: "simulated (sin RESEND_API_KEY)",
      created_at: new Date().toISOString(),
    };

    if (hasDatabase()) {
      try {
        await ensureCampaignsTable();
        await sql`
          INSERT INTO campaign_logs (
            subject, title, template_id, content_html, recipient_count, recipient_emails, sent_by, status
          ) VALUES (
            ${input.subject}, ${input.title}, ${input.templateId}, ${html},
            ${emails.length}, ${emails}, ${sentBy}, 'simulated'
          )
        `;
      } catch (e) {
        console.warn("Could not insert simulated campaign:", e);
      }
    } else {
      fallbackCampaigns.unshift(newRecord);
    }

    return { success: true, sentCount: emails.length, skipped: true };
  }

  // Real send via Resend
  let sentCount = 0;
  try {
    for (const r of input.recipients) {
      const personalizedHtml = renderPromotionEmailHtml({
        subject: input.subject,
        badge: input.badge,
        title: input.title,
        body: input.body,
        discountCode: input.discountCode,
        ctaText: input.ctaText,
        ctaUrl: input.ctaUrl,
        clientName: r.name,
      });

      const res = await resend.emails.send({
        from: fromAddress(),
        to: r.email,
        subject: input.subject,
        html: personalizedHtml,
      });

      if (!res.error) {
        sentCount++;
      } else {
        console.error(`Failed to send to ${r.email}:`, res.error);
      }
    }

    // Save campaign record
    if (hasDatabase()) {
      await ensureCampaignsTable();
      await sql`
        INSERT INTO campaign_logs (
          subject, title, template_id, content_html, recipient_count, recipient_emails, sent_by, status
        ) VALUES (
          ${input.subject}, ${input.title}, ${input.templateId}, ${html},
          ${sentCount}, ${emails}, ${sentBy}, 'sent'
        )
      `;
    } else {
      fallbackCampaigns.unshift({
        id: `camp-${Date.now()}`,
        subject: input.subject,
        title: input.title,
        template_id: input.templateId,
        recipient_count: sentCount,
        recipient_emails: emails,
        sent_by: sentBy,
        status: "sent",
        created_at: new Date().toISOString(),
      });
    }

    return { success: true, sentCount, skipped: false };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Error sending promotions:", err);
    return { success: false, sentCount, skipped: false, error: msg };
  }
}
