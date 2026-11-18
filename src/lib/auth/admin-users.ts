import { sql, hasDatabase } from "@/lib/db";
import bcrypt from "bcryptjs";

export type AdminUser = {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  active: boolean;
};

const LOCAL_ADMIN_ID = "admin-local-dev";

async function getLocalFallbackAdmin(): Promise<AdminUser> {
  const email = (process.env.ADMIN_EMAIL || "admin@bellascejas.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "admin";
  const name = process.env.ADMIN_NAME || "Admin Bellas Cejas";
  const password_hash = await bcrypt.hash(password, 10);
  return {
    id: LOCAL_ADMIN_ID,
    email,
    password_hash,
    name,
    active: true,
  };
}

export async function findAdminByEmail(email: string): Promise<AdminUser | null> {
  if (!hasDatabase()) {
    const local = await getLocalFallbackAdmin();
    if (email.toLowerCase() === local.email.toLowerCase()) {
      return local;
    }
    return null;
  }

  try {
    const rows = (await sql`
      SELECT id, email, password_hash, name, active
      FROM admin_users
      WHERE lower(email) = lower(${email})
      LIMIT 1
    `) as AdminUser[];
    return rows[0] ?? null;
  } catch (err) {
    console.warn("DB query error in findAdminByEmail, falling back to local admin if matched:", err);
    const local = await getLocalFallbackAdmin();
    if (email.toLowerCase() === local.email.toLowerCase()) {
      return local;
    }
    return null;
  }
}

export async function findAdminById(id: string): Promise<AdminUser | null> {
  if (!hasDatabase() || id === LOCAL_ADMIN_ID) {
    return getLocalFallbackAdmin();
  }

  try {
    const rows = (await sql`
      SELECT id, email, password_hash, name, active
      FROM admin_users
      WHERE id = ${id}
      LIMIT 1
    `) as AdminUser[];
    return rows[0] ?? null;
  } catch (err) {
    console.warn("DB query error in findAdminById, falling back to local admin:", err);
    return getLocalFallbackAdmin();
  }
}

export async function upsertAdminUser(input: {
  email: string;
  passwordHash: string;
  name: string;
}) {
  if (!hasDatabase()) {
    return {
      id: LOCAL_ADMIN_ID,
      email: input.email.toLowerCase(),
      name: input.name,
    };
  }

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
  if (!hasDatabase()) return 1;
  try {
    const rows = (await sql`SELECT count(*)::int AS c FROM admin_users`) as {
      c: number;
    }[];
    return rows[0]?.c ?? 0;
  } catch {
    return 1;
  }
}

