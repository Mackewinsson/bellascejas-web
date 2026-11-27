import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { CtaButton } from "@/components/site/CtaButton";
import { SITE } from "@/lib/site";

export const metadata = { title: "Reserva confirmada" };

export default async function ReservarExitoPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  return (
    <>
      <PageHero
        title="¡Listo!"
        lead="Tu cita quedó registrada con éxito. Te hemos enviado un correo de confirmación con todos los detalles."
      />
      <section className="section">
        <div className="container stub">
          {id ? <p>Referencia: <code>{id}</code></p> : null}
          <p>
            Dirección: {SITE.miami.address} ({SITE.miami.suites}). Si necesitas cambiar la cita, escríbenos
            por WhatsApp con al menos 48 horas de anticipación.
          </p>
          <div className="btn-row">
            <CtaButton href={SITE.whatsappUrl} external>
              WhatsApp
            </CtaButton>
            <CtaButton href="/" variant="ghost">
              Volver al inicio
            </CtaButton>
            <Link className="btn btn--ghost" href="/reservar">
              Otra reserva
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
