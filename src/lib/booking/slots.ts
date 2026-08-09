import { BOOKING_TZ } from "./types";
import type { BusinessHour } from "./types";
import { listBusyForStaff, listBusinessHours } from "./queries";

function pad(n: number) {
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

function parseTimeToMinutes(t: string) {
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  return h * 60 + m;
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

export async function getAvailableSlots(input: {
  dateYmd: string;
  durationMins: number;
  staffId: string;
}): Promise<string[]> {
  const hours = await listBusinessHours();
  const weekday = miamiWeekday(input.dateYmd);
  const dayHours = hours.find((h) => Number(h.weekday) === weekday) as
    | BusinessHour
    | undefined;
  if (!dayHours || dayHours.is_closed) return [];

  const openMin = parseTimeToMinutes(dayHours.open_time);
  const closeMin = parseTimeToMinutes(dayHours.close_time);
  if (closeMin <= openMin) return [];

  const dayStartIso = miamiLocalToUtcIso(
    input.dateYmd,
    `${pad(Math.floor(openMin / 60))}:${pad(openMin % 60)}`
  );
  const dayEndIso = miamiLocalToUtcIso(
    input.dateYmd,
    `${pad(Math.floor(closeMin / 60))}:${pad(closeMin % 60)}`
  );

  const busy = await listBusyForStaff(input.staffId, dayStartIso, dayEndIso);
  const busyRanges = busy.map((b) => {
    return [new Date(b.starts_at).getTime(), new Date(b.ends_at).getTime()] as const;
  });

  const now = Date.now();
  const slots: string[] = [];
  const step = 15;

  for (
    let start = openMin;
    start + input.durationMins <= closeMin;
    start += step
  ) {
    const end = start + input.durationMins;
    const startHm = `${pad(Math.floor(start / 60))}:${pad(start % 60)}`;
    const endHm = `${pad(Math.floor(end / 60))}:${pad(end % 60)}`;
    const startIso = miamiLocalToUtcIso(input.dateYmd, startHm);
    const endIso = miamiLocalToUtcIso(input.dateYmd, endHm);
    const startMs = new Date(startIso).getTime();
    const endMs = new Date(endIso).getTime();

    if (startMs < now + 30 * 60 * 1000) continue;

    const clash = busyRanges.some(([bs, be]) =>
      overlaps(startMs, endMs, bs, be)
    );
    if (!clash) slots.push(startIso);
  }

  return slots;
}
