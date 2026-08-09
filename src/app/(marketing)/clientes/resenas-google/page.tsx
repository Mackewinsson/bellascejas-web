import { PageHero } from "@/components/site/PageHero";
import { CtaButton } from "@/components/site/CtaButton";
import { readContent } from "@/lib/content";

function parseReviews(markdown: string) {
  const blocks = markdown.split(/^### /m).slice(1);
  return blocks
    .map((block) => {
      const lines = block.trim().split("\n");
      const author = lines[0]?.trim() ?? "";
      const dateLine = lines.find((l) => l.startsWith("*") && l.endsWith("*"));
      const date = dateLine?.replace(/\*/g, "") ?? "";
      const text = lines
        .slice(1)
        .filter((l) => !l.startsWith("*") || !l.endsWith("*"))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      return { author, date, text };
    })
    .filter((r) => r.author && r.text);
}

export const metadata = { title: "Reseñas de Google" };

export default function ResenasGooglePage() {
  const doc = readContent("clientes/resenas-google.md");
  const reviews = parseReviews(doc.body);

  return (
    <>
      <PageHero
        title="Reseñas de Google"
        lead="Selección visible del widget Trustindex del sitio anterior (182 reseñas en total)."
      />
      <section className="section">
        <div className="container">
          <div className="btn-row" style={{ marginBottom: "1.75rem" }}>
            <CtaButton
              href="https://admin.trustindex.io/api/googleWriteReview?place-id=ChIJ30RcjIq_2YgRqtGQn_J0F8Q"
              external
            >
              Escribir reseña
            </CtaButton>
          </div>
          <div className="review-list">
            {reviews.map((r) => (
              <article className="review" key={`${r.author}-${r.date}`}>
                <h3>{r.author}</h3>
                {r.date ? <time>{r.date}</time> : null}
                <p>{r.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
