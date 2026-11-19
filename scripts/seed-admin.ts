#!/usr/bin/env npx tsx
/**
 * Seed or update the single admin user from env.
 * Usage: npm run seed:admin
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";
import bcrypt from "bcryptjs";

async function main() {
  const url = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL or NEON_DATABASE_URL missing");
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  const name = process.env.ADMIN_NAME || "Admin";
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD required");
  }

  const sql = postgres(url, { ssl: url.includes("sslmode=require") ? { rejectUnauthorized: false } : false });
  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
      email text UNIQUE NOT NULL,
      password_hash text NOT NULL,
      name text NOT NULL,
      active boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `;
  const hash = await bcrypt.hash(password, 12);
  const rows = await sql`
    INSERT INTO admin_users (email, password_hash, name, active)
    VALUES (${email}, ${hash}, ${name}, true)
    ON CONFLICT (email) DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      name = EXCLUDED.name,
      active = true,
      updated_at = now()
    RETURNING id, email
  `;
  console.log("admin user ready:", rows[0]);
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
