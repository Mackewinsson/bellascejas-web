import Link from "next/link";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">{SITE.name}</div>
          <p className="footer-muted">{SITE.legalName}</p>
          <p className="footer-muted" style={{ marginTop: "0.75rem" }}>
            {SITE.tagline}
          </p>
        </div>

        <div>
          <div className="footer-title">Miami</div>
          <ul className="footer-links">
            <li>{SITE.miami.address}</li>
            <li>{SITE.miami.suites}</li>
            {SITE.miami.hours.map((h) => (
              <li key={h}>{h}</li>
            ))}
            <li>
              <a href={SITE.miami.mapsUrl} target="_blank" rel="noopener noreferrer">
                Ver en Google Maps
              </a>
            </li>
          </ul>
        </div>

        <div>
          <div className="footer-title">Contacto</div>
          <ul className="footer-links">
            <li>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </li>
            <li>
              <a href={SITE.whatsappUrl}>{SITE.phoneDisplay}</a>
            </li>
            <li>
              <a href={SITE.instagram} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            </li>
            <li>
              <Link href="/contacto">Formulario / datos</Link>
            </li>
            <li>
              <Link href="/servicios/santiago">Santiago, Chile</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {SITE.name}</span>
        <span>Micropigmentación · Cursos · Realce facial</span>
      </div>
    </footer>
  );
}
