import { NextResponse } from "next/server";
import { getServiceById, listActiveStaff } from "@/lib/booking/queries";
import { getAvailableSlots } from "@/lib/booking/slots";
import { hasDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    if (!hasDatabase()) {
      return NextResponse.json({ slots: [] });
    }
    const { searchParams } = new URL(req.url);
    const serviceId = searchParams.get("serviceId") || "";
    const dateYmd = searchParams.get("date") || "";
    const staffId = searchParams.get("staffId") || "any";

    if (!serviceId || !/^\d{4}-\d{2}-\d{2}$/.test(dateYmd)) {
      return NextResponse.json(
        { error: "Parámetros inválidos" },
        { status: 400 }
      );
    }

    const service = await getServiceById(serviceId);
    if (!service) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    const staff = await listActiveStaff();
    if (!staff.length) return NextResponse.json({ slots: [] });

    if (staffId === "any") {
      const all = new Set<string>();
      for (const st of staff) {
        const slots = await getAvailableSlots({
          dateYmd,
          durationMins: service.duration_mins,
          staffId: st.id,
        });
        slots.forEach((s) => all.add(s));
      }
      return NextResponse.json({
        slots: [...all].sort(),
      });
    }

    const slots = await getAvailableSlots({
      dateYmd,
      durationMins: service.duration_mins,
      staffId,
    });
    return NextResponse.json({ slots });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Error al cargar horarios" },
      { status: 500 }
    );
  }
}
