import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { CtaButton } from "@/components/site/CtaButton";
import { MarkdownBody } from "@/components/site/MarkdownBody";
import { readContent } from "@/lib/content";
import { NAV, SITE } from "@/lib/site";

export const metadata = {
  title: "Servicios en Miami",
};

export default function MiamiServicesPage() {
  const doc = readContent("servicios-miami/index.md");
  const services =
    NAV.find((n) => n.href === "/servicios/miami")?.children ?? [];

  return (
    <>
      <PageHero
        title="Servicios en Miami, FL"
        lead="Cejas, micropigmentación, faciales, pestañas y más. Reserva online."
      />
      <section className="section">
        <div className="container">
          <div className="btn-row" style={{ marginBottom: "2rem" }}>
            <CtaButton href={SITE.bookingUrl}>
              Reservar cita
            </CtaButton>
            <CtaButton href="/servicios/miami/precios" variant="ghost">
              Ver precios
            </CtaButton>
            <CtaButton href="/servicios/santiago" variant="ghost">
              Ver Santiago, Chile
            </CtaButton>
          </div>
          <div className="service-list">
            {services.map((s) => (
              <Link key={s.href} href={s.href}>
                {s.label}
                <span>Ver</span>
              </Link>
            ))}
            <Link href="/servicios/miami/precios">
              Precios
              <span>Ver</span>
            </Link>
          </div>
          <div style={{ marginTop: "2.5rem" }}>
            <MarkdownBody markdown={doc.body} />
          </div>
        </div>
      </section>
    </>
  );
}
