import { listAllStaff } from "@/lib/booking/queries";
import { actionUpsertStaff } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

export default async function AdminEquipoPage() {
  const staff = await listAllStaff();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Equipo</h1>
        <p className="text-sm text-muted-foreground">
          Profesionales disponibles para citas
        </p>
      </div>

      <div className="space-y-3">
        {staff.map((s) => (
          <form
            key={s.id}
            action={actionUpsertStaff}
            className="border rounded-md bg-card p-3 grid gap-2 md:grid-cols-2"
          >
            <input type="hidden" name="id" value={s.id} />
            <div className="space-y-1">
              <Label>Nombre</Label>
              <Input name="name" defaultValue={s.name} required />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input name="email" type="email" defaultValue={s.email || ""} />
            </div>
            <div className="space-y-1">
              <Label>Orden</Label>
              <Input
                name="sortOrder"
                type="number"
                defaultValue={s.sort_order}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                id={`staff-active-${s.id}`}
                type="checkbox"
                name="active"
                defaultChecked={s.active}
              />
              <Label htmlFor={`staff-active-${s.id}`}>Activo</Label>
            </div>
            <div className="md:col-span-2">
              <Button type="submit" size="sm">
                Guardar
              </Button>
            </div>
          </form>
        ))}
      </div>

      <form
        action={actionUpsertStaff}
        className="border rounded-md bg-card p-3 grid gap-2 md:grid-cols-2"
      >
        <h2 className="md:col-span-2 font-medium">Agregar profesional</h2>
        <div className="space-y-1">
          <Label>Nombre</Label>
          <Input name="name" required />
        </div>
        <div className="space-y-1">
          <Label>Email</Label>
          <Input name="email" type="email" />
        </div>
        <div className="space-y-1">
          <Label>Orden</Label>
          <Input name="sortOrder" type="number" defaultValue={10} />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input id="staff-active-new" type="checkbox" name="active" defaultChecked />
          <Label htmlFor="staff-active-new">Activo</Label>
        </div>
        <div className="md:col-span-2">
          <Button type="submit" size="sm">
            Crear
          </Button>
        </div>
      </form>
    </div>
  );
}
