import { NextResponse } from "next/server";
import { createLead } from "@/lib/leads/queries";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const message = String(body.message || "").trim();

    if (!name || !email) {
      return NextResponse.json(
        { error: "El nombre y el correo electrónico son obligatorios." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Correo electrónico no válido." },
        { status: 400 }
      );
    }

    await createLead({
      name,
      email,
      phone,
      source: "contacto_web",
      status: "nuevo",
      notes: message ? `Mensaje web: ${message}` : "Contacto desde formulario web",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error in /api/contacto:", err);
    return NextResponse.json(
      { error: "No se pudo enviar tu mensaje. Intenta de nuevo o contáctanos por WhatsApp." },
      { status: 500 }
    );
  }
}
