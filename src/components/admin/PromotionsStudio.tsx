"use client";

import { useState, useMemo } from "react";
import type { Lead } from "@/lib/leads/types";
import {
  PROMO_TEMPLATES,
  renderPromotionEmailHtml,
  type PromotionTemplateId,
  type CampaignRecord,
} from "@/lib/email/promotion-templates";
import { actionSendPromotion } from "@/app/admin/promociones/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Eye,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Monitor,
  History,
  MailCheck,
} from "lucide-react";

type Props = {
  leads: Lead[];
  history: CampaignRecord[];
  initialLeadId?: string;
  initialEmail?: string;
};

export function PromotionsStudio({ leads, history, initialLeadId, initialEmail }: Props) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<PromotionTemplateId>("promo-temporada");
  const [subject, setSubject] = useState(PROMO_TEMPLATES[0].defaultSubject);
  const [badge, setBadge] = useState(PROMO_TEMPLATES[0].defaultBadge);
  const [title, setTitle] = useState(PROMO_TEMPLATES[0].defaultTitle);
  const [body, setBody] = useState(PROMO_TEMPLATES[0].defaultBody);
  const [discountCode, setDiscountCode] = useState(PROMO_TEMPLATES[0].defaultDiscountCode || "");
  const [ctaText, setCtaText] = useState(PROMO_TEMPLATES[0].defaultCtaText);
  const [ctaUrl, setCtaUrl] = useState(PROMO_TEMPLATES[0].defaultCtaUrl);

  const [audience, setAudience] = useState<"all" | "clientes" | "nuevos" | "custom">(
    initialLeadId ? "custom" : "all"
  );
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>(
    initialLeadId ? [initialLeadId] : []
  );
  const [testEmail, setTestEmail] = useState(initialEmail || "");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // When changing template preset
  const handleTemplateChange = (tmplId: PromotionTemplateId) => {
    setSelectedTemplateId(tmplId);
    const tmpl = PROMO_TEMPLATES.find((t) => t.id === tmplId);
    if (tmpl) {
      setSubject(tmpl.defaultSubject);
      setBadge(tmpl.defaultBadge);
      setTitle(tmpl.defaultTitle);
      setBody(tmpl.defaultBody);
      setDiscountCode(tmpl.defaultDiscountCode || "");
      setCtaText(tmpl.defaultCtaText);
      setCtaUrl(tmpl.defaultCtaUrl);
    }
  };

  // Live rendered HTML
  const renderedHtml = useMemo(() => {
    return renderPromotionEmailHtml({
      subject,
      badge,
      title,
      body,
      discountCode,
      ctaText,
      ctaUrl,
      clientName: "Valentina",
    });
  }, [subject, badge, title, body, discountCode, ctaText, ctaUrl]);

  // Recipient count calculation
  const targetCount = useMemo(() => {
    if (audience === "custom") return selectedLeadIds.length;
    if (audience === "clientes") {
      return leads.filter((l) => l.status === "cliente" || (l.appointments_count || 0) > 0).length;
    }
    if (audience === "nuevos") {
      return leads.filter((l) => l.status === "nuevo").length;
    }
    return leads.length;
  }, [audience, selectedLeadIds, leads]);

  const handleSendCampaign = async (isTest: boolean) => {
    setIsSending(true);
    setStatusMessage(null);

    const formData = new FormData();
    formData.set("templateId", selectedTemplateId);
    formData.set("subject", subject);
    formData.set("badge", badge);
    formData.set("title", title);
    formData.set("body", body);
    formData.set("discountCode", discountCode);
    formData.set("ctaText", ctaText);
    formData.set("ctaUrl", ctaUrl);
    formData.set("audience", audience);

    if (isTest) {
      if (!testEmail) {
        setStatusMessage({ type: "error", text: "Ingresa un email para la prueba." });
        setIsSending(false);
        return;
      }
      formData.set("testEmail", testEmail);
    } else {
      if (audience === "custom") {
        for (const id of selectedLeadIds) {
          formData.append("leadIds", id);
        }
      }
    }

    try {
      const res = await actionSendPromotion(formData);
      if (res.success) {
        const msg = isTest
          ? `Correo de prueba enviado con éxito a ${testEmail} ${res.skipped ? "(Modo Demo / Sin RESEND_API_KEY)" : ""}`
          : `Campaña enviada exitosamente a ${res.sentCount} destinatarios ${res.skipped ? "(Modo Demo / Sin RESEND_API_KEY)" : ""}`;
        setStatusMessage({ type: "success", text: msg });
      } else {
        setStatusMessage({ type: "error", text: res.error || "Ocurrió un error al enviar." });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setIsSending(false);
    }
  };

  const toggleLeadSelection = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <span>💌</span> Promociones & Email Marketing
        </h1>
        <p className="text-sm text-muted-foreground">
          Envía correos con promociones corporativas en HTML preformateado con la identidad y colores de Bellas Cejas.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm border ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-destructive/10 text-destructive border-destructive/20"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Editor Form (7 cols) */}
        <div className="lg:col-span-6 bg-card border rounded-xl p-5 shadow-xs space-y-5">
          {/* Template Selection */}
          <div className="space-y-2">
            <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
              1. Selecciona una Plantilla Corporativa
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {PROMO_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleTemplateChange(tmpl.id)}
                  className={`p-3 rounded-lg border text-left text-xs transition-all ${
                    selectedTemplateId === tmpl.id
                      ? "border-[#A85A68] bg-[#A85A68]/10 text-foreground font-semibold ring-1 ring-[#A85A68]"
                      : "border-border hover:bg-accent/40 text-muted-foreground"
                  }`}
                >
                  <div className="font-semibold text-foreground truncate">{tmpl.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                    {tmpl.defaultBadge || "Promoción"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Audience Selection */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                2. Destinatarios ({targetCount} seleccionados)
              </Label>
              <Badge variant="outline" className="text-[11px]">
                {targetCount} de {leads.length} leads
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setAudience("all")}
                className={`py-2 px-2.5 rounded-md border text-xs text-center transition-colors ${
                  audience === "all" ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-accent"
                }`}
              >
                Todos ({leads.length})
              </button>
              <button
                type="button"
                onClick={() => setAudience("clientes")}
                className={`py-2 px-2.5 rounded-md border text-xs text-center transition-colors ${
                  audience === "clientes" ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-accent"
                }`}
              >
                Clientas ({leads.filter((l) => l.status === "cliente" || (l.appointments_count || 0) > 0).length})
              </button>
              <button
                type="button"
                onClick={() => setAudience("nuevos")}
                className={`py-2 px-2.5 rounded-md border text-xs text-center transition-colors ${
                  audience === "nuevos" ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-accent"
                }`}
              >
                Nuevos ({leads.filter((l) => l.status === "nuevo").length})
              </button>
              <button
                type="button"
                onClick={() => setAudience("custom")}
                className={`py-2 px-2.5 rounded-md border text-xs text-center transition-colors ${
                  audience === "custom" ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-accent"
                }`}
              >
                Elegir ({selectedLeadIds.length})
              </button>
            </div>

            {audience === "custom" && (
              <div className="max-h-36 overflow-y-auto border rounded-md p-2 divide-y text-xs bg-background">
                {leads.map((l) => (
                  <label key={l.id} className="flex items-center gap-2 py-1.5 px-1 cursor-pointer hover:bg-muted/30">
                    <input
                      type="checkbox"
                      checked={selectedLeadIds.includes(l.id)}
                      onChange={() => toggleLeadSelection(l.id)}
                      className="rounded"
                    />
                    <span className="font-medium text-foreground">{l.name}</span>
                    <span className="text-muted-foreground text-[11px] truncate">({l.email})</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Email Content Inputs */}
          <div className="space-y-3.5 border-t pt-4">
            <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
              3. Contenido del Correo
            </Label>

            <div className="space-y-1">
              <Label htmlFor="subject" className="text-xs">Asunto del Email</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ej: ✨ 20% OFF en tu tratamiento..."
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="badge" className="text-xs">Distintivo / Badge</Label>
                <Input
                  id="badge"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="✦ OFERTA EXCLUSIVA"
                  className="text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="discountCode" className="text-xs">Código Descuento (opcional)</Label>
                <Input
                  id="discountCode"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="BELLEZA20"
                  className="text-sm font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="title" className="text-xs">Titular Principal</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Realza tu belleza natural con 20% de descuento"
                className="text-sm font-semibold"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="body" className="text-xs">Mensaje / Texto</Label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="w-full border rounded-md p-2.5 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                placeholder="Redacta el mensaje de la promoción..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="ctaText" className="text-xs">Texto del Botón</Label>
                <Input
                  id="ctaText"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="Reservar Cita Online"
                  className="text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="ctaUrl" className="text-xs">Enlace del Botón</Label>
                <Input
                  id="ctaUrl"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  placeholder="/reservar"
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Test & Send Buttons */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex-1 min-w-[200px]">
                <Input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="tu-email@ejemplo.com (para test)"
                  className="text-xs h-9"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSending}
                onClick={() => handleSendCampaign(true)}
              >
                <MailCheck className="w-4 h-4 mr-1 text-muted-foreground" />
                Enviar Prueba
              </Button>
            </div>

            <Button
              type="button"
              className="w-full bg-[#A85A68] hover:bg-[#8F4A57] text-white"
              disabled={isSending || targetCount === 0}
              onClick={() => handleSendCampaign(false)}
            >
              <Send className="w-4 h-4 mr-1.5" />
              {isSending ? "Enviando..." : `Enviar Promoción a ${targetCount} Destinatarios`}
            </Button>
          </div>
        </div>

        {/* Live Preview (6 cols) */}
        <div className="lg:col-span-6 bg-card border rounded-xl p-4 shadow-xs sticky top-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#A85A68]" />
              <span className="font-semibold text-sm text-foreground">Vista Previa en Vivo (HTML)</span>
            </div>

            <div className="inline-flex rounded-lg border bg-muted p-0.5">
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={`p-1.5 rounded-md ${previewDevice === "desktop" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"}`}
                title="Vista Desktop"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={`p-1.5 rounded-md ${previewDevice === "mobile" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"}`}
                title="Vista Móvil"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div
            className={`border rounded-xl overflow-hidden bg-[#F6F2F3] mx-auto transition-all ${
              previewDevice === "mobile" ? "w-[360px] shadow-md" : "w-full"
            }`}
            style={{ height: "640px" }}
          >
            <iframe
              srcDoc={renderedHtml}
              title="Email Preview"
              className="w-full h-full border-0 bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Campaign History */}
      <div className="bg-card border rounded-xl p-5 shadow-xs space-y-4">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2 border-b pb-3">
          <History className="w-4 h-4 text-muted-foreground" />
          Historial de Campañas Enviadas
        </h2>

        {history.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            Aún no se han enviado campañas de promociones.
          </p>
        ) : (
          <div className="divide-y text-xs">
            {history.map((c) => (
              <div key={c.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-foreground text-sm">{c.subject}</div>
                  <div className="text-muted-foreground mt-0.5">
                    {c.title} · Plantilla: {c.template_id}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="secondary">
                    {c.recipient_count} {c.recipient_count === 1 ? "destinatario" : "destinatarios"}
                  </Badge>
                  <span className="text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString("es-ES")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
