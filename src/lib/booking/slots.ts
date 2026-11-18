import { BOOKING_TZ } from "./types";
import type { BusinessHour } from "./types";
import { listBusyForStaff, listBusinessHours } from "./queries";
import { pad, miamiLocalToUtcIso, formatInMiami, miamiWeekday } from "./dates";

export { pad, miamiLocalToUtcIso, formatInMiami, miamiWeekday };

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
