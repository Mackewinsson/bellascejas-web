import Link from "next/link";
import { notFound } from "next/navigation";
import { getLeadById, getAppointmentsForEmail } from "@/lib/leads/queries";
import { actionUpdateLead, actionDeleteLead } from "@/app/admin/leads/actions";
import { formatUsd } from "@/lib/booking/types";
import { formatInMiami } from "@/lib/booking/slots";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Calendar,
  Sparkles,
  ArrowLeft,
  Trash2,
  Clock,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await getLeadById(id);
  if (!lead) notFound();

  const appointments = await getAppointmentsForEmail(lead.email);
  const cleanPhone = (lead.phone || "").replace(/[^0-9]/g, "");

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="h-9 w-9">
            <Link href="/admin/leads">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>{lead.name}</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Registrado el {new Date(lead.created_at).toLocaleDateString("es-ES")} · Origen: {lead.source}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {cleanPhone && (
            <Button asChild variant="outline" size="sm" className="text-emerald-700 border-emerald-300 hover:bg-emerald-50">
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-4 h-4 mr-1 text-emerald-600" />
                WhatsApp
              </a>
            </Button>
          )}

          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/promociones?leadId=${lead.id}&email=${encodeURIComponent(lead.email)}`}>
              <Sparkles className="w-4 h-4 mr-1 text-[#A85A68]" />
              Enviar Promoción
            </Link>
          </Button>

          <Button asChild size="sm">
            <Link href={`/admin/citas/nueva?clientName=${encodeURIComponent(lead.name)}&clientEmail=${encodeURIComponent(lead.email)}&clientPhone=${encodeURIComponent(lead.phone)}`}>
              <Calendar className="w-4 h-4 mr-1" />
              Nueva Cita
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Edit Form */}
        <div className="md:col-span-7 bg-card border rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-base font-semibold text-foreground border-b pb-2">
            Datos del Contacto
          </h2>

          <form action={actionUpdateLead} className="space-y-4">
            <input type="hidden" name="id" value={lead.id} />

            <div className="space-y-1">
              <Label htmlFor="name">Nombre y Apellidos</Label>
              <Input id="name" name="name" defaultValue={lead.name} required />
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" name="email" type="email" defaultValue={lead.email} required />
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone">Teléfono / WhatsApp</Label>
              <Input id="phone" name="phone" defaultValue={lead.phone} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="status">Estado del Lead</Label>
              <select
                id="status"
                name="status"
                defaultValue={lead.status}
                className="w-full border rounded-md h-9 px-3 text-sm bg-background"
              >
                <option value="nuevo">Nuevo</option>
                <option value="contactado">Contactado</option>
                <option value="interesado">Interesado</option>
                <option value="cliente">Cliente</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="notes">Notas y Seguimiento</Label>
              <textarea
                id="notes"
                name="notes"
                defaultValue={lead.notes}
                rows={4}
                className="w-full border rounded-md p-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Añade detalles sobre gustos, historial, consultas o preferencias de la clienta..."
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <Button type="submit">
                Guardar Cambios
              </Button>

              <form action={actionDeleteLead.bind(null, lead.id)}>
                <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Eliminar
                </Button>
              </form>
            </div>
          </form>
        </div>

        {/* Right Column: Appointments History */}
        <div className="md:col-span-5 bg-card border rounded-xl p-5 shadow-xs space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" />
              Historial de Citas
            </h2>
            <Badge variant="secondary">
              {appointments.length} {appointments.length === 1 ? "cita" : "citas"}
            </Badge>
          </div>

          {appointments.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <Calendar className="w-10 h-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-medium text-foreground">Sin citas agendadas</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                Esta clienta aún no tiene citas registradas en el sistema.
              </p>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto pr-1 max-h-[420px]">
              {appointments.map((a) => (
                <div
                  key={a.id}
                  className="border rounded-lg p-3 bg-muted/20 space-y-1.5 text-xs hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      {formatInMiami(a.starts_at, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {a.status}
                    </Badge>
                  </div>

                  <div className="font-medium text-foreground">
                    {a.service_title}
                  </div>

                  <div className="text-muted-foreground flex justify-between items-center">
                    <span>Especialista: {a.staff_name}</span>
                    <span className="font-semibold">{formatUsd(a.service_price_cents)}</span>
                  </div>

                  <div className="pt-1 text-right">
                    <Link
                      href={`/admin/citas/${a.id}`}
                      className="text-primary hover:underline inline-flex items-center gap-0.5 text-[11px]"
                    >
                      Ver cita <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
