import { PageHero } from "@/components/site/PageHero";
import { MarkdownBody } from "@/components/site/MarkdownBody";
import { readContent } from "@/lib/content";

export const metadata = { title: "Gift Card" };

export default function GiftCardPage() {
  const doc = readContent("gift-card.md");
  return (
    <>
      <PageHero
        title="Tarjetas de regalo"
        lead="Elige el monto, compra en Setmore y envíanos el capture por WhatsApp."
      />
      <section className="section">
        <div className="container">
          <MarkdownBody markdown={doc.body} />
        </div>
      </section>
    </>
  );
}
