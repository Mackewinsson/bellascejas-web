import { notFound } from "next/navigation";
import { PageHero } from "@/components/site/PageHero";
import { CtaButton } from "@/components/site/CtaButton";
import { MarkdownBody } from "@/components/site/MarkdownBody";
import { contentExists, readContent } from "@/lib/content";
import { CURSO_SLUGS, SITE } from "@/lib/site";

type Params = { slug: string };

export function generateStaticParams() {
  return CURSO_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const file = `cursos/${slug}.md`;
  if (!contentExists(file)) return {};
  return { title: readContent(file).title };
}

export default async function CursoPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const file = `cursos/${slug}.md`;
  if (!contentExists(file)) notFound();
  const doc = readContent(file);

  return (
    <>
      <PageHero title={doc.title} lead="Formación con Bellascejas Academy" />
      <section className="section">
        <div className="container">
          <div className="btn-row" style={{ marginBottom: "1.75rem" }}>
            <CtaButton href={SITE.bookingUrl}>
              Unirme / Reservar
            </CtaButton>
            <CtaButton href={SITE.whatsappApi} external variant="ghost">
              Consultar por WhatsApp
            </CtaButton>
          </div>
          <MarkdownBody markdown={doc.body} />
        </div>
      </section>
    </>
  );
}
