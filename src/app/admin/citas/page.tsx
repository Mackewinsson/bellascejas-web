import Link from "next/link";
import { listAppointmentsInRange, listActiveStaff } from "@/lib/booking/queries";
import { formatInMiami, miamiLocalToUtcIso } from "@/lib/booking/slots";
import { formatUsd } from "@/lib/booking/types";
import { hasDatabase } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

function miamiYmd(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function nextYmd(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}

export default async function AdminCitasPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; status?: string; staffId?: string }>;
}) {
  const sp = await searchParams;
  if (!hasDatabase()) {
    return (
      <p className="text-sm text-muted-foreground">Configura NEON_DATABASE_URL.</p>
    );
  }

  const date = sp.date || miamiYmd();
  const status = (sp.status || "all") as
    | "all"
    | "confirmed"
    | "cancelled"
    | "completed"
    | "pending"
    | "no_show";
  const staffId = sp.staffId || undefined;

  const fromIso = miamiLocalToUtcIso(date, "00:00");
  const toIso = miamiLocalToUtcIso(nextYmd(date), "00:00");

  const [appts, staff] = await Promise.all([
    listAppointmentsInRange(fromIso, toIso, { staffId, status }),
    listActiveStaff(),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Citas</h1>
          <p className="text-sm text-muted-foreground">Agenda Miami</p>
        </div>
        <Button asChild>
          <Link href="/admin/citas/nueva">Nueva cita</Link>
        </Button>
      </div>

      <form
        method="get"
        className="flex flex-wrap gap-2 items-end bg-card border rounded-md p-3"
      >
        <label className="text-sm grid gap-1">
          Fecha
          <input
            type="date"
            name="date"
            defaultValue={date}
            className="border rounded-md h-9 px-2 text-sm"
          />
        </label>
        <label className="text-sm grid gap-1">
          Estado
          <select
            name="status"
            defaultValue={status}
            className="border rounded-md h-9 px-2 text-sm"
          >
            <option value="all">Todos</option>
            <option value="confirmed">Confirmadas</option>
            <option value="pending">Pendientes</option>
            <option value="cancelled">Canceladas</option>
            <option value="completed">Completadas</option>
            <option value="no_show">No show</option>
          </select>
        </label>
        <label className="text-sm grid gap-1">
          Staff
          <select
            name="staffId"
            defaultValue={staffId || ""}
            className="border rounded-md h-9 px-2 text-sm"
          >
            <option value="">Todos</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" variant="secondary">
          Filtrar
        </Button>
      </form>

      <div className="border rounded-md divide-y bg-card">
        {appts.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            No hay citas este día.
          </p>
        ) : (
          appts.map((a) => (
            <Link
              key={a.id}
              href={`/admin/citas/${a.id}`}
              className="flex flex-wrap items-center justify-between gap-2 p-3 hover:bg-accent/40"
            >
              <div>
                <div className="font-medium text-sm">
                  {formatInMiami(a.starts_at, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}{" "}
                  · {a.client_name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {a.service_title} · {a.staff_name} ·{" "}
                  {formatUsd(a.service_price_cents)}
                </div>
              </div>
              <Badge variant="outline">{a.status}</Badge>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
