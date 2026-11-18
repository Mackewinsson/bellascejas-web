"use client";

import { useState } from "react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo enviar el mensaje.");
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        marginTop: "2.5rem",
        padding: "2rem",
        background: "var(--background-elevated)",
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
        maxWidth: "600px",
      }}
    >
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.5rem",
          marginBottom: "0.5rem",
          color: "var(--foreground)",
        }}
      >
        Escríbenos tu Consulta
      </h3>
      <p
        style={{
          fontSize: "0.95rem",
          color: "var(--muted)",
          marginBottom: "1.5rem",
        }}
      >
        Déjanos tus datos y te responderemos a la brevedad con la información que necesitas.
      </p>

      {success ? (
        <div
          style={{
            padding: "1rem 1.25rem",
            background: "var(--surface-soft)",
            border: "1px solid var(--accent)",
            borderRadius: "var(--radius)",
            color: "var(--foreground)",
            marginBottom: "1rem",
            fontSize: "0.95rem",
          }}
        >
          <strong style={{ color: "var(--accent)" }}>¡Mensaje enviado con éxito!</strong>
          <p style={{ marginTop: "0.25rem", color: "var(--muted)" }}>
            Gracias por contactar a Bellas Cejas. Nuestro equipo se comunicará contigo pronto.
          </p>
        </div>
      ) : null}

      {error ? (
        <div
          style={{
            padding: "0.75rem 1rem",
            background: "rgba(155, 58, 69, 0.1)",
            border: "1px solid var(--danger)",
            borderRadius: "var(--radius)",
            color: "var(--danger)",
            marginBottom: "1rem",
            fontSize: "0.9rem",
          }}
        >
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
        <label className="booking-field">
          <span>Nombre completo *</span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre y apellido"
            disabled={submitting}
          />
        </label>

        <label className="booking-field">
          <span>Correo electrónico *</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ejemplo@correo.com"
            disabled={submitting}
          />
        </label>

        <label className="booking-field">
          <span>Teléfono / WhatsApp</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 786-000-0000"
            disabled={submitting}
          />
        </label>

        <label className="booking-field">
          <span>Mensaje o Consulta</span>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="¿En qué servicio o curso estás interesada?"
            disabled={submitting}
          />
        </label>

        <button
          type="submit"
          className="btn btn--primary"
          disabled={submitting}
          style={{ marginTop: "0.5rem", cursor: submitting ? "not-allowed" : "pointer" }}
        >
          {submitting ? "Enviando mensaje..." : "Enviar Consulta"}
        </button>
      </form>
    </div>
  );
}
