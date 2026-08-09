import { PageHero } from "@/components/site/PageHero";
import { CtaButton } from "@/components/site/CtaButton";
import { MarkdownBody } from "@/components/site/MarkdownBody";
import { readContent } from "@/lib/content";
import { SITE } from "@/lib/site";

export const metadata = { title: "Comentarios en Instagram" };

export default function ComentariosInstagramPage() {
  const doc = readContent("clientes/comentarios-instagram.md");

  return (
    <>
      <PageHero title={doc.title} />
      <section className="section">
        <div className="container">
          <MarkdownBody markdown={doc.body} />
          <div className="btn-row" style={{ marginTop: "1.5rem" }}>
            <CtaButton href={SITE.instagram} external>
              Abrir @bellascejascl
            </CtaButton>
            <CtaButton href="/clientes/resultados" variant="ghost">
              Ver resultados
            </CtaButton>
          </div>
        </div>
      </section>
    </>
  );
}
