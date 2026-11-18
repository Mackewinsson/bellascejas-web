import { listAllServices, getPublicImages } from "@/lib/booking/queries";
import { ServicesManager } from "@/components/admin/ServicesManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gestión de Servicios | Bellascejas Admin",
};

export default async function AdminServiciosPage() {
  const [services, availableImages] = await Promise.all([
    listAllServices(),
    Promise.resolve(getPublicImages()),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Catálogo de Servicios</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Edita el título, descripción, precio, categoría, estado e imagen
          asociada (tomada de la carpeta <code className="text-xs bg-muted px-1 py-0.5 rounded">/public/images</code>).
          Cualquier cambio se refleja inmediatamente en la Landing Page y en el flujo de reserva.
        </p>
      </div>

      <ServicesManager
        services={services}
        availableImages={availableImages}
      />
    </div>
  );
}
