import { sql } from "@/lib/db";

export type AdminUser = {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  active: boolean;
};

export async function findAdminByEmail(email: string): Promise<AdminUser | null> {
  const rows = (await sql`
    SELECT id, email, password_hash, name, active
    FROM admin_users
    WHERE lower(email) = lower(${email})
    LIMIT 1
  `) as AdminUser[];
  return rows[0] ?? null;
}

export async function findAdminById(id: string): Promise<AdminUser | null> {
  const rows = (await sql`
    SELECT id, email, password_hash, name, active
    FROM admin_users
    WHERE id = ${id}
    LIMIT 1
  `) as AdminUser[];
  return rows[0] ?? null;
}

export async function upsertAdminUser(input: {
  email: string;
  passwordHash: string;
  name: string;
}) {
  const rows = (await sql`
    INSERT INTO admin_users (email, password_hash, name, active)
    VALUES (${input.email.toLowerCase()}, ${input.passwordHash}, ${input.name}, true)
    ON CONFLICT (email) DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      name = EXCLUDED.name,
      active = true,
      updated_at = now()
    RETURNING id, email, name
  `) as { id: string; email: string; name: string }[];
  return rows[0];
}

export async function countAdminUsers() {
  const rows = (await sql`SELECT count(*)::int AS c FROM admin_users`) as {
    c: number;
  }[];
  return rows[0]?.c ?? 0;
}
