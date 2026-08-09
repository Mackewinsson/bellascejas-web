import Link from "next/link";
import { notFound } from "next/navigation";
import { getAppointmentById } from "@/lib/booking/queries";
import { formatInMiami } from "@/lib/booking/slots";
import { formatUsd, type AppointmentStatus } from "@/lib/booking/types";
import {
  actionResendEmail,
  actionUpdateAppointmentStatus,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const STATUSES: { status: AppointmentStatus; label: string; variant?: "destructive" | "secondary" | "outline" }[] = [
  { status: "confirmed", label: "Confirmar", variant: "secondary" },
  { status: "completed", label: "Completada", variant: "secondary" },
  { status: "no_show", label: "No show", variant: "outline" },
  { status: "cancelled", label: "Cancelar", variant: "destructive" },
];

export default async function AdminCitaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const appt = await getAppointmentById(id);
  if (!appt) notFound();

  async function updateStatus(formData: FormData) {
    "use server";
    const status = String(formData.get("status")) as AppointmentStatus;
    await actionUpdateAppointmentStatus(id, status);
  }

  async function resend() {
    "use server";
    await actionResendEmail(id);
  }

  return (
    <div className="space-y-4 max-w-xl">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Cita</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/citas">Volver</Link>
        </Button>
      </div>

      <div className="border rounded-md bg-card p-4 space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Badge>{appt.status}</Badge>
          <span className="text-muted-foreground text-xs">{appt.id}</span>
        </div>
        <p>
          <strong>Cuando:</strong>{" "}
          {formatInMiami(appt.starts_at, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
        <p>
          <strong>Servicio:</strong> {appt.service_title} (
          {appt.service_duration_mins} min · {formatUsd(appt.service_price_cents)})
        </p>
        <p>
          <strong>Staff:</strong> {appt.staff_name}
        </p>
        <p>
          <strong>Cliente:</strong> {appt.client_name}
        </p>
        <p>
          <strong>Email:</strong> {appt.client_email}
        </p>
        <p>
          <strong>Tel:</strong> {appt.client_phone || "—"}
        </p>
        <p>
          <strong>Notas:</strong> {appt.notes || "—"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <form key={s.status} action={updateStatus}>
            <input type="hidden" name="status" value={s.status} />
            <Button type="submit" size="sm" variant={s.variant || "secondary"}>
              {s.label}
            </Button>
          </form>
        ))}
        <form action={resend}>
          <Button type="submit" size="sm" variant="outline">
            Reenviar email
          </Button>
        </form>
      </div>
    </div>
  );
}
