import { PageHero } from "@/components/site/PageHero";
import { CtaButton } from "@/components/site/CtaButton";
import { MarkdownBody } from "@/components/site/MarkdownBody";
import { readContent } from "@/lib/content";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Servicios en Santiago, Chile",
};

export default function SantiagoPage() {
  const doc = readContent("servicios-santiago/index.md");

  return (
    <>
      <PageHero
        title="Servicios en Santiago, Chile"
        lead={`${SITE.santiago.address} · Máster Ingrid`}
      />
      <section className="section">
        <div className="container">
          <div className="btn-row" style={{ marginBottom: "1.75rem" }}>
            <CtaButton href={SITE.santiago.whatsappUrl} external>
              WhatsApp Chile
            </CtaButton>
            <CtaButton href="/servicios/miami" variant="ghost">
              Servicios Miami
            </CtaButton>
          </div>
          <MarkdownBody markdown={doc.body} />
        </div>
      </section>
    </>
  );
}
