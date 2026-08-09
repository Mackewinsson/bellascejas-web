import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let _sql: NeonQueryFunction<false, false> | null = null;

export function getSql() {
  if (_sql) return _sql;
  const url = process.env.NEON_DATABASE_URL;
  if (!url) {
    throw new Error("NEON_DATABASE_URL is not set");
  }
  _sql = neon(url);
  return _sql;
}

/** Tagged-template SQL helper (safe interpolation). */
export function sql(
  strings: TemplateStringsArray,
  ...values: unknown[]
) {
  return getSql()(strings, ...values);
}

export function hasDatabase() {
  return Boolean(process.env.NEON_DATABASE_URL);
}
