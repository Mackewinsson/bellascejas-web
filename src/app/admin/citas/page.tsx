import { listAppointmentsInRange, listActiveStaff } from "@/lib/booking/queries";
import { miamiLocalToUtcIso } from "@/lib/booking/slots";
import { CalendarView } from "@/components/admin/CalendarView";

export const dynamic = "force-dynamic";

function miamiYmd(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export default async function AdminCitasPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; status?: string; staffId?: string }>;
}) {
  const sp = await searchParams;
  const todayYmd = miamiYmd();
  const selectedDate = sp.date || todayYmd;

  // Query appointments for an extended window around the current/selected month
  // (from 60 days ago to 90 days in future)
  const [y, m] = selectedDate.split("-").map(Number);
  const startWindowDate = new Date(Date.UTC(y, m - 2, 1)).toISOString().slice(0, 10);
  const endWindowDate = new Date(Date.UTC(y, m + 3, 1)).toISOString().slice(0, 10);

  const fromIso = miamiLocalToUtcIso(startWindowDate, "00:00");
  const toIso = miamiLocalToUtcIso(endWindowDate, "00:00");

  const [appointments, staff] = await Promise.all([
    listAppointmentsInRange(fromIso, toIso, {
      status: "all",
    }),
    listActiveStaff(),
  ]);

  return (
    <CalendarView
      initialDate={selectedDate}
      appointments={appointments}
      staff={staff}
    />
  );
}
