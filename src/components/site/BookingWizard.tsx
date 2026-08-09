"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Service, Staff } from "@/lib/booking/types";
import { formatUsd } from "@/lib/booking/types";

type Props = {
  services: Service[];
  staff: Staff[];
  initialSlug?: string;
};

function miamiYmd(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function addDaysYmd(ymd: string, days: number) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

function formatSlotLabel(iso: string) {
  return new Intl.DateTimeFormat("es-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function BookingWizard({ services, staff, initialSlug }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slugParam = initialSlug || searchParams.get("service") || "";

  const grouped = useMemo(() => {
    const map = new Map<string, Service[]>();
    for (const s of services) {
      const list = map.get(s.category) || [];
      list.push(s);
      map.set(s.category, list);
    }
    return [...map.entries()];
  }, [services]);

  const initialService =
    services.find((s) => s.slug === slugParam) || services[0] || null;

  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState(initialService?.id || "");
  const [staffId, setStaffId] = useState("any");
  const [dateYmd, setDateYmd] = useState(miamiYmd());
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [startsAt, setStartsAt] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const service = services.find((s) => s.id === serviceId) || null;

  useEffect(() => {
    if (!serviceId || !dateYmd) return;
    let cancelled = false;
    setLoadingSlots(true);
    setStartsAt("");
    fetch(
      `/api/booking/slots?serviceId=${encodeURIComponent(serviceId)}&date=${dateYmd}&staffId=${encodeURIComponent(staffId)}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setSlots(Array.isArray(data.slots) ? data.slots : []);
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [serviceId, dateYmd, staffId]);

  async function submit() {
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          staffId,
          startsAt,
          clientName,
          clientEmail,
          clientPhone,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al reservar");
      router.push(`/reservar/exito?id=${encodeURIComponent(data.id)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al reservar");
    } finally {
      setSubmitting(false);
    }
  }

  const minDate = miamiYmd();
  const maxDate = addDaysYmd(minDate, 60);

  return (
    <div className="booking-wizard">
      <div className="booking-steps" aria-label="Pasos">
        {[1, 2, 3, 4].map((n) => (
          <button
            key={n}
            type="button"
            className={`booking-step${step === n ? " is-active" : ""}${step > n ? " is-done" : ""}`}
            onClick={() => n < step && setStep(n)}
          >
            {n}
          </button>
        ))}
      </div>

      {step === 1 && (
        <section className="booking-panel">
          <h2>1. Elige el servicio</h2>
          {grouped.map(([cat, list]) => (
            <div key={cat} className="booking-cat">
              <h3>{cat}</h3>
              <div className="booking-options">
                {list.map((s) => (
                  <label
                    key={s.id}
                    className={`booking-option${serviceId === s.id ? " is-selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="service"
                      checked={serviceId === s.id}
                      onChange={() => setServiceId(s.id)}
                    />
                    <span className="booking-option__title">{s.title}</span>
                    <span className="booking-option__meta">
                      {formatUsd(s.price_cents)} · {s.duration_mins} min
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <div className="btn-row" style={{ marginTop: "1.5rem" }}>
            <button
              type="button"
              className="btn btn--primary"
              disabled={!serviceId}
              onClick={() => setStep(2)}
            >
              Continuar
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="booking-panel">
          <h2>2. Profesional</h2>
          <p className="section__lead">
            {service?.title} — {service ? formatUsd(service.price_cents) : ""}
          </p>
          <div className="booking-options">
            <label className={`booking-option${staffId === "any" ? " is-selected" : ""}`}>
              <input
                type="radio"
                name="staff"
                checked={staffId === "any"}
                onChange={() => setStaffId("any")}
              />
              <span className="booking-option__title">Cualquier profesional</span>
            </label>
            {staff.map((st) => (
              <label
                key={st.id}
                className={`booking-option${staffId === st.id ? " is-selected" : ""}`}
              >
                <input
                  type="radio"
                  name="staff"
                  checked={staffId === st.id}
                  onChange={() => setStaffId(st.id)}
                />
                <span className="booking-option__title">{st.name}</span>
              </label>
            ))}
          </div>
          <div className="btn-row" style={{ marginTop: "1.5rem" }}>
            <button type="button" className="btn btn--ghost" onClick={() => setStep(1)}>
              Atrás
            </button>
            <button type="button" className="btn btn--primary" onClick={() => setStep(3)}>
              Continuar
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="booking-panel">
          <h2>3. Fecha y hora (Miami)</h2>
          <label className="booking-field">
            <span>Fecha</span>
            <input
              type="date"
              value={dateYmd}
              min={minDate}
              max={maxDate}
              onChange={(e) => setDateYmd(e.target.value)}
            />
          </label>
          {loadingSlots ? (
            <p className="section__lead">Cargando horarios…</p>
          ) : slots.length === 0 ? (
            <p className="section__lead">
              No hay horarios ese día (cerrado o completo). Prueba otra fecha.
            </p>
          ) : (
            <div className="booking-slots">
              {slots.map((iso) => (
                <button
                  key={iso}
                  type="button"
                  className={`booking-slot${startsAt === iso ? " is-selected" : ""}`}
                  onClick={() => setStartsAt(iso)}
                >
                  {formatSlotLabel(iso)}
                </button>
              ))}
            </div>
          )}
          <div className="btn-row" style={{ marginTop: "1.5rem" }}>
            <button type="button" className="btn btn--ghost" onClick={() => setStep(2)}>
              Atrás
            </button>
            <button
              type="button"
              className="btn btn--primary"
              disabled={!startsAt}
              onClick={() => setStep(4)}
            >
              Continuar
            </button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="booking-panel">
          <h2>4. Tus datos</h2>
          <p className="section__lead">
            {service?.title} · {startsAt ? formatSlotLabel(startsAt) : ""} ·{" "}
            {dateYmd}
          </p>
          <label className="booking-field">
            <span>Nombre</span>
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
            />
          </label>
          <label className="booking-field">
            <span>Email</span>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              required
            />
          </label>
          <label className="booking-field">
            <span>Teléfono / WhatsApp</span>
            <input
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
            />
          </label>
          <label className="booking-field">
            <span>Notas (opcional)</span>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          {error ? <p className="booking-error">{error}</p> : null}
          <div className="btn-row" style={{ marginTop: "1.5rem" }}>
            <button type="button" className="btn btn--ghost" onClick={() => setStep(3)}>
              Atrás
            </button>
            <button
              type="button"
              className="btn btn--primary"
              disabled={submitting || !clientName || !clientEmail}
              onClick={submit}
            >
              {submitting ? "Reservando…" : "Confirmar reserva"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
