"use client";

import { useState } from "react";
import Link from "next/link";
import { formatUsd, type AppointmentWithJoins, type Service, type Staff } from "@/lib/booking/types";
import { formatInMiami } from "@/lib/booking/dates";
import {
  actionModifyAppointment,
  actionRescheduleAppointment,
  actionCancelAppointment,
  actionDeleteAppointment,
  actionResendEmail,
  actionUpdateAppointmentStatus,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MessageCircle,
  Edit,
  XCircle,
  Trash2,
  Send,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

type Props = {
  appointment: AppointmentWithJoins;
  services: Service[];
  staff: Staff[];
};

export function AppointmentEditor({ appointment: a, services, staff }: Props) {
  const [activeTab, setActiveTab] = useState<"mover" | "modificar" | "cancelar">("mover");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const cleanPhone = (a.client_phone || "").replace(/[^0-9]/g, "");

  // Format starts_at to datetime-local input string in Miami (YYYY-MM-DDTHH:mm)
  const defaultLocalDatetime = (() => {
    try {
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).formatToParts(new Date(a.starts_at));
      const getVal = (t: string) => parts.find((p) => p.type === t)?.value || "";
      const h = getVal("hour") === "24" ? "00" : getVal("hour");
      return `${getVal("year")}-${getVal("month")}-${getVal("day")}T${h}:${getVal("minute")}`;
    } catch {
      return a.starts_at.slice(0, 16);
    }
  })();

  const handleResend = async () => {
    setResendStatus("Enviando...");
    try {
      await actionResendEmail(a.id);
      setResendStatus("✓ Correo reenviado con éxito");
      setTimeout(() => setResendStatus(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setResendStatus("Error: " + msg);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="h-9 w-9">
            <Link href="/admin/citas">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Cita de {a.client_name}
              </h1>
              <Badge
                variant={
                  a.status === "confirmed"
                    ? "default"
                    : a.status === "completed"
                    ? "secondary"
                    : a.status === "cancelled"
                    ? "destructive"
                    : "outline"
                }
                className="capitalize text-xs"
              >
                {a.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              ID: {a.id} · Creada el {new Date(a.created_at).toLocaleDateString("es-ES")}
            </p>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {cleanPhone && (
            <Button asChild variant="outline" size="sm" className="text-emerald-700 border-emerald-300 hover:bg-emerald-50">
              <a
                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                  `Hola ${a.client_name}, te escribimos de Bellas Cejas respecto a tu cita para ${a.service_title}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-4 h-4 mr-1 text-emerald-600" />
                WhatsApp
              </a>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResend}
            className="text-xs"
          >
            <Send className="w-3.5 h-3.5 mr-1 text-[#A85A68]" />
            Reenviar Confirmación
          </Button>
        </div>
      </div>

      {resendStatus && (
        <div className="p-3 bg-secondary text-secondary-foreground text-xs rounded-lg border font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{resendStatus}</span>
        </div>
      )}

      {/* Appointment Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left card: Date, Service, Staff */}
        <div className="bg-card border rounded-xl p-5 shadow-xs space-y-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Detalles de la Cita
          </span>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-[#A85A68] mt-0.5 shrink-0" />
              <div>
                <strong className="block text-foreground">
                  {formatInMiami(a.starts_at, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
                <span className="text-xs text-muted-foreground">
                  {formatInMiami(a.starts_at, { hour: "numeric", minute: "2-digit" })} -{" "}
                  {formatInMiami(a.ends_at, { hour: "numeric", minute: "2-digit" })} (Miami Time)
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-1">
              <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-foreground">{a.service_title}</span>
                <p className="text-xs text-muted-foreground">
                  {a.service_duration_mins} minutos · {formatUsd(a.service_price_cents)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <User className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-xs text-foreground">
                Especialista asignada: <strong>{a.staff_name}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right card: Client Info */}
        <div className="bg-card border rounded-xl p-5 shadow-xs space-y-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Información de la Clienta
          </span>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground text-base">{a.client_name}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <a href={`mailto:${a.client_email}`} className="hover:underline text-foreground">
                {a.client_email}
              </a>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span>{a.client_phone || "Sin teléfono registrado"}</span>
            </div>

            {a.notes && (
              <div className="pt-1">
                <span className="text-xs font-medium text-muted-foreground block">Notas:</span>
                <p className="text-xs bg-muted/40 p-2 rounded text-muted-foreground italic mt-0.5">
                  &ldquo;{a.notes}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Administration Action Panel */}
      <div className="bg-card border rounded-xl shadow-xs overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b bg-muted/30">
          <button
            type="button"
            onClick={() => setActiveTab("mover")}
            className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-all border-b-2 ${
              activeTab === "mover"
                ? "border-[#A85A68] text-[#A85A68] bg-card"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Mover / Reagendar Cita
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("modificar")}
            className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-all border-b-2 ${
              activeTab === "modificar"
                ? "border-[#A85A68] text-[#A85A68] bg-card"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Edit className="w-4 h-4" />
            Modificar Cita
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("cancelar")}
            className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-all border-b-2 ${
              activeTab === "cancelar"
                ? "border-destructive text-destructive bg-card"
                : "border-transparent text-muted-foreground hover:text-destructive"
            }`}
          >
            <XCircle className="w-4 h-4" />
            Cancelar Cita
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* TAB 1: MOVER / REAGENDAR */}
          {activeTab === "mover" && (
            <form
              action={async (formData) => {
                setIsSubmitting(true);
                try {
                  await actionRescheduleAppointment(formData);
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="space-y-4 max-w-lg"
            >
              <input type="hidden" name="id" value={a.id} />

              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Reprogramar fecha y hora de la cita
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Elige el nuevo horario. La duración del servicio ({a.service_duration_mins} min) se calculará automáticamente.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="startsAt" className="text-xs">
                  Nueva Fecha y Hora (Miami) *
                </Label>
                <Input
                  id="startsAt"
                  name="startsAt"
                  type="datetime-local"
                  defaultValue={defaultLocalDatetime}
                  required
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="staffId" className="text-xs">
                  Especialista
                </Label>
                <select
                  id="staffId"
                  name="staffId"
                  defaultValue={a.staff_id}
                  className="w-full border rounded-md h-9 px-2.5 text-sm bg-background"
                >
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="notifyClientMover"
                  name="notifyClient"
                  defaultChecked
                  className="rounded border-border text-[#A85A68] focus:ring-[#A85A68]"
                />
                <Label htmlFor="notifyClientMover" className="text-xs cursor-pointer text-foreground">
                  Notificar cambio de horario por email a la clienta y al admin con Resend
                </Label>
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#A85A68] hover:bg-[#8F4A57] text-white"
                >
                  <Calendar className="w-4 h-4 mr-1.5" />
                  {isSubmitting ? "Guardando..." : "Confirmar y Mover Cita"}
                </Button>
              </div>
            </form>
          )}

          {/* TAB 2: MODIFICAR */}
          {activeTab === "modificar" && (
            <form
              action={async (formData) => {
                setIsSubmitting(true);
                try {
                  await actionModifyAppointment(formData);
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="space-y-4 max-w-xl"
            >
              <input type="hidden" name="id" value={a.id} />

              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Modificar datos de la cita y clienta
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Actualiza el servicio, especialista asignada o información de contacto.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="clientName" className="text-xs">Nombre de la clienta *</Label>
                  <Input
                    id="clientName"
                    name="clientName"
                    defaultValue={a.client_name}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="clientEmail" className="text-xs">Correo electrónico *</Label>
                  <Input
                    id="clientEmail"
                    name="clientEmail"
                    type="email"
                    defaultValue={a.client_email}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="clientPhone" className="text-xs">Teléfono / WhatsApp</Label>
                  <Input
                    id="clientPhone"
                    name="clientPhone"
                    defaultValue={a.client_phone}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="status" className="text-xs">Estado de la Cita</Label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={a.status}
                    className="w-full border rounded-md h-9 px-2 text-sm bg-background"
                  >
                    <option value="confirmed">Confirmada</option>
                    <option value="pending">Pendiente</option>
                    <option value="completed">Completada</option>
                    <option value="cancelled">Cancelada</option>
                    <option value="no_show">No show</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="serviceId" className="text-xs">Tratamiento / Servicio</Label>
                  <select
                    id="serviceId"
                    name="serviceId"
                    defaultValue={a.service_id}
                    className="w-full border rounded-md h-9 px-2 text-sm bg-background"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({s.duration_mins} min · {formatUsd(s.price_cents)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="staffIdMod" className="text-xs">Especialista</Label>
                  <select
                    id="staffIdMod"
                    name="staffId"
                    defaultValue={a.staff_id}
                    className="w-full border rounded-md h-9 px-2 text-sm bg-background"
                  >
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="notes" className="text-xs">Notas y Observaciones</Label>
                <textarea
                  id="notes"
                  name="notes"
                  defaultValue={a.notes}
                  rows={3}
                  className="w-full border rounded-md p-2.5 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Detalles sobre cuidados, diseño o solicitud especial..."
                />
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={isSubmitting}>
                  <Edit className="w-4 h-4 mr-1.5" />
                  {isSubmitting ? "Guardando..." : "Guardar Modificaciones"}
                </Button>
              </div>
            </form>
          )}

          {/* TAB 3: CANCELAR */}
          {activeTab === "cancelar" && (
            <div className="space-y-5 max-w-lg">
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Cancelar esta cita</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Al cancelar, la cita cambiará su estado a &quot;cancelada&quot;. Puedes enviar una notificación automática por correo a la clienta y al administrador con Resend.
                </p>
              </div>

              <form
                action={async (formData) => {
                  setIsSubmitting(true);
                  try {
                    await actionCancelAppointment(formData);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="space-y-3"
              >
                <input type="hidden" name="id" value={a.id} />

                <div className="space-y-1.5">
                  <Label htmlFor="reason" className="text-xs">
                    Motivo de la cancelación (opcional)
                  </Label>
                  <Input
                    id="reason"
                    name="reason"
                    placeholder="Ej: Solicitud de la clienta / Imprevisto de horario"
                    className="text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="notifyClientCancel"
                    name="notifyClient"
                    defaultChecked
                    className="rounded border-border text-destructive focus:ring-destructive"
                  />
                  <Label htmlFor="notifyClientCancel" className="text-xs cursor-pointer text-foreground">
                    Enviar notificación de cancelación por email a la clienta y al admin (Resend)
                  </Label>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={isSubmitting || a.status === "cancelled"}
                  >
                    <XCircle className="w-4 h-4 mr-1.5" />
                    {isSubmitting
                      ? "Cancelando..."
                      : a.status === "cancelled"
                      ? "Cita ya Cancelada"
                      : "Confirmar Cancelación"}
                  </Button>
                </div>
              </form>

              {/* Hard delete option */}
              <div className="border-t pt-4 mt-6">
                <form
                  action={async () => {
                    if (confirm("¿Estás seguro de que deseas eliminar permanentemente este registro de cita?")) {
                      await actionDeleteAppointment(a.id);
                    }
                  }}
                >
                  <button
                    type="submit"
                    className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar registro definitivamente
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
