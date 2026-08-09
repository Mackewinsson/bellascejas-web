import { listAllServices } from "@/lib/booking/queries";
import { formatUsd } from "@/lib/booking/types";
import { actionUpdateService } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

export default async function AdminServiciosPage() {
  const services = await listAllServices();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Servicios</h1>
        <p className="text-sm text-muted-foreground">
          Precio, duración y visibilidad en /reservar
        </p>
      </div>

      <div className="space-y-4">
        {services.map((s) => (
          <form
            key={s.id}
            action={actionUpdateService}
            className="border rounded-md bg-card p-3 grid gap-2 md:grid-cols-2"
          >
            <input type="hidden" name="id" value={s.id} />
            <div className="space-y-1 md:col-span-2">
              <Label>Título</Label>
              <Input name="title" defaultValue={s.title} />
            </div>
            <div className="space-y-1">
              <Label>Categoría</Label>
              <Input name="category" defaultValue={s.category} />
            </div>
            <div className="space-y-1">
              <Label>Duración (min)</Label>
              <Input
                name="durationMins"
                type="number"
                defaultValue={s.duration_mins}
              />
            </div>
            <div className="space-y-1">
              <Label>Precio USD</Label>
              <Input
                name="priceUsd"
                type="number"
                step="1"
                defaultValue={Math.round(s.price_cents / 100)}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                id={`active-${s.id}`}
                type="checkbox"
                name="active"
                defaultChecked={s.active}
              />
              <Label htmlFor={`active-${s.id}`}>Activo en reserva</Label>
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Descripción</Label>
              <Input name="description" defaultValue={s.description} />
            </div>
            <div className="md:col-span-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Actual: {formatUsd(s.price_cents)} · /{s.slug}
              </span>
              <Button type="submit" size="sm">
                Guardar
              </Button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
