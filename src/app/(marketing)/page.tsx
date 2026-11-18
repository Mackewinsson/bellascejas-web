import Link from "next/link";
import { CtaButton } from "@/components/site/CtaButton";
import { NAV, SITE } from "@/lib/site";
import { listActiveServices } from "@/lib/booking/queries";
import { formatUsd } from "@/lib/booking/types";

export const dynamic = "force-dynamic";

const miamiServices =
  NAV.find((n) => n.href === "/servicios/miami")?.children ?? [];

export const metadata = {
  title: "Bellascejas Academy | Microblading & Realce Facial en Miami y Santiago",
  description:
    "Especialistas en microblading, micropigmentación pelo a pelo y estética facial en Miami (Doral) y Santiago. Más de 10 años de experiencia y 3,000 procedimientos realizados por Máster Phibrows.",
};

export default async function HomePage() {
  const activeServices = await listActiveServices();

  // Find popular services or featured ones dynamically from database / local store
  const featuredVirgenes =
    activeServices.find(
      (s) =>
        s.slug.includes("virgenes") ||
        s.title.toLowerCase().includes("virgenes")
    ) || activeServices[0];

  const featuredMantenimiento =
    activeServices.find((s) =>
      s.title.toLowerCase().includes("mantenimiento")
    ) || activeServices[1];

  const featuredEvaluacion =
    activeServices.find((s) =>
      s.title.toLowerCase().includes("evaluacion")
    ) || activeServices[2];

  const featuredLaminado =
    activeServices.find(
      (s) =>
        s.title.toLowerCase().includes("laminado") ||
        s.title.toLowerCase().includes("henna")
    ) || activeServices[3];

  const featuredPestanas =
    activeServices.find(
      (s) =>
        s.category.toLowerCase().includes("pesta") ||
        s.title.toLowerCase().includes("lifting") ||
        s.title.toLowerCase().includes("volumen")
    ) || activeServices[4];

  const featuredFacial =
    activeServices.find(
      (s) =>
        s.category.toLowerCase().includes("facial") ||
        s.title.toLowerCase().includes("limpieza") ||
        s.title.toLowerCase().includes("dermapen")
    ) || activeServices[5];

  const primaryPopular = [
    featuredVirgenes,
    featuredMantenimiento,
    featuredEvaluacion,
    featuredLaminado,
    featuredPestanas,
    featuredFacial,
  ].filter((s): s is NonNullable<typeof s> => Boolean(s));

  // Fill up to 6 unique services
  const displayedPopular = [
    ...primaryPopular,
    ...activeServices.filter((s) => !primaryPopular.some((p) => p.id === s.id)),
  ].slice(0, 6);

  return (
    <>
      {/* ——— HERO SECTION ——— */}
      <section className="hero">
        <div className="hero__atmosphere">
          <div className="container hero__grid">
            <div className="hero__content">
              <p className="hero__brand">Bellas Cejas</p>
              <h1 className="hero__headline">
                Bellascejas Academy LLC Eyebrow Bar &amp; Beauty
              </h1>
              <p className="hero__support">
                Especialistas en realce facial y micropigmentación en Miami y
                Santiago. Técnica de vellos hiperrealistas para resultados
                delicados, elegantes y naturales.
              </p>
              <div className="btn-row">
                <CtaButton href={SITE.bookingUrl}>Reservar cita en Miami</CtaButton>
                <CtaButton href="/servicios/miami" variant="soft">
                  Ver servicios y precios
                </CtaButton>
              </div>
              <div className="hero__mini-trust">
                <span>✦ +10 Años de maestría</span>
                <span>✦ +3,000 Procedimientos</span>
                <span>✦ Master Phibrows</span>
              </div>
            </div>

            <div className="hero__media-wrapper">
              <figure className="hero__figure">
                <picture>
                  <source
                    srcSet={featuredVirgenes?.image_url || "/images/hero-microblading.webp"}
                    type="image/webp"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredVirgenes?.image_url || "/images/hero-microblading.jpg"}
                    alt="Bellas Cejas — Microblading pelo a pelo hiperrealista"
                    width={1440}
                    height={810}
                    fetchPriority="high"
                    decoding="async"
                    className="hero__img"
                  />
                </picture>
                <div className="hero__badge">
                  <span className="hero__badge-dot" aria-hidden="true"></span>
                  <span>Microblading Hiperrealista</span>
                </div>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* ——— TRUST & CREDIBILITY METRICS BAR ——— */}
      <section className="trust-bar-section">
        <div className="container">
          <div className="trust-bar">
            <div className="trust-item">
              <span className="trust-item__icon">✦</span>
              <div>
                <strong>+10 Años</strong>
                <p>De maestría y trayectoria</p>
              </div>
            </div>
            <div className="trust-item">
              <span className="trust-item__icon">✦</span>
              <div>
                <strong>+3,000</strong>
                <p>Procedimientos realizados</p>
              </div>
            </div>
            <div className="trust-item">
              <span className="trust-item__icon">✦</span>
              <div>
                <strong>Artist Phibrows</strong>
                <p>Certificación internacional</p>
              </div>
            </div>
            <div className="trust-item">
              <span className="trust-item__icon">✦</span>
              <div>
                <strong>Miami &amp; Santiago</strong>
                <p>Doral FL &amp; Quinta Normal</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ——— SPECIALTY: MICROBLADING DETAIL ——— */}
      <section className="section">
        <div className="container">
          <div className="split-feature reveal">
            <div className="split-feature__media">
              <picture>
                <source
                  srcSet="/images/microblading-detail.webp"
                  type="image/webp"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/microblading-detail.jpg"
                  alt="Detalle de trazo microblading vello a vello"
                  width={960}
                  height={720}
                  loading="lazy"
                  decoding="async"
                  className="split-feature__img"
                />
              </picture>
              <div className="split-feature__badge">
                <span>Técnica hiperrealista</span>
              </div>
            </div>

            <div className="split-feature__content">
              <p className="section__eyebrow">Nuestra Ventaja Distintiva</p>
              <h2 className="section__title">
                Técnica de vellos hiperrealistas y micropigmentación sutil
              </h2>
              <p className="section__lead">
                Nuestro equipo está dedicado a proporcionar bienestar y
                confianza. Nuestra maestría radica en realzar la belleza con
                cambios tan hermosos y sutiles que pasan desapercibidos, siempre
                respetando los gustos y la morfología única de cada rostro.
              </p>

              <ul className="feature-checklist">
                <li>
                  <span className="check-bullet">✓</span>
                  <div>
                    <strong>Diseño morfológico personalizado:</strong> Trazamos
                    la forma ideal respetando la estructura ósea de tus cejas.
                  </div>
                </li>
                <li>
                  <span className="check-bullet">✓</span>
                  <div>
                    <strong>Pigmentos hipoalergénicos certificados:</strong>{" "}
                    Garantizan tonalidades estables que no viran al rojo ni al
                    azul con el tiempo.
                  </div>
                </li>
                <li>
                  <span className="check-bullet">✓</span>
                  <div>
                    <strong>Resultados naturales e indetectables:</strong> Cejas
                    pobladas, definidas y elegantes que armonizan tu mirada.
                  </div>
                </li>
              </ul>

              <div className="btn-row" style={{ marginTop: "1.75rem" }}>
                <Link
                  href="/servicios/miami/microblading-micropigmentacion"
                  className="btn btn--outline"
                >
                  Ver técnica de microblading →
                </Link>
                <Link href="/reservar" className="btn btn--primary">
                  Reservar cita
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ——— STUDIO EXPERIENCE & PHILOSOPHY ——— */}
      <section className="section section--soft">
        <div className="container">
          <div className="split-feature split-feature--reverse reveal">
            <div className="split-feature__media">
              <picture>
                <source
                  srcSet="/images/studio-experience.webp"
                  type="image/webp"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/studio-experience.jpg"
                  alt="Experiencia y medición de cejas en el salón de Miami"
                  width={960}
                  height={720}
                  loading="lazy"
                  decoding="async"
                  className="split-feature__img"
                />
              </picture>
            </div>

            <div className="split-feature__content">
              <p className="section__eyebrow">La Experiencia en Bellascejas</p>
              <h2 className="section__title">
                Precisión, elegancia y atención al detalle
              </h2>
              <blockquote className="studio-quote">
                «Gracias al buen trabajo que hemos experimentado en los últimos
                años, en Bellascejas hemos evolucionado nuestros servicios con
                profesionales de primer nivel, impregnando cada servicio con los
                valores que nos distinguen: profesionalismo, carisma, empatía,
                ética, elegancia y naturalidad.»
              </blockquote>
              <p className="section__lead">
                Ubicados en <strong>Doral, Miami (Areas Salones)</strong>,
                brindamos un ambiente tranquilo y cálido donde cada cita
                comienza con una evaluación minuciosa para escuchar lo que deseas
                y sugerir el mejor enfoque para tu rostro.
              </p>
              <div className="btn-row" style={{ marginTop: "1.25rem" }}>
                <Link href="/contacto" className="btn btn--ghost">
                  Conoce nuestra sede en Doral →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ——— RESULTS GALLERY SHOWCASE ——— */}
      <section className="section">
        <div className="container">
          <div className="section-head-center reveal">
            <p className="section__eyebrow">Galería &amp; Tratamientos</p>
            <h2 className="section__title" style={{ maxWidth: "26ch" }}>
              Resultados hermosos y dignos de admiración
            </h2>
            <p className="section__lead" style={{ margin: "0 auto 2.5rem" }}>
              Cada procedimiento es un trabajo artesanal diseñado para resaltar
              lo mejor de tus rasgos.
            </p>
          </div>

          <div className="results-grid reveal reveal-delay">
            <div className="result-card">
              <div className="result-card__figure">
                <picture>
                  <source
                    srcSet={featuredVirgenes?.image_url || "/images/hero-microblading.webp"}
                    type="image/webp"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredVirgenes?.image_url || "/images/hero-microblading.jpg"}
                    alt={featuredVirgenes?.title || "Microblading pelo a pelo"}
                    width={480}
                    height={360}
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
                <span className="result-card__tag">Cejas Hiperrealistas</span>
              </div>
              <div className="result-card__body">
                <h3>{featuredVirgenes?.title || "Microblading Pelo a Pelo"}</h3>
                <p>
                  {featuredVirgenes?.description ||
                    "Reconstrucción y diseño pelo a pelo en cejas vírgenes o con trabajos anteriores. Duración y definición con aspecto natural."}
                </p>
                <Link
                  href={`/reservar?service=${encodeURIComponent(
                    featuredVirgenes?.slug || ""
                  )}`}
                  className="result-card__link"
                >
                  Agendar por {featuredVirgenes ? formatUsd(featuredVirgenes.price_cents) : "$400"} →
                </Link>
              </div>
            </div>

            <div className="result-card">
              <div className="result-card__figure">
                <picture>
                  <source
                    srcSet="/images/lip-brow-result.webp"
                    type="image/webp"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/lip-brow-result.jpg"
                    alt="Micropigmentación de cejas y labios"
                    width={480}
                    height={360}
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
                <span className="result-card__tag">Labios &amp; Mirada</span>
              </div>
              <div className="result-card__body">
                <h3>Micropigmentación &amp; Lip Blush</h3>
                <p>
                  Coloración sutil en labios para restaurar vitalidad y simetría,
                  junto a cejas en técnica sombreada o combinada.
                </p>
                <Link
                  href="/servicios/miami/microblading-micropigmentacion"
                  className="result-card__link"
                >
                  Explorar opciones →
                </Link>
              </div>
            </div>

            <div className="result-card">
              <div className="result-card__figure">
                <picture>
                  <source
                    srcSet="/images/microblading-detail.webp"
                    type="image/webp"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/microblading-detail.jpg"
                    alt="Laminado y diseño de cejas"
                    width={480}
                    height={360}
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
                <span className="result-card__tag">Diseño &amp; Pestañas</span>
              </div>
              <div className="result-card__body">
                <h3>Laminado, Lifting &amp; Pestañas</h3>
                <p>
                  Peinado y fijación de cejas rebeldes con nutrición profunda, más
                  lifting o extensiones para realzar la mirada.
                </p>
                <Link
                  href="/servicios/miami/pestanas"
                  className="result-card__link"
                >
                  Ver tratamientos de pestañas →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ——— POPULAR SERVICES IN MIAMI (DYNAMIC FROM DB / ADMIN) ——— */}
      <section className="section section--soft">
        <div className="container reveal">
          <div className="section-head-between">
            <div>
              <p className="section__eyebrow">Miami, FL</p>
              <h2 className="section__title">Servicios Populares</h2>
              <p className="section__lead">
                Acceso directo a nuestros tratamientos más solicitados. Editables
                en tiempo real desde el panel de administración.
              </p>
            </div>
            <Link href="/servicios/miami/precios" className="btn btn--outline">
              Ver lista de precios completa →
            </Link>
          </div>

          <div className="popular-grid">
            {displayedPopular.map((s) => (
              <div key={s.id} className="popular-card">
                {s.image_url && (
                  <div className="popular-card__img-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.image_url}
                      alt={s.title}
                      width={400}
                      height={240}
                      loading="lazy"
                      decoding="async"
                      className="popular-card__img"
                    />
                  </div>
                )}
                <div className="popular-card__top">
                  <span className="popular-card__cat">{s.category}</span>
                  <span className="popular-card__price">
                    {s.price_cents === 0 ? "Gratis" : formatUsd(s.price_cents)}
                  </span>
                </div>
                <h3 className="popular-card__title">{s.title}</h3>
                <p className="popular-card__desc">
                  {s.description ||
                    "Procedimiento profesional de realce facial en nuestro salón de Miami."}
                </p>
                <div className="popular-card__footer">
                  <span className="popular-card__duration">
                    ⏱ {s.duration_mins} min
                  </span>
                  <Link
                    href={`/reservar?service=${encodeURIComponent(s.slug)}`}
                    className="btn btn--primary btn--sm"
                  >
                    Reservar
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="service-list" style={{ marginTop: "2rem" }}>
            {miamiServices.map((s) => (
              <Link key={s.href} href={s.href}>
                {s.label}
                <span>Ver →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ——— MASTER & TEAM SECTION ——— */}
      <section className="section">
        <div className="container reveal">
          <p className="section__eyebrow">¿Quién es nuestra Máster?</p>
          <h2 className="section__title">Yulexi M. Márquez Borjas</h2>
          <p className="section__lead">
            Dedicada al mundo de la belleza desde su adolescencia, licenciada en
            educación con amor pedagógico por enseñar. Máster Phibrows por Branco
            Babic, Artista Lash y Micropigmentadora en cejas 3D, labios y ojos con
            entrenamientos en Brasil, Chile, Colombia y EE.UU. Fundadora de
            Bellascejas Academy.
          </p>

          <div className="team-cards-grid">
            <div className="team-card">
              <div className="team-card__role">Máster &amp; Fundadora</div>
              <h3 className="team-card__name">Yulexi Márquez</h3>
              <p className="team-card__bio">
                10 años perfeccionando su técnica hiperrealista con más de 3,000
                procedimientos realizados. Su estilo único realza la belleza
                natural de forma sutil y elegante.
              </p>
            </div>

            <div className="team-card">
              <div className="team-card__role">Cosmetóloga &amp; Gestora</div>
              <h3 className="team-card__name">Andrea Palencia</h3>
              <p className="team-card__bio">
                Periodista, cosmetóloga y mano derecha de Yulexi en la
                experiencia de nuestras clientes y la dirección de nuestra marca.
              </p>
            </div>

            <div className="team-card">
              <div className="team-card__role">Artista en Micropigmentación</div>
              <h3 className="team-card__name">Ingrid</h3>
              <p className="team-card__bio">
                Especialista en micropigmentación de cejas, labios y ojos,
                lashista, depilación facial y corporal y cosmetóloga certificada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ——— LOCATION & FINAL BOOKING CTA BANNER ——— */}
      <section className="section section--soft">
        <div className="container">
          <div className="booking-cta-banner reveal">
            <div className="booking-cta-banner__content">
              <p className="section__eyebrow">Miami, FL</p>
              <h2 className="booking-cta-banner__title">
                ¿Lista para resaltar tu belleza natural?
              </h2>
              <p className="booking-cta-banner__text">
                Visítanos en <strong>{SITE.miami.address}</strong> (
                {SITE.miami.suites}). Atendemos de Martes a Sábado de 10:00am a
                06:00pm. También atendemos en nuestra sede de Santiago, Chile.
              </p>
              <div className="btn-row" style={{ marginTop: "1.5rem" }}>
                <CtaButton href={SITE.bookingUrl}>Reservar cita en Miami</CtaButton>
                <a
                  href={SITE.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--ghost"
                >
                  Consultar por WhatsApp
                </a>
              </div>
            </div>
            <div className="booking-cta-banner__side">
              <div className="location-info-card">
                <h4>Sede Miami</h4>
                <p>{SITE.miami.address}</p>
                <p className="location-info-card__sub">{SITE.miami.suites}</p>
                <p className="location-info-card__hours">
                  Mar – Sáb: 10:00 AM – 6:00 PM
                </p>
                <a
                  href={SITE.miami.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="location-info-card__link"
                >
                  Ver en Google Maps ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
