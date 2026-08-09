#!/usr/bin/env npx tsx
/**
 * Seed staff, business hours, and services from setmore-prices.json
 * Usage: npx tsx scripts/seed-booking.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function categorize(title: string): string {
  const t = title.toLowerCase();
  if (/gift\s*card|tarjeta/.test(t)) return "Gift Cards";
  if (/curso|master class|clase/.test(t)) return "Cursos";
  if (
    /microblad|micropigment|powder|nanobrow|labios|areola|capilar|delineado|refil micro|mantenimiento de micro|evaluacion|remoci/.test(
      t
    )
  )
    return "Micropigmentacion";
  if (/pesta|lifting|racimo|volumen|hibrid|refil pest|retiro de pest/.test(t))
    return "Pestanas";
  if (/depil/.test(t)) return "Depilacion";
  if (/facial|dermapen|dermaplan|limpieza/.test(t)) return "Faciales";
  if (/electro|acrocord/.test(t)) return "Electrocauterizacion";
  if (/ceja|henna|laminado|wax|hilo/.test(t)) return "Cejas";
  return "Otros";
}

async function main() {
  const url = process.env.NEON_DATABASE_URL;
  if (!url) throw new Error("NEON_DATABASE_URL missing");
  const sql = neon(url);

  // Hours: Sun=0 closed, Mon closed, Tue-Sat 10-18
  const hours = [
    [0, true, "10:00", "18:00"],
    [1, true, "10:00", "18:00"],
    [2, false, "10:00", "18:00"],
    [3, false, "10:00", "18:00"],
    [4, false, "10:00", "18:00"],
    [5, false, "10:00", "18:00"],
    [6, false, "10:00", "18:00"],
  ] as const;

  for (const [weekday, closed, open, close] of hours) {
    await sql`
      INSERT INTO business_hours (weekday, open_time, close_time, is_closed)
      VALUES (${weekday}, ${open}::time, ${close}::time, ${closed})
      ON CONFLICT (weekday) DO UPDATE
      SET open_time = EXCLUDED.open_time,
          close_time = EXCLUDED.close_time,
          is_closed = EXCLUDED.is_closed
    `;
  }
  console.log("business_hours ok");

  const staffCount = await sql`SELECT count(*)::int AS c FROM staff`;
  if ((staffCount[0] as { c: number }).c === 0) {
    await sql`
      INSERT INTO staff (name, email, active, sort_order) VALUES
        ('Yulexi Marquez', 'Andreapalenciam@icloud.com', true, 1),
        ('Andrea Palencia', 'Andreapalenciam@icloud.com', true, 2),
        ('Ingrid', null, true, 3)
    `;
    console.log("staff seeded");
  } else {
    console.log("staff already present");
  }

  const raw = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "src/data/setmore-prices.json"),
      "utf8"
    )
  ) as {
    services: {
      id: string;
      title: string;
      price: number;
      durationMins: number;
      description: string;
    }[];
  };

  const usedSlugs = new Set<string>();
  let i = 0;
  for (const s of raw.services) {
    i += 1;
    let slug = slugify(s.title) || `servicio-${i}`;
    if (usedSlugs.has(slug)) slug = `${slug}-${i}`;
    usedSlugs.add(slug);
    const category = categorize(s.title);
    const priceCents = Math.round(Number(s.price) * 100);
    const duration = Math.max(15, Number(s.durationMins) || 30);
    // Skip pure gift cards from bookable services? Keep them active=false for gift cards
    const active = !/gift\s*card/i.test(s.title);

    await sql`
      INSERT INTO services (
        slug, title, description, duration_mins, price_cents, category, active, sort_order, external_id
      ) VALUES (
        ${slug}, ${s.title}, ${s.description || ""}, ${duration}, ${priceCents},
        ${category}, ${active}, ${i}, ${s.id}
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        duration_mins = EXCLUDED.duration_mins,
        price_cents = EXCLUDED.price_cents,
        category = EXCLUDED.category,
        active = EXCLUDED.active,
        external_id = EXCLUDED.external_id,
        updated_at = now()
    `;
  }
  console.log("services upserted", raw.services.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
