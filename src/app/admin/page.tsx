import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasDatabase } from "@/lib/db";
import { listAppointmentsInRange } from "@/lib/booking/queries";
import { miamiLocalToUtcIso } from "@/lib/booking/slots";
import { listLeads } from "@/lib/leads/queries";
import { listCampaignHistory } from "@/lib/email/promotions";
import {
  Calendar,
  Users,
  Sparkles,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

function miamiYmd() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function nextYmd(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}

export default async function AdminDashboardPage() {
  const date = miamiYmd();
  const [appts, leads, campaigns] = await Promise.all([
    listAppointmentsInRange(
      miamiLocalToUtcIso(date, "00:00"),
      miamiLocalToUtcIso(nextYmd(date), "00:00"),
      { status: "all" }
    ),
    listLeads(),
    listCampaignHistory(),
  ]);

  const todayCount = appts.filter((a) => a.status !== "cancelled").length;
  const newLeadsCount = leads.filter((l) => l.status === "nuevo").length;

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Back Office Bellas Cejas
          </h1>
          <p className="text-sm text-muted-foreground">
            Panel de control integral: Citas, Leads, Promociones y Gestión.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1 text-xs border rounded-lg px-3 py-1.5 hover:bg-accent transition-colors"
          >
            <span>Ver Sitio Web</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </Link>
          <Link
            href="/reservar"
            target="_blank"
            className="inline-flex items-center gap-1 text-xs bg-primary text-primary-foreground rounded-lg px-3 py-1.5 hover:opacity-90 transition-opacity"
          >
            <span>Reservar Público</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/citas" className="group">
          <Card className="hover:border-primary/50 transition-all h-full">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs uppercase font-semibold text-muted-foreground">
                Citas Hoy
              </CardTitle>
              <Calendar className="w-4 h-4 text-[#A85A68]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{todayCount}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 group-hover:text-primary">
                Ver calendario de citas <ArrowRight className="w-3 h-3" />
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/leads" className="group">
          <Card className="hover:border-primary/50 transition-all h-full">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs uppercase font-semibold text-muted-foreground">
                Leads & Contactos
              </CardTitle>
              <Users className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{leads.length}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 group-hover:text-primary">
                {newLeadsCount} nuevos pendientes <ArrowRight className="w-3 h-3" />
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/promociones" className="group">
          <Card className="hover:border-primary/50 transition-all h-full">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs uppercase font-semibold text-muted-foreground">
                Campañas Email
              </CardTitle>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{campaigns.length}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 group-hover:text-primary">
                Crear nueva promoción <ArrowRight className="w-3 h-3" />
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card className="h-full">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs uppercase font-semibold text-muted-foreground">
              Base de Datos
            </CardTitle>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-foreground truncate">
              {hasDatabase() ? "Neon Postgres" : "Local / Demo"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {hasDatabase() ? "Conectado y sincronizado" : "Sin NEON_DATABASE_URL"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/citas"
          className="p-5 rounded-xl border bg-card hover:bg-accent/40 transition-colors space-y-2"
        >
          <div className="text-2xl">📅</div>
          <h3 className="font-semibold text-base text-foreground">Agenda & Calendario</h3>
          <p className="text-xs text-muted-foreground">
            Visualiza las citas ordenadas por día con vista mensual y timeline por horas.
          </p>
        </Link>

        <Link
          href="/admin/leads"
          className="p-5 rounded-xl border bg-card hover:bg-accent/40 transition-colors space-y-2"
        >
          <div className="text-2xl">👥</div>
          <h3 className="font-semibold text-base text-foreground">Gestión de Leads</h3>
          <p className="text-xs text-muted-foreground">
            Consulta datos de contacto de clientas, historial de citas y notas de seguimiento.
          </p>
        </Link>

        <Link
          href="/admin/promociones"
          className="p-5 rounded-xl border bg-card hover:bg-accent/40 transition-colors space-y-2"
        >
          <div className="text-2xl">💌</div>
          <h3 className="font-semibold text-base text-foreground">Promociones Corporativas</h3>
          <p className="text-xs text-muted-foreground">
            Envía ofertas preformateadas en HTML con la paleta de colores y estilo Bellas Cejas.
          </p>
        </Link>
      </div>
    </div>
  );
}
