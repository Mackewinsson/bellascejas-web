import { notFound } from "next/navigation";
import { PageHero } from "@/components/site/PageHero";
import { CtaButton } from "@/components/site/CtaButton";
import { MarkdownBody } from "@/components/site/MarkdownBody";
import { contentExists, readContent } from "@/lib/content";
import { MIAMI_SERVICE_SLUGS, SITE } from "@/lib/site";

type Params = { slug: string };

export function generateStaticParams() {
  return MIAMI_SERVICE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  if (!contentExists(`servicios-miami/${slug}.md`)) return {};
  const doc = readContent(`servicios-miami/${slug}.md`);
  return { title: doc.title };
}

export default async function MiamiServicePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const file = `servicios-miami/${slug}.md`;
  if (!contentExists(file)) notFound();
  const doc = readContent(file);

  return (
    <>
      <PageHero title={doc.title} />
      <section className="section">
        <div className="container">
          <div className="btn-row" style={{ marginBottom: "1.75rem" }}>
            <CtaButton href={SITE.bookingUrl}>
              Reservar
            </CtaButton>
            <CtaButton href="/servicios/miami" variant="ghost">
              Todos los servicios
            </CtaButton>
          </div>
          <MarkdownBody markdown={doc.body} />
        </div>
      </section>
    </>
  );
}
