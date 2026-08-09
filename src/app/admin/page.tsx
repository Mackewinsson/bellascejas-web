import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasDatabase } from "@/lib/db";
import { listAppointmentsInRange } from "@/lib/booking/queries";
import { miamiLocalToUtcIso } from "@/lib/booking/slots";

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
  let todayCount = 0;
  if (hasDatabase()) {
    const date = miamiYmd();
    const appts = await listAppointmentsInRange(
      miamiLocalToUtcIso(date, "00:00"),
      miamiLocalToUtcIso(nextYmd(date), "00:00"),
      { status: "all" }
    );
    todayCount = appts.filter((a) => a.status !== "cancelled").length;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bellas Cejas Admin</h1>
        <p className="text-sm text-muted-foreground">
          Citas, servicios y equipo — sin Setmore.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground">
              Citas hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground">
              Reservar público
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/reservar" className="text-sm underline">
              /reservar
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground">
              Neon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {hasDatabase() ? "Conectado" : "Sin NEON_DATABASE_URL"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link className="underline" href="/admin/citas">
          Ver citas
        </Link>
        <Link className="underline" href="/admin/servicios">
          Servicios
        </Link>
        <Link className="underline" href="/admin/equipo">
          Equipo
        </Link>
      </div>
    </div>
  );
}
