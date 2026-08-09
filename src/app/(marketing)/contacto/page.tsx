import { PageHero } from "@/components/site/PageHero";
import { CtaButton } from "@/components/site/CtaButton";
import { MarkdownBody } from "@/components/site/MarkdownBody";
import { readContent } from "@/lib/content";
import { SITE } from "@/lib/site";

export const metadata = { title: "Contacto" };

export default function ContactoPage() {
  const doc = readContent("contacto.md");

  return (
    <>
      <PageHero
        title="Contacto"
        lead="Andrea Palencia, community manager de Bellascejas."
      />
      <section className="section">
        <div className="container">
          <div className="btn-row" style={{ marginBottom: "1.75rem" }}>
            <CtaButton href={SITE.bookingUrl}>
              Reservar
            </CtaButton>
            <CtaButton href={SITE.whatsappUrl} external variant="ghost">
              WhatsApp
            </CtaButton>
          </div>
          <MarkdownBody markdown={doc.body} />
          <div className="contact-block" style={{ marginTop: "2.5rem" }}>
            <h2>Santiago, Chile</h2>
            <p>{SITE.santiago.address}</p>
            <p>{SITE.santiago.hours.join(" · ")}</p>
            <p>
              <a href={SITE.santiago.whatsappUrl}>{SITE.santiago.phoneDisplay}</a>
            </p>
            <p style={{ marginTop: "0.75rem" }}>
              <a href="/servicios/santiago">Ver servicios en Santiago</a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
