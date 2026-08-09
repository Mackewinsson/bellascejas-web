import { PageHero } from "@/components/site/PageHero";
import { MarkdownBody } from "@/components/site/MarkdownBody";
import { readContent } from "@/lib/content";

export const metadata = { title: "Preguntas frecuentes" };

export default function FaqPage() {
  const doc = readContent("preguntas-frecuentes.md");
  return (
    <>
      <PageHero
        title="Preguntas frecuentes"
        lead="Microblading, cuidados, retoques y política de cancelación."
      />
      <section className="section">
        <div className="container">
          <MarkdownBody markdown={doc.body} />
        </div>
      </section>
    </>
  );
}
