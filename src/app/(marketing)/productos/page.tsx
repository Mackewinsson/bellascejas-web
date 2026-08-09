import { PageHero } from "@/components/site/PageHero";
import { CtaButton } from "@/components/site/CtaButton";
import { MarkdownBody } from "@/components/site/MarkdownBody";
import { readContent } from "@/lib/content";
import { SITE } from "@/lib/site";

export const metadata = { title: "Productos" };

export default function ProductosPage() {
  const doc = readContent("productos.md");

  return (
    <>
      <PageHero title="Productos" lead="Catalogo en preparacion." />
      <section className="section">
        <div className="container">
          <MarkdownBody markdown={doc.body} />
          <div className="btn-row" style={{ marginTop: "1.5rem" }}>
            <CtaButton href={SITE.whatsappApi} external>
              Preguntar por WhatsApp
            </CtaButton>
            <CtaButton href="/servicios/miami" variant="ghost">
              Ver servicios
            </CtaButton>
          </div>
        </div>
      </section>
    </>
  );
}
