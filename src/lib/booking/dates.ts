import { BOOKING_TZ } from "./types";

export function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Interpret YYYY-MM-DD + HH:mm in Miami as UTC ISO. */
export function miamiLocalToUtcIso(dateYmd: string, hm: string) {
  const [y, m, d] = dateYmd.split("-").map(Number);
  const [hh, mm] = hm.split(":").map(Number);
  const guess = new Date(Date.UTC(y, m - 1, d, hh, mm, 0));
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: BOOKING_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(guess).map((p) => [p.type, p.value])
  );
  const asLocal = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour === "24" ? "0" : parts.hour),
    Number(parts.minute)
  );
  const desired = Date.UTC(y, m - 1, d, hh, mm);
  const offset = asLocal - desired;
  return new Date(guess.getTime() - offset).toISOString();
}

export function formatInMiami(iso: string, opts?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("es-US", {
    timeZone: BOOKING_TZ,
    ...opts,
  }).format(new Date(iso));
}

export function miamiWeekday(dateYmd: string): number {
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone: BOOKING_TZ,
    weekday: "short",
  }).format(new Date(miamiLocalToUtcIso(dateYmd, "12:00")));
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[name] ?? 0;
}
