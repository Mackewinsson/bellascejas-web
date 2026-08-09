import { redirect } from "next/navigation";
import Link from "next/link";
import { listActiveServices, listActiveStaff } from "@/lib/booking/queries";
import { actionCreateAppointment } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

export default async function AdminNuevaCitaPage() {
  const [services, staff] = await Promise.all([
    listActiveServices(),
    listActiveStaff(),
  ]);

  async function create(formData: FormData) {
    "use server";
    const id = await actionCreateAppointment(formData);
    redirect(`/admin/citas/${id}`);
  }

  return (
    <div className="space-y-4 max-w-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Nueva cita</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/citas">Volver</Link>
        </Button>
      </div>

      <form action={create} className="space-y-3 border rounded-md bg-card p-4">
        <div className="space-y-1">
          <Label htmlFor="serviceId">Servicio</Label>
          <select
            id="serviceId"
            name="serviceId"
            required
            className="w-full border rounded-md h-9 px-2 text-sm"
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="staffId">Staff</Label>
          <select
            id="staffId"
            name="staffId"
            required
            className="w-full border rounded-md h-9 px-2 text-sm"
          >
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="startsAt">Inicio (hora Miami)</Label>
          <Input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            required
          />
          <p className="text-xs text-muted-foreground">
            Se interpreta como hora de Miami (America/New_York). Preferible usar
            el flujo público /reservar para slots exactos.
          </p>
        </div>
        <div className="space-y-1">
          <Label htmlFor="clientName">Cliente</Label>
          <Input id="clientName" name="clientName" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="clientEmail">Email</Label>
          <Input id="clientEmail" name="clientEmail" type="email" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="clientPhone">Teléfono</Label>
          <Input id="clientPhone" name="clientPhone" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="notes">Notas</Label>
          <Input id="notes" name="notes" />
        </div>
        <Button type="submit">Crear</Button>
      </form>
    </div>
  );
}
