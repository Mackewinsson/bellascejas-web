import { CtaButton } from "@/components/site/CtaButton";
import { MarkdownBody } from "@/components/site/MarkdownBody";
import { readContent } from "@/lib/content";
import { NAV, SITE } from "@/lib/site";

const HERO_IMG =
  "https://bellascejas.com/wp-content/uploads/2025/07/image0-scaled.jpeg";

const miamiServices =
  NAV.find((n) => n.href === "/servicios/miami")?.children ?? [];

/** Drop leading hero image from MD — shown in designed hero instead. */
function bodyWithoutLeadingHero(markdown: string) {
  return markdown
    .replace(/^!\[[^\]]*\]\([^)]+\)\s*/m, "")
    .trim();
}

export default function HomePage() {
  const doc = readContent("home.md");
  const body = bodyWithoutLeadingHero(doc.body);

  return (
    <>
      <section className="hero">
        <div className="hero__atmosphere">
          <div className="container hero__content">
            <p className="hero__brand">Bellas Cejas</p>
            <h1 className="hero__headline">
              Bellascejas Academy LLC Eyebrow Bar &amp; Beauty
            </h1>
            <p className="hero__support">
              Especialistas en realce facial y micropigmentacion en Miami y
              Santiago.
            </p>
            <div className="btn-row">
              <CtaButton href={SITE.bookingUrl}>Reservar cita</CtaButton>
              <CtaButton href="/servicios/miami" variant="soft">
                Explorar menu
              </CtaButton>
            </div>
          </div>
        </div>
        <figure className="hero__figure">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={HERO_IMG} alt="Bellas Cejas — micropigmentacion" />
        </figure>
      </section>

      <section className="section">
        <div className="container reveal">
          <MarkdownBody markdown={body} />
        </div>
      </section>

      <section className="section section--soft">
        <div className="container reveal reveal-delay">
          <p className="section__eyebrow">Miami, FL</p>
          <h2 className="section__title">Servicios</h2>
          <p className="section__lead">
            Acceso rapido al menu de tratamientos. Reserva online en /reservar.
          </p>
          <div className="service-list">
            {miamiServices.map((s) => (
              <a key={s.href} href={s.href}>
                {s.label}
                <span>Ver</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
