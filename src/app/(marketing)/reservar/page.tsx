import { Suspense } from "react";
import { PageHero } from "@/components/site/PageHero";
import { BookingWizard } from "@/components/site/BookingWizard";
import { listActiveServices, listActiveStaff } from "@/lib/booking/queries";
import { hasDatabase } from "@/lib/db";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Reservar cita",
};

export const dynamic = "force-dynamic";

export default async function ReservarPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const sp = await searchParams;

  if (!hasDatabase()) {
    return (
      <>
        <PageHero
          title="Reservar"
          lead="El sistema de citas aún no está configurado."
        />
        <section className="section">
          <div className="container stub">
            <p>Configura NEON_DATABASE_URL y ejecuta el seed.</p>
            <a className="btn btn--primary" href={SITE.whatsappUrl}>
              WhatsApp
            </a>
          </div>
        </section>
      </>
    );
  }

  const [services, staff] = await Promise.all([
    listActiveServices(),
    listActiveStaff(),
  ]);

  return (
    <>
      <PageHero
        title="Reservar cita"
        lead="Miami — Elige servicio, horario y confirma. Pagas en el salón."
      />
      <section className="section">
        <div className="container">
          <Suspense fallback={<p>Cargando…</p>}>
            <BookingWizard
              services={services}
              staff={staff}
              initialSlug={sp.service}
            />
          </Suspense>
        </div>
      </section>
    </>
  );
}
