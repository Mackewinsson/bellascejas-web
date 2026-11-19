import postgres from "postgres";

let _sql: ReturnType<typeof postgres> | null = null;

export function getSql() {
  if (_sql) return _sql;
  const url = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL or NEON_DATABASE_URL is not set");
  }
  _sql = postgres(url, {
    ssl: url.includes("sslmode=require") || url.includes("ssl=true") ? { rejectUnauthorized: false } : false,
    max: 10,
    idle_timeout: 20,
  });
  return _sql;
}

/** Tagged-template SQL helper (safe interpolation). */
export function sql(
  strings: TemplateStringsArray,
  ...values: any[]
): any {
  return (getSql() as any)(strings, ...values);
}

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL);
}
