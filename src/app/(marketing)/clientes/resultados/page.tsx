import Image from "next/image";
import { PageHero } from "@/components/site/PageHero";
import { CtaButton } from "@/components/site/CtaButton";
import { readContent } from "@/lib/content";
import { SITE } from "@/lib/site";

export const metadata = { title: "Resultados" };

export default function ResultadosPage() {
  const doc = readContent("clientes/resultados.md");
  const images = doc.images.filter((src) => !/logo|flag|gtranslate/i.test(src));

  return (
    <>
      <PageHero
        title="Resultados"
        lead="Trabajos de microblading y micropigmentación."
      />
      <section className="section">
        <div className="container">
          <div className="btn-row" style={{ marginBottom: "1.75rem" }}>
            <CtaButton href={SITE.bookingUrl}>
              Reservar
            </CtaButton>
          </div>
          <div className="gallery">
            {images.map((src) => (
              <Image
                key={src}
                src={src}
                alt="Resultado Bellas Cejas"
                width={480}
                height={640}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
