"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Service, Staff } from "@/lib/booking/types";
import { formatUsd, BOOKING_TZ } from "@/lib/booking/types";

type Props = {
  services: Service[];
  staff: Staff[];
  initialSlug?: string;
};

function miamiYmd(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BOOKING_TZ,
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
    timeZone: BOOKING_TZ,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatDateHuman(isoOrYmd: string) {
  const dt = isoOrYmd.includes("T")
    ? new Date(isoOrYmd)
    : new Date(`${isoOrYmd}T12:00:00Z`);
  return new Intl.DateTimeFormat("es-US", {
    timeZone: BOOKING_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(dt);
}

function formatShortDate(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  return new Intl.DateTimeFormat("es-US", {
    timeZone: BOOKING_TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(dt);
}

export function BookingWizard({ services, staff, initialSlug }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slugParam = initialSlug || searchParams.get("service") || "";

  // Group services by category
  const categories = useMemo(() => {
    const map = new Map<string, Service[]>();
    for (const s of services) {
      const cat = s.category || "Otros";
      const list = map.get(cat) || [];
      list.push(s);
      map.set(cat, list);
    }
    return [...map.entries()];
  }, [services]);

  const initialService =
    services.find((s) => s.slug === slugParam) ||
    services.find((s) => s.id === slugParam) ||
    services[0] ||
    null;

  // Flow steps: 1 = Servicio, 2 = Profesional, 3 = Fecha y Hora, 4 = Datos
  const [expandedStep, setExpandedStep] = useState<number>(1);
  const [highestReachedStep, setHighestReachedStep] = useState<number>(1);

  // Selections
  const [serviceId, setServiceId] = useState<string>(initialService?.id || "");
  const [staffId, setStaffId] = useState<string>("any");
  const [dateYmd, setDateYmd] = useState<string>(miamiYmd());
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [startsAt, setStartsAt] = useState<string>("");

  // Customer details
  const [clientName, setClientName] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Step 1: Collapsible categories & search filter
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>("all");
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
    const initialMap: Record<string, boolean> = {};
    const initCat = initialService?.category || categories[0]?.[0] || "";
    if (initCat) initialMap[initCat] = true;
    return initialMap;
  });

  // Step container refs for smooth scrolling
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const step4Ref = useRef<HTMLDivElement>(null);

  const selectedService = services.find((s) => s.id === serviceId) || null;
  const selectedStaff = staff.find((st) => st.id === staffId) || null;

  // Filtered categories based on search and selected filter
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return categories
      .map(([cat, list]) => {
        if (selectedCatFilter !== "all" && cat !== selectedCatFilter) {
          return null;
        }
        let matching = list;
        if (q) {
          matching = list.filter(
            (s) =>
              s.title.toLowerCase().includes(q) ||
              (s.description && s.description.toLowerCase().includes(q)) ||
              cat.toLowerCase().includes(q)
          );
        }
        if (matching.length === 0) return null;
        return [cat, matching] as [string, Service[]];
      })
      .filter((entry): entry is [string, Service[]] => entry !== null);
  }, [categories, searchQuery, selectedCatFilter]);

  // If user searches, auto-expand categories that have matches
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const newOpen: Record<string, boolean> = {};
      for (const [cat] of filteredCategories) {
        newOpen[cat] = true;
      }
      setOpenCategories(newOpen);
    }
  }, [searchQuery, filteredCategories]);

  // Fetch slots whenever serviceId, dateYmd, or staffId changes
  useEffect(() => {
    if (!serviceId || !dateYmd) return;
    let cancelled = false;
    setLoadingSlots(true);
    setStartsAt("");
    fetch(
      `/api/booking/slots?serviceId=${encodeURIComponent(
        serviceId
      )}&date=${dateYmd}&staffId=${encodeURIComponent(staffId)}`
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

  function scrollToStep(stepNumber: number) {
    const refs: Record<number, React.RefObject<HTMLDivElement | null>> = {
      1: step1Ref,
      2: step2Ref,
      3: step3Ref,
      4: step4Ref,
    };
    setTimeout(() => {
      refs[stepNumber]?.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  function goToStep(nextStep: number) {
    setExpandedStep(nextStep);
    setHighestReachedStep((prev) => Math.max(prev, nextStep));
    scrollToStep(nextStep);
  }

  function toggleCategory(cat: string) {
    setOpenCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  }

  function toggleAllCategories(expand: boolean) {
    const updated: Record<string, boolean> = {};
    for (const [cat] of categories) {
      updated[cat] = expand;
    }
    setOpenCategories(updated);
  }

  function handleSelectService(s: Service) {
    setServiceId(s.id);
    // Ensure this category is open
    setOpenCategories((prev) => ({
      ...prev,
      [s.category]: true,
    }));
  }

  // Quick date shortcuts (Miami time)
  const todayMiami = miamiYmd();
  const minDate = todayMiami;
  const maxDate = addDaysYmd(minDate, 60);

  const dateShortcuts = useMemo(() => {
    return [
      { label: "Hoy", ymd: todayMiami },
      { label: "Mañana", ymd: addDaysYmd(todayMiami, 1) },
      { label: formatShortDate(addDaysYmd(todayMiami, 2)), ymd: addDaysYmd(todayMiami, 2) },
      { label: formatShortDate(addDaysYmd(todayMiami, 3)), ymd: addDaysYmd(todayMiami, 3) },
      { label: formatShortDate(addDaysYmd(todayMiami, 7)), ymd: addDaysYmd(todayMiami, 7) },
    ];
  }, [todayMiami]);

  // Group slots by Morning / Afternoon for fast discovery
  const { morningSlots, afternoonSlots } = useMemo(() => {
    const morning: string[] = [];
    const afternoon: string[] = [];
    for (const iso of slots) {
      const hourStr = new Intl.DateTimeFormat("en-US", {
        timeZone: BOOKING_TZ,
        hour: "numeric",
        hour12: false,
      }).format(new Date(iso));
      const hour = parseInt(hourStr, 10);
      if (hour < 12) {
        morning.push(iso);
      } else {
        afternoon.push(iso);
      }
    }
    return { morningSlots: morning, afternoonSlots: afternoon };
  }, [slots]);

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
      if (!res.ok) throw new Error(data.error || "Error al reservar la cita");
      router.push(`/reservar/exito?id=${encodeURIComponent(data.id)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al procesar la reserva");
    } finally {
      setSubmitting(false);
    }
  }

  // Check which steps are completed
  const isStep1Done = Boolean(selectedService);
  const isStep2Done = Boolean(staffId);
  const isStep3Done = Boolean(startsAt);
  const isStep4Done = Boolean(clientName && clientEmail && startsAt);

  return (
    <div className="booking-wizard">
      {/* Quick Flow Stepper Tracker */}
      <div className="booking-stepper" aria-label="Progreso de reserva">
        {[
          { n: 1, label: "Servicio", done: isStep1Done },
          { n: 2, label: "Profesional", done: isStep2Done },
          { n: 3, label: "Fecha y hora", done: isStep3Done },
          { n: 4, label: "Confirmación", done: isStep4Done },
        ].map(({ n, label, done }) => (
          <button
            key={n}
            type="button"
            className={`booking-stepper__item${
              expandedStep === n ? " is-active" : ""
            }${done ? " is-done" : ""}`}
            onClick={() => {
              if (n <= highestReachedStep || done) {
                goToStep(n);
              }
            }}
            disabled={n > highestReachedStep && !done}
          >
            <span className="booking-stepper__num">
              {done && expandedStep !== n ? "✓" : n}
            </span>
            <span className="booking-stepper__label">{label}</span>
          </button>
        ))}
      </div>

      {/* =========================================================================
          PASO 1: ELIGE EL SERVICIO (COLAPSABLE + CATEGORÍAS COLAPSABLES)
         ========================================================================= */}
      <div
        ref={step1Ref}
        className={`booking-accordion-step${
          expandedStep === 1 ? " is-expanded" : ""
        }${isStep1Done ? " is-completed" : ""}`}
      >
        <button
          type="button"
          className="booking-accordion-step__header"
          onClick={() => setExpandedStep(expandedStep === 1 ? 0 : 1)}
          aria-expanded={expandedStep === 1}
        >
          <div className="booking-accordion-step__info">
            <span
              className={`booking-step-badge${
                isStep1Done && expandedStep !== 1 ? " is-done" : ""
              }${expandedStep === 1 ? " is-active" : ""}`}
            >
              {isStep1Done && expandedStep !== 1 ? "✓" : "1"}
            </span>
            <div>
              <h2 className="booking-accordion-step__title">
                1. Elige tu servicio o tratamiento
              </h2>
              {expandedStep !== 1 && selectedService && (
                <p className="booking-accordion-step__summary">
                  <strong>{selectedService.title}</strong> ·{" "}
                  {formatUsd(selectedService.price_cents)} ·{" "}
                  {selectedService.duration_mins} min
                </p>
              )}
              {expandedStep !== 1 && !selectedService && (
                <p className="booking-accordion-step__summary booking-accordion-step__summary--muted">
                  Haz clic para seleccionar el servicio
                </p>
              )}
            </div>
          </div>
          <div className="booking-accordion-step__action">
            {expandedStep !== 1 && isStep1Done && (
              <span className="booking-change-pill">Cambiar</span>
            )}
            <span
              className={`booking-chevron${
                expandedStep === 1 ? " is-open" : ""
              }`}
              aria-hidden="true"
            >
              ▼
            </span>
          </div>
        </button>

        {expandedStep === 1 && (
          <div className="booking-accordion-step__body">
            {/* Search & Toolbar */}
            <div className="booking-search-row">
              <div className="booking-search-box">
                <span className="booking-search-icon" aria-hidden="true">
                  🔍
                </span>
                <input
                  type="text"
                  className="booking-search-input"
                  placeholder="Buscar servicio (ej. microblading, pestañas, laminado)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="booking-search-clear"
                    onClick={() => setSearchQuery("")}
                    aria-label="Limpiar búsqueda"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="booking-category-pills" role="tablist">
              <button
                type="button"
                className={`booking-cat-pill${
                  selectedCatFilter === "all" ? " is-active" : ""
                }`}
                onClick={() => setSelectedCatFilter("all")}
              >
                Todas ({services.length})
              </button>
              {categories.map(([cat, list]) => (
                <button
                  key={cat}
                  type="button"
                  className={`booking-cat-pill${
                    selectedCatFilter === cat ? " is-active" : ""
                  }`}
                  onClick={() => setSelectedCatFilter(cat)}
                >
                  {cat} ({list.length})
                </button>
              ))}
            </div>

            {/* Toggle all categories buttons */}
            <div className="booking-categories-toolbar">
              <span className="booking-categories-count">
                {filteredCategories.reduce(
                  (acc, [, list]) => acc + list.length,
                  0
                )}{" "}
                servicios encontrados
              </span>
              <div className="booking-categories-actions">
                <button
                  type="button"
                  className="booking-text-btn"
                  onClick={() => toggleAllCategories(true)}
                >
                  Expandir todas
                </button>
                <span className="booking-sep">·</span>
                <button
                  type="button"
                  className="booking-text-btn"
                  onClick={() => toggleAllCategories(false)}
                >
                  Colapsar todas
                </button>
              </div>
            </div>

            {/* Category Accordions List */}
            {filteredCategories.length === 0 ? (
              <div className="booking-empty-search">
                <p>No encontramos servicios con &ldquo;{searchQuery}&rdquo;.</p>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCatFilter("all");
                  }}
                >
                  Ver todos los servicios
                </button>
              </div>
            ) : (
              <div className="booking-cat-accordion-group">
                {filteredCategories.map(([cat, list]) => {
                  const isOpen = Boolean(openCategories[cat]);
                  const hasSelectedService = list.some(
                    (s) => s.id === serviceId
                  );

                  return (
                    <div
                      key={cat}
                      className={`booking-cat-accordion${
                        isOpen ? " is-open" : ""
                      }${hasSelectedService ? " has-selected" : ""}`}
                    >
                      <button
                        type="button"
                        className="booking-cat-accordion__header"
                        onClick={() => toggleCategory(cat)}
                        aria-expanded={isOpen}
                      >
                        <div className="booking-cat-accordion__title-group">
                          <span className="booking-cat-accordion__name">
                            {cat}
                          </span>
                          <span className="booking-cat-accordion__count">
                            {list.length}{" "}
                            {list.length === 1 ? "servicio" : "servicios"}
                          </span>
                          {hasSelectedService && (
                            <span className="booking-selected-tag">
                              ✓ Seleccionado
                            </span>
                          )}
                        </div>
                        <span
                          className={`booking-cat-accordion__chevron${
                            isOpen ? " is-rotated" : ""
                          }`}
                          aria-hidden="true"
                        >
                          ▼
                        </span>
                      </button>

                      {isOpen && (
                        <div className="booking-cat-accordion__content">
                          <div className="booking-options">
                            {list.map((s) => {
                              const isChecked = serviceId === s.id;
                              return (
                                <label
                                  key={s.id}
                                  className={`booking-option${
                                    isChecked ? " is-selected" : ""
                                  }`}
                                  onClick={() => handleSelectService(s)}
                                >
                                  <input
                                    type="radio"
                                    name="service"
                                    checked={isChecked}
                                    onChange={() => handleSelectService(s)}
                                  />
                                  <div className="booking-option__details">
                                    <span className="booking-option__title">
                                      {s.title}
                                    </span>
                                    {s.description && (
                                      <p className="booking-option__desc">
                                        {s.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="booking-option__badge">
                                    <span className="booking-option__price">
                                      {formatUsd(s.price_cents)}
                                    </span>
                                    <span className="booking-option__duration">
                                      {s.duration_mins} min
                                    </span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Step 1 Footer CTA */}
            {selectedService && (
              <div className="booking-step-footer">
                <div className="booking-step-footer__info">
                  <span className="booking-step-footer__label">
                    Servicio seleccionado:
                  </span>
                  <strong className="booking-step-footer__val">
                    {selectedService.title} ({formatUsd(selectedService.price_cents)})
                  </strong>
                </div>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => goToStep(2)}
                >
                  Continuar a Profesional →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          PASO 2: PROFESIONAL (COLAPSABLE)
         ========================================================================= */}
      <div
        ref={step2Ref}
        className={`booking-accordion-step${
          expandedStep === 2 ? " is-expanded" : ""
        }${isStep2Done ? " is-completed" : ""}`}
      >
        <button
          type="button"
          className="booking-accordion-step__header"
          onClick={() => {
            if (isStep1Done) {
              setExpandedStep(expandedStep === 2 ? 0 : 2);
            } else {
              setExpandedStep(1);
            }
          }}
          aria-expanded={expandedStep === 2}
          disabled={!isStep1Done}
        >
          <div className="booking-accordion-step__info">
            <span
              className={`booking-step-badge${
                isStep2Done && expandedStep !== 2 ? " is-done" : ""
              }${expandedStep === 2 ? " is-active" : ""}`}
            >
              {isStep2Done && expandedStep !== 2 ? "✓" : "2"}
            </span>
            <div>
              <h2 className="booking-accordion-step__title">
                2. Selecciona especialista o profesional
              </h2>
              {expandedStep !== 2 && (
                <p className="booking-accordion-step__summary">
                  {staffId === "any"
                    ? "Cualquier profesional disponible (mayor disponibilidad)"
                    : selectedStaff?.name || "Profesional asignado"}
                </p>
              )}
            </div>
          </div>
          <div className="booking-accordion-step__action">
            {expandedStep !== 2 && isStep1Done && (
              <span className="booking-change-pill">Cambiar</span>
            )}
            <span
              className={`booking-chevron${
                expandedStep === 2 ? " is-open" : ""
              }`}
              aria-hidden="true"
            >
              ▼
            </span>
          </div>
        </button>

        {expandedStep === 2 && (
          <div className="booking-accordion-step__body">
            <p className="section__lead" style={{ marginBottom: "1rem" }}>
              Tratamiento: <strong>{selectedService?.title}</strong> (
              {selectedService ? formatUsd(selectedService.price_cents) : ""})
            </p>

            <div className="booking-options">
              <label
                className={`booking-option${
                  staffId === "any" ? " is-selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="staff"
                  checked={staffId === "any"}
                  onChange={() => setStaffId("any")}
                />
                <div className="booking-option__details">
                  <span className="booking-option__title">
                    Cualquier profesional disponible
                  </span>
                  <p className="booking-option__desc">
                    Recomendado para tener más opciones de horarios disponibles en
                    el salón.
                  </p>
                </div>
                <div className="booking-option__badge">
                  <span className="booking-tag-recommended">Recomendado</span>
                </div>
              </label>

              {staff.map((st) => (
                <label
                  key={st.id}
                  className={`booking-option${
                    staffId === st.id ? " is-selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="staff"
                    checked={staffId === st.id}
                    onChange={() => setStaffId(st.id)}
                  />
                  <div className="booking-option__details">
                    <span className="booking-option__title">{st.name}</span>
                    <p className="booking-option__desc">
                      Especialista en Bellas Cejas Miami
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <div className="btn-row" style={{ marginTop: "1.5rem" }}>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => goToStep(1)}
              >
                ← Volver a Servicios
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => goToStep(3)}
              >
                Continuar a Fecha y Hora →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          PASO 3: FECHA Y HORA (COLAPSABLE)
         ========================================================================= */}
      <div
        ref={step3Ref}
        className={`booking-accordion-step${
          expandedStep === 3 ? " is-expanded" : ""
        }${isStep3Done ? " is-completed" : ""}`}
      >
        <button
          type="button"
          className="booking-accordion-step__header"
          onClick={() => {
            if (isStep1Done) {
              setExpandedStep(expandedStep === 3 ? 0 : 3);
            }
          }}
          aria-expanded={expandedStep === 3}
          disabled={!isStep1Done}
        >
          <div className="booking-accordion-step__info">
            <span
              className={`booking-step-badge${
                isStep3Done && expandedStep !== 3 ? " is-done" : ""
              }${expandedStep === 3 ? " is-active" : ""}`}
            >
              {isStep3Done && expandedStep !== 3 ? "✓" : "3"}
            </span>
            <div>
              <h2 className="booking-accordion-step__title">
                3. Fecha y horario en Miami
              </h2>
              {expandedStep !== 3 && startsAt && (
                <p className="booking-accordion-step__summary">
                  <strong>{formatDateHuman(startsAt)}</strong> a las{" "}
                  <strong>{formatSlotLabel(startsAt)}</strong> (Miami)
                </p>
              )}
              {expandedStep !== 3 && !startsAt && (
                <p className="booking-accordion-step__summary booking-accordion-step__summary--muted">
                  Selecciona la fecha y la hora para tu cita
                </p>
              )}
            </div>
          </div>
          <div className="booking-accordion-step__action">
            {expandedStep !== 3 && isStep3Done && (
              <span className="booking-change-pill">Cambiar</span>
            )}
            <span
              className={`booking-chevron${
                expandedStep === 3 ? " is-open" : ""
              }`}
              aria-hidden="true"
            >
              ▼
            </span>
          </div>
        </button>

        {expandedStep === 3 && (
          <div className="booking-accordion-step__body">
            <div className="booking-tz-badge">
              <span>📍 Salón Miami: Doral, FL · Horarios en hora local (EST)</span>
            </div>

            {/* Quick date shortcuts */}
            <div className="booking-date-section">
              <label className="booking-date-label">
                Selecciona una fecha:
              </label>
              <div className="booking-date-shortcuts">
                {dateShortcuts.map((ds) => (
                  <button
                    key={ds.ymd}
                    type="button"
                    className={`booking-date-chip${
                      dateYmd === ds.ymd ? " is-active" : ""
                    }`}
                    onClick={() => setDateYmd(ds.ymd)}
                  >
                    {ds.label}
                  </button>
                ))}
              </div>

              {/* Direct date picker */}
              <div className="booking-field" style={{ marginTop: "0.85rem" }}>
                <input
                  type="date"
                  value={dateYmd}
                  min={minDate}
                  max={maxDate}
                  onChange={(e) => setDateYmd(e.target.value)}
                  className="booking-date-input"
                />
              </div>
            </div>

            {/* Slots display */}
            <div className="booking-slots-container">
              <h4 className="booking-slots-header">
                Horarios disponibles para el {formatDateHuman(dateYmd)}:
              </h4>

              {loadingSlots ? (
                <div className="booking-loading-slots">
                  <span className="booking-spinner" aria-hidden="true"></span>
                  <p>Consultando horarios disponibles en tiempo real…</p>
                </div>
              ) : slots.length === 0 ? (
                <div className="booking-empty-slots">
                  <p>
                    No hay horarios disponibles para esta fecha (el salón puede
                    estar cerrado o con agenda completa).
                  </p>
                  <p className="booking-empty-slots__tip">
                    Te sugerimos probar con el día siguiente o elegir &ldquo;Cualquier
                    profesional&rdquo;.
                  </p>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => setDateYmd(addDaysYmd(dateYmd, 1))}
                  >
                    Probar el día siguiente ({formatShortDate(addDaysYmd(dateYmd, 1))}) →
                  </button>
                </div>
              ) : (
                <div className="booking-slots-sections">
                  {morningSlots.length > 0 && (
                    <div className="booking-slots-block">
                      <h5 className="booking-slots-subhead">
                        ☀️ Mañana (10:00 AM – 12:00 PM)
                      </h5>
                      <div className="booking-slots">
                        {morningSlots.map((iso) => (
                          <button
                            key={iso}
                            type="button"
                            className={`booking-slot${
                              startsAt === iso ? " is-selected" : ""
                            }`}
                            onClick={() => setStartsAt(iso)}
                          >
                            {formatSlotLabel(iso)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {afternoonSlots.length > 0 && (
                    <div className="booking-slots-block">
                      <h5 className="booking-slots-subhead">
                        🌤️ Tarde (12:00 PM – 6:00 PM)
                      </h5>
                      <div className="booking-slots">
                        {afternoonSlots.map((iso) => (
                          <button
                            key={iso}
                            type="button"
                            className={`booking-slot${
                              startsAt === iso ? " is-selected" : ""
                            }`}
                            onClick={() => setStartsAt(iso)}
                          >
                            {formatSlotLabel(iso)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="btn-row" style={{ marginTop: "1.75rem" }}>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => goToStep(2)}
              >
                ← Volver a Profesional
              </button>
              <button
                type="button"
                className="btn btn--primary"
                disabled={!startsAt}
                onClick={() => goToStep(4)}
              >
                Continuar a Confirmación →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          PASO 4: DATOS DE CONTACTO Y CONFIRMACIÓN (COLAPSABLE)
         ========================================================================= */}
      <div
        ref={step4Ref}
        className={`booking-accordion-step${
          expandedStep === 4 ? " is-expanded" : ""
        }${isStep4Done ? " is-completed" : ""}`}
      >
        <button
          type="button"
          className="booking-accordion-step__header"
          onClick={() => {
            if (isStep1Done && startsAt) {
              setExpandedStep(expandedStep === 4 ? 0 : 4);
            }
          }}
          aria-expanded={expandedStep === 4}
          disabled={!startsAt}
        >
          <div className="booking-accordion-step__info">
            <span
              className={`booking-step-badge${
                isStep4Done && expandedStep !== 4 ? " is-done" : ""
              }${expandedStep === 4 ? " is-active" : ""}`}
            >
              {isStep4Done && expandedStep !== 4 ? "✓" : "4"}
            </span>
            <div>
              <h2 className="booking-accordion-step__title">
                4. Tus datos y confirmación
              </h2>
              {expandedStep !== 4 && clientName && (
                <p className="booking-accordion-step__summary">
                  {clientName} · {clientEmail}
                </p>
              )}
              {expandedStep !== 4 && !clientName && (
                <p className="booking-accordion-step__summary booking-accordion-step__summary--muted">
                  Ingresa tus datos para registrar y confirmar tu cita
                </p>
              )}
            </div>
          </div>
          <div className="booking-accordion-step__action">
            <span
              className={`booking-chevron${
                expandedStep === 4 ? " is-open" : ""
              }`}
              aria-hidden="true"
            >
              ▼
            </span>
          </div>
        </button>

        {expandedStep === 4 && (
          <div className="booking-accordion-step__body">
            {/* Appointment Summary Box */}
            <div className="booking-summary-box">
              <h3 className="booking-summary-title">Resumen de tu cita</h3>
              <div className="booking-summary-grid">
                <div className="booking-summary-item">
                  <span className="booking-summary-lbl">Servicio:</span>
                  <strong>{selectedService?.title}</strong>
                </div>
                <div className="booking-summary-item">
                  <span className="booking-summary-lbl">Duración:</span>
                  <span>{selectedService?.duration_mins} minutos</span>
                </div>
                <div className="booking-summary-item">
                  <span className="booking-summary-lbl">Precio estimado:</span>
                  <strong className="booking-price-highlight">
                    {selectedService ? formatUsd(selectedService.price_cents) : ""}
                  </strong>
                </div>
                <div className="booking-summary-item">
                  <span className="booking-summary-lbl">Especialista:</span>
                  <span>
                    {staffId === "any"
                      ? "Cualquier profesional disponible"
                      : selectedStaff?.name}
                  </span>
                </div>
                <div className="booking-summary-item">
                  <span className="booking-summary-lbl">Fecha y hora:</span>
                  <strong>
                    {startsAt ? formatDateHuman(startsAt) : dateYmd} a las{" "}
                    {startsAt ? formatSlotLabel(startsAt) : ""}
                  </strong>
                </div>
                <div className="booking-summary-item">
                  <span className="booking-summary-lbl">Ubicación:</span>
                  <span>11402 NW 41 St, Doral FL 33178 (Suites 218 / 107)</span>
                </div>
              </div>
              <div className="booking-summary-note">
                💳 <strong>Pagas en el salón</strong> — No requerimos pago por
                adelantado en el sitio web.
              </div>
            </div>

            {/* Client input fields */}
            <div className="booking-form-fields">
              <label className="booking-field">
                <span>Nombre completo *</span>
                <input
                  type="text"
                  placeholder="Ej. María Pérez"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </label>

              <label className="booking-field">
                <span>Correo electrónico *</span>
                <input
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  required
                />
                <small className="booking-field-hint">
                  Te enviaremos los detalles y confirmación de la cita a este
                  email.
                </small>
              </label>

              <label className="booking-field">
                <span>Teléfono / WhatsApp *</span>
                <input
                  type="tel"
                  placeholder="+1 (786) 000-0000"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  required
                />
                <small className="booking-field-hint">
                  Para contactarte en caso de requerir coordinar tu cita o
                  enviarte un recordatorio.
                </small>
              </label>

              <label className="booking-field">
                <span>Notas o indicaciones especiales (opcional)</span>
                <textarea
                  rows={3}
                  placeholder="¿Alguna condición, alergia, preferencia o trabajo anterior en tus cejas/pestañas?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </label>
            </div>

            {error && <p className="booking-error">{error}</p>}

            <div className="btn-row" style={{ marginTop: "1.75rem" }}>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => goToStep(3)}
                disabled={submitting}
              >
                ← Cambiar fecha u horario
              </button>
              <button
                type="button"
                className="btn btn--primary"
                disabled={submitting || !clientName || !clientEmail || !clientPhone}
                onClick={submit}
              >
                {submitting ? "Confirmando reserva…" : "Confirmar reserva"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
