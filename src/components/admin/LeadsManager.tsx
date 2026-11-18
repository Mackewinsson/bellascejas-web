"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Lead, LeadStatus, LeadSource } from "@/lib/leads/types";
import { actionCreateLead, actionUpdateLeadStatus } from "@/app/admin/leads/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  UserPlus,
  Search,
  Mail,
  Phone,
  MessageCircle,
  Calendar,
  Sparkles,
  ExternalLink,
  Filter,
  X,
} from "lucide-react";

type Props = {
  initialLeads: Lead[];
};

function getSourceBadge(source: LeadSource) {
  switch (source) {
    case "reserva":
      return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">📅 Cita / Reserva</span>;
    case "contacto_web":
      return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">🌐 Web Contacto</span>;
    case "instagram":
      return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">📸 Instagram</span>;
    case "whatsapp":
      return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">💬 WhatsApp</span>;
    case "manual":
    default:
      return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-700 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">✍️ Manual</span>;
  }
}

export function LeadsManager({ initialLeads }: Props) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [isCreating, setIsCreating] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Metrics
  const metrics = useMemo(() => {
    const total = leads.length;
    const nuevos = leads.filter((l) => l.status === "nuevo").length;
    const clientes = leads.filter((l) => l.status === "cliente" || (l.appointments_count || 0) > 0).length;
    const interesados = leads.filter((l) => l.status === "interesado" || l.status === "contactado").length;
    return { total, nuevos, clientes, interesados };
  }, [leads]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (sourceFilter !== "all" && l.source !== sourceFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = l.name.toLowerCase().includes(q);
        const matchEmail = l.email.toLowerCase().includes(q);
        const matchPhone = l.phone.toLowerCase().includes(q);
        const matchNotes = l.notes.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone && !matchNotes) return false;
      }
      return true;
    });
  }, [leads, search, statusFilter, sourceFilter]);

  const handleCreateLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      const id = await actionCreateLead(formData);
      const newLead: Lead = {
        id,
        name: String(formData.get("name")),
        email: String(formData.get("email")).toLowerCase(),
        phone: String(formData.get("phone") || ""),
        source: (formData.get("source") || "manual") as LeadSource,
        status: (formData.get("status") || "nuevo") as LeadStatus,
        notes: String(formData.get("notes") || ""),
        appointments_count: 0,
        last_appointment_date: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setLeads((prev) => [newLead, ...prev]);
      setIsCreating(false);
    } catch (err) {
      alert("Error al registrar lead: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (id: string, newStatus: LeadStatus) => {
    try {
      await actionUpdateLeadStatus(id, newStatus);
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: newStatus, updated_at: new Date().toISOString() } : l))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>👥</span> Leads y Contactos
          </h1>
          <p className="text-sm text-muted-foreground">
            Base de datos unificada de clientas, reservas y prospectos de Bellas Cejas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/promociones">
              <Sparkles className="w-4 h-4 mr-1 text-[#A85A68]" />
              Enviar Promoción por Email
            </Link>
          </Button>

          <Button size="sm" onClick={() => setIsCreating(true)}>
            <UserPlus className="w-4 h-4 mr-1" />
            Nuevo Lead
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Contactos
          </span>
          <div className="text-2xl font-bold text-foreground mt-1">{metrics.total}</div>
          <span className="text-xs text-muted-foreground">Registros en el sistema</span>
        </div>

        <div className="bg-card border rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            Clientas Activas
          </span>
          <div className="text-2xl font-bold text-foreground mt-1">{metrics.clientes}</div>
          <span className="text-xs text-muted-foreground">Con citas registradas</span>
        </div>

        <div className="bg-card border rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
            Nuevos Leads
          </span>
          <div className="text-2xl font-bold text-foreground mt-1">{metrics.nuevos}</div>
          <span className="text-xs text-muted-foreground">Pendientes de contacto</span>
        </div>

        <div className="bg-card border rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
            En Seguimiento
          </span>
          <div className="text-2xl font-bold text-foreground mt-1">{metrics.interesados}</div>
          <span className="text-xs text-muted-foreground">Interesadas en servicios</span>
        </div>
      </div>

      {/* New Lead Drawer / Modal */}
      {isCreating && (
        <div className="bg-card border-2 border-primary/30 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-primary" />
              Registrar Nuevo Lead / Contacto
            </h3>
            <button
              onClick={() => setIsCreating(false)}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreateLead} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="name">Nombre y Apellido *</Label>
              <Input id="name" name="name" placeholder="Ej: Valentina Morales" required />
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Correo Electrónico *</Label>
              <Input id="email" name="email" type="email" placeholder="cliente@ejemplo.com" required />
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone">Teléfono / WhatsApp</Label>
              <Input id="phone" name="phone" placeholder="+1 786-000-0000" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="source">Origen</Label>
                <select id="source" name="source" defaultValue="manual" className="w-full border rounded-md h-9 px-2 text-sm bg-background">
                  <option value="manual">Manual / Salón</option>
                  <option value="contacto_web">Formulario Web</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="instagram">Instagram</option>
                  <option value="reserva">Reserva Cita</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="status">Estado Inicial</Label>
                <select id="status" name="status" defaultValue="nuevo" className="w-full border rounded-md h-9 px-2 text-sm bg-background">
                  <option value="nuevo">Nuevo</option>
                  <option value="contactado">Contactado</option>
                  <option value="interesado">Interesado</option>
                  <option value="cliente">Cliente</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="notes">Notas o Comentarios</Label>
              <Input id="notes" name="notes" placeholder="Ej: Preguntó por precios de microblading o retoques" />
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={formSubmitting}>
                {formSubmitting ? "Guardando..." : "Guardar Contacto"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card border rounded-xl p-3 shadow-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-muted-foreground ml-1 shrink-0" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email o teléfono..."
            className="h-9 border-0 bg-transparent focus-visible:ring-0 shadow-none text-sm"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground text-xs pr-1">
              Limpiar
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="w-3.5 h-3.5" />
            <span>Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-md h-8 px-2 text-xs bg-background"
            >
              <option value="all">Todos</option>
              <option value="nuevo">Nuevos</option>
              <option value="contactado">Contactados</option>
              <option value="interesado">Interesados</option>
              <option value="cliente">Clientes</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Origen:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="border rounded-md h-8 px-2 text-xs bg-background"
            >
              <option value="all">Todos los orígenes</option>
              <option value="reserva">Cita / Reserva</option>
              <option value="contacto_web">Web Contacto</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="manual">Manual</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-xs">
        {filteredLeads.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="font-semibold text-sm text-foreground">No se encontraron leads</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
              {search || statusFilter !== "all" || sourceFilter !== "all"
                ? "Prueba cambiando o limpiando los filtros de búsqueda."
                : "Aún no tienes leads registrados. Puedes registrar uno manualmente o esperar consultas de clientas."}
            </p>
            <Button size="sm" onClick={() => setIsCreating(true)}>
              <UserPlus className="w-4 h-4 mr-1" />
              Crear primer lead
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/30 border-b text-xs uppercase text-muted-foreground font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4">Canales</th>
                  <th className="py-3 px-4">Origen</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Historial Citas</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLeads.map((lead) => {
                  const initials = lead.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  const cleanPhone = (lead.phone || "").replace(/[^0-9]/g, "");

                  return (
                    <tr key={lead.id} className="hover:bg-accent/40 transition-colors">
                      {/* Name & Initials */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#A85A68]/15 text-[#A85A68] font-bold flex items-center justify-center text-xs shrink-0">
                            {initials || "BC"}
                          </div>
                          <div>
                            <Link
                              href={`/admin/leads/${lead.id}`}
                              className="font-semibold text-foreground hover:text-[#A85A68] hover:underline transition-colors block"
                            >
                              {lead.name}
                            </Link>
                            {lead.notes && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]" title={lead.notes}>
                                {lead.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Channels (Email & Phone) */}
                      <td className="py-3.5 px-4 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-foreground truncate max-w-[200px]">
                            <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <a href={`mailto:${lead.email}`} className="hover:underline truncate">
                              {lead.email}
                            </a>
                          </div>

                          {lead.phone ? (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Phone className="w-3.5 h-3.5 shrink-0" />
                              <span>{lead.phone}</span>
                              {cleanPhone && (
                                <a
                                  href={`https://wa.me/${cleanPhone}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 hover:text-emerald-700 ml-1 inline-flex items-center"
                                  title="Enviar WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground/60 italic text-[11px]">Sin teléfono</span>
                          )}
                        </div>
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-4">
                        {getSourceBadge(lead.source)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={lead.status}
                            onChange={(e) => handleQuickStatusChange(lead.id, e.target.value as LeadStatus)}
                            className="text-xs border rounded-md px-2 py-1 bg-background"
                          >
                            <option value="nuevo">Nuevo</option>
                            <option value="contactado">Contactado</option>
                            <option value="interesado">Interesado</option>
                            <option value="cliente">Cliente</option>
                            <option value="inactivo">Inactivo</option>
                          </select>
                        </div>
                      </td>

                      {/* Appointments count */}
                      <td className="py-3.5 px-4 text-xs">
                        {(lead.appointments_count || 0) > 0 ? (
                          <div className="flex items-center gap-1.5 font-medium text-emerald-700">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{lead.appointments_count} {lead.appointments_count === 1 ? "cita" : "citas"}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">Sin citas aún</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button asChild size="sm" variant="ghost" className="h-8 text-xs">
                            <Link href={`/admin/promociones?leadId=${lead.id}&email=${encodeURIComponent(lead.email)}`}>
                              <Sparkles className="w-3.5 h-3.5 mr-1 text-[#A85A68]" />
                              Promo
                            </Link>
                          </Button>

                          <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                            <Link href={`/admin/leads/${lead.id}`}>
                              Detalle
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
