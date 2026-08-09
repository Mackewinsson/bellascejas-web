import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { CtaButton } from "@/components/site/CtaButton";
import { listActiveServices } from "@/lib/booking/queries";
import { formatUsd } from "@/lib/booking/types";
import { hasDatabase } from "@/lib/db";
import { SITE } from "@/lib/site";
import pricesJson from "@/data/setmore-prices.json";

export const metadata = {
  title: "Precios Miami",
};

export const dynamic = "force-dynamic";

export default async function PreciosMiamiPage() {
  let grouped: [string, { slug: string; title: string; durationMins: number; priceLabel: string }[]][] =
    [];

  if (hasDatabase()) {
    const services = await listActiveServices();
    const map = new Map<string, typeof grouped[0][1]>();
    for (const s of services) {
      const list = map.get(s.category) || [];
      list.push({
        slug: s.slug,
        title: s.title,
        durationMins: s.duration_mins,
        priceLabel: formatUsd(s.price_cents),
      });
      map.set(s.category, list);
    }
    grouped = [...map.entries()];
  } else {
    const map = new Map<string, typeof grouped[0][1]>();
    for (const s of pricesJson.services) {
      const cat = "Catálogo";
      const list = map.get(cat) || [];
      const slug = s.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 80);
      list.push({
        slug,
        title: s.title,
        durationMins: s.durationMins,
        priceLabel:
          s.price === 0
            ? "Gratis / consultar"
            : `$${s.price.toLocaleString("en-US")}`,
      });
      map.set(cat, list);
    }
    grouped = [...map.entries()];
  }

  return (
    <>
      <PageHero
        title="Precios Miami"
        lead="Lista de tratamientos. Reserva online y paga en el salón."
      />
      <section className="section">
        <div className="container">
          <div className="btn-row" style={{ marginBottom: "1.75rem" }}>
            <CtaButton href={SITE.bookingUrl}>Reservar cita</CtaButton>
            <CtaButton href="/servicios/miami" variant="ghost">
              Servicios
            </CtaButton>
          </div>

          {grouped.map(([category, items]) => (
            <div key={category} className="price-group" style={{ marginBottom: "2rem" }}>
              <h2 className="section__title" style={{ fontSize: "1.35rem" }}>
                {category}
              </h2>
              <ul className="price-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {items.map((item) => (
                  <li
                    key={item.slug}
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: "0.75rem",
                      padding: "0.85rem 0",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 500 }}>{item.title}</div>
                      <div style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
                        {item.durationMins} min · {item.priceLabel}
                      </div>
                    </div>
                    <Link
                      className="btn btn--ghost"
                      href={`/reservar?service=${encodeURIComponent(item.slug)}`}
                    >
                      Reservar
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
