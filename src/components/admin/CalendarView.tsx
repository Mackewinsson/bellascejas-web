"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { formatUsd, type AppointmentStatus, type AppointmentWithJoins, type Staff } from "@/lib/booking/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  List,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Phone,
  Mail,
  Plus,
  MessageCircle,
  ExternalLink,
} from "lucide-react";

type Props = {
  initialDate: string; // YYYY-MM-DD
  appointments: AppointmentWithJoins[];
  staff: Staff[];
};

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const WEEKDAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function getStatusBadge(status: AppointmentStatus) {
  switch (status) {
    case "confirmed":
      return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white border-0">Confirmada</Badge>;
    case "pending":
      return <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0">Pendiente</Badge>;
    case "completed":
      return <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-0">Completada</Badge>;
    case "cancelled":
      return <Badge variant="outline" className="text-muted-foreground border-destructive/40 text-destructive">Cancelada</Badge>;
    case "no_show":
      return <Badge variant="secondary">No show</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function formatMiamiTime(isoString: string) {
  return new Intl.DateTimeFormat("es-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(isoString));
}

function getMiamiYmd(isoString: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(isoString));
}

export function CalendarView({ initialDate, appointments, staff }: Props) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [selectedStaff, setSelectedStaff] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Current year & month being viewed in calendar
  const [viewYear, setViewYear] = useState(() => Number(initialDate.split("-")[0]));
  const [viewMonth, setViewMonth] = useState(() => Number(initialDate.split("-")[1]) - 1); // 0-indexed

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      if (selectedStaff !== "all" && a.staff_id !== selectedStaff) return false;
      if (selectedStatus !== "all" && a.status !== selectedStatus) return false;
      return true;
    });
  }, [appointments, selectedStaff, selectedStatus]);

  // Map appointments count by date YYYY-MM-DD
  const apptsByDate = useMemo(() => {
    const map = new Map<string, AppointmentWithJoins[]>();
    for (const a of filteredAppointments) {
      const ymd = getMiamiYmd(a.starts_at);
      const list = map.get(ymd) || [];
      list.push(a);
      map.set(ymd, list);
    }
    return map;
  }, [filteredAppointments]);

  // Appointments for currently selected day
  const dayAppointments = useMemo(() => {
    const list = apptsByDate.get(selectedDate) || [];
    return [...list].sort(
      (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
    );
  }, [apptsByDate, selectedDate]);

  // Calendar matrix computation
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Monday = 0
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    const now = new Date();
    const ymd = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
    setSelectedDate(ymd);
    setViewYear(Number(ymd.split("-")[0]));
    setViewMonth(Number(ymd.split("-")[1]) - 1);
  };

  const formattedSelectedDate = useMemo(() => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(dateObj);
  }, [selectedDate]);

  return (
    <div className="space-y-6">
      {/* Top Header & View Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>📅</span> Calendario de Citas
          </h1>
          <p className="text-sm text-muted-foreground">
            Agenda interactiva de clientas Bellas Cejas en Miami (horario este).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border bg-card p-1 shadow-xs">
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                viewMode === "calendar"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Calendario
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Lista
            </button>
          </div>

          <Button asChild size="sm">
            <Link href={`/admin/citas/nueva?date=${selectedDate}`}>
              <Plus className="w-4 h-4 mr-1" />
              Nueva Cita
            </Link>
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-card border rounded-lg p-3 text-sm shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Staff:</span>
          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="border rounded-md h-8 px-2.5 text-xs bg-background"
          >
            <option value="all">Todas las especialistas</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Estado:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border rounded-md h-8 px-2.5 text-xs bg-background"
          >
            <option value="all">Todos los estados</option>
            <option value="confirmed">Confirmadas</option>
            <option value="pending">Pendientes</option>
            <option value="completed">Completadas</option>
            <option value="cancelled">Canceladas</option>
            <option value="no_show">No show</option>
          </select>
        </div>

        <div className="ml-auto text-xs text-muted-foreground">
          {filteredAppointments.length} citas registradas
        </div>
      </div>

      {viewMode === "calendar" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Calendar Grid (7 cols on desktop) */}
          <div className="lg:col-span-7 bg-card border rounded-xl p-4 shadow-xs">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground capitalize">
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </h2>
                <Button variant="outline" size="sm" onClick={handleToday} className="h-7 text-xs">
                  Hoy
                </Button>
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {WEEKDAY_NAMES.map((name) => (
                <div key={name} className="text-xs font-medium text-muted-foreground py-1">
                  {name}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Prev month days */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => {
                const dayNum = prevMonthDays - firstDayOfWeek + i + 1;
                return (
                  <div
                    key={`prev-${i}`}
                    className="min-h-[64px] p-1.5 rounded-lg border border-transparent text-muted-foreground/40 text-xs select-none bg-muted/20"
                  >
                    <span>{dayNum}</span>
                  </div>
                );
              })}

              {/* Current month days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const mStr = String(viewMonth + 1).padStart(2, "0");
                const dStr = String(dayNum).padStart(2, "0");
                const ymd = `${viewYear}-${mStr}-${dStr}`;
                const isSelected = selectedDate === ymd;
                const appts = apptsByDate.get(ymd) || [];
                const count = appts.length;

                return (
                  <div
                    key={ymd}
                    onClick={() => setSelectedDate(ymd)}
                    className={`min-h-[70px] p-1.5 rounded-lg border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary font-semibold"
                        : "border-border hover:border-primary/50 hover:bg-accent/40 bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                          isSelected
                            ? "bg-primary text-primary-foreground font-bold"
                            : "text-foreground"
                        }`}
                      >
                        {dayNum}
                      </span>
                      {count > 0 && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" title={`${count} citas`} />
                      )}
                    </div>

                    {count > 0 ? (
                      <div className="mt-1">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-secondary text-secondary-foreground font-medium truncate w-full text-center">
                          {count} {count === 1 ? "cita" : "citas"}
                        </span>
                      </div>
                    ) : (
                      <div className="h-4" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Day Agenda Detail (5 cols on desktop) */}
          <div className="lg:col-span-5 bg-card border rounded-xl p-5 shadow-xs flex flex-col">
            <div className="flex items-start justify-between border-b pb-4 mb-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Citas del día
                </span>
                <h3 className="text-lg font-bold text-foreground capitalize mt-0.5">
                  {formattedSelectedDate}
                </h3>
              </div>
              <Badge variant="secondary" className="text-xs">
                {dayAppointments.length} {dayAppointments.length === 1 ? "cita" : "citas"}
              </Badge>
            </div>

            {dayAppointments.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-10 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3 text-xl">
                  📅
                </div>
                <h4 className="font-semibold text-sm text-foreground">No hay citas para este día</h4>
                <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-4">
                  El horario está disponible para agendar clientas o registrar consultas manuales.
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/citas/nueva?date=${selectedDate}`}>
                    <Plus className="w-4 h-4 mr-1" />
                    Agendar cita para este día
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {dayAppointments.map((a) => {
                  const startTime = formatMiamiTime(a.starts_at);
                  const endTime = formatMiamiTime(a.ends_at);
                  const cleanPhone = (a.client_phone || "").replace(/[^0-9]/g, "");

                  return (
                    <div
                      key={a.id}
                      className="border rounded-lg p-3.5 bg-background/50 hover:bg-background transition-colors space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {startTime} - {endTime}
                          </span>
                        </div>
                        {getStatusBadge(a.status)}
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                          {a.client_name}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                          {a.service_title}
                        </p>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {a.staff_name} · {a.service_duration_mins} min · {formatUsd(a.service_price_cents)}
                        </div>
                      </div>

                      {/* Contact Info & Direct Links */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 border-t text-xs text-muted-foreground">
                        {a.client_phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            <span>{a.client_phone}</span>
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/${cleanPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-emerald-600 hover:text-emerald-700 ml-1"
                                title="Abrir WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        )}

                        {a.client_email && (
                          <div className="flex items-center gap-1 truncate max-w-[180px]">
                            <Mail className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span className="truncate">{a.client_email}</span>
                          </div>
                        )}
                      </div>

                      {a.notes && (
                        <p className="text-[11px] bg-muted/40 p-2 rounded text-muted-foreground italic">
                          &ldquo;{a.notes}&rdquo;
                        </p>
                      )}

                      <div className="flex justify-end pt-1">
                        <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                          <Link href={`/admin/citas/${a.id}`}>
                            Ver detalle / Editar
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-card border rounded-xl overflow-hidden shadow-xs">
          {filteredAppointments.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No hay citas que coincidan con los filtros aplicados.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredAppointments.map((a) => {
                const dateStr = getMiamiYmd(a.starts_at);
                const timeStr = formatMiamiTime(a.starts_at);

                return (
                  <Link
                    key={a.id}
                    href={`/admin/citas/${a.id}`}
                    className="flex flex-wrap items-center justify-between gap-4 p-4 hover:bg-accent/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {dateStr} a las {timeStr}
                        </span>
                        <span className="text-muted-foreground text-xs">·</span>
                        <span className="font-medium text-sm text-foreground">{a.client_name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                        <span>{a.service_title}</span>
                        <span>·</span>
                        <span>{a.staff_name}</span>
                        <span>·</span>
                        <span>{formatUsd(a.service_price_cents)}</span>
                        {a.client_phone && (
                          <>
                            <span>·</span>
                            <span>{a.client_phone}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(a.status)}
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
