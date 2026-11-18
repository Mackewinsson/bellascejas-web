"use client";

import { useMemo, useState } from "react";
import type { Service } from "@/lib/booking/types";
import { formatUsd } from "@/lib/booking/types";
import { actionUpdateService } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  services: Service[];
  availableImages: string[];
};

export function ServicesManager({ services, availableImages }: Props) {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const s of services) {
      if (s.category) set.add(s.category);
    }
    return Array.from(set).sort();
  }, [services]);

  // Filtered services
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services.filter((s) => {
      const matchCat = selectedCat === "all" || s.category === selectedCat;
      const matchSearch =
        !q ||
        s.title.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        s.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [services, search, selectedCat]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>, serviceId: string) {
    e.preventDefault();
    setSavingId(serviceId);
    setSavedSuccessId(null);
    try {
      const formData = new FormData(e.currentTarget);
      await actionUpdateService(formData);
      setSavedSuccessId(serviceId);
      setTimeout(() => {
        setSavedSuccessId((prev) => (prev === serviceId ? null : prev));
      }, 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al guardar el servicio");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Category Filters */}
      <div className="bg-card border rounded-lg p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Input
              placeholder="Buscar servicio por nombre o descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-8"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>
          <div className="text-xs text-muted-foreground self-center">
            Mostrando <strong>{filtered.length}</strong> de {services.length} servicios
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => setSelectedCat("all")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedCat === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Todas ({services.length})
          </button>
          {categories.map((cat) => {
            const count = services.filter((s) => s.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedCat === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Services List / Forms */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg text-muted-foreground">
          No se encontraron servicios con &ldquo;{search}&rdquo;.
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((s) => (
            <ServiceCardForm
              key={s.id}
              service={s}
              availableImages={availableImages}
              isSaving={savingId === s.id}
              isSaved={savedSuccessId === s.id}
              onSubmit={(e) => handleSubmit(e, s.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ServiceCardForm({
  service,
  availableImages,
  isSaving,
  isSaved,
  onSubmit,
}: {
  service: Service;
  availableImages: string[];
  isSaving: boolean;
  isSaved: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const [selectedImage, setSelectedImage] = useState<string>(
    service.image_url || ""
  );

  return (
    <form
      onSubmit={onSubmit}
      className={`border rounded-lg bg-card p-4 transition-all ${
        isSaved ? "ring-2 ring-emerald-500/50" : ""
      }`}
    >
      <input type="hidden" name="id" value={service.id} />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full ${
              service.active ? "bg-emerald-500" : "bg-zinc-400"
            }`}
          />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {service.category || "General"}
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs font-mono text-muted-foreground">
            /{service.slug}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            {formatUsd(service.price_cents)}
          </span>
          {isSaved && (
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
              ✓ Guardado y reflejado en web
            </span>
          )}
        </div>
      </div>

      {/* Form Grid */}
      <div className="grid gap-4 md:grid-cols-12">
        {/* Title */}
        <div className="space-y-1.5 md:col-span-8">
          <Label className="text-xs">Título del servicio</Label>
          <Input name="title" defaultValue={service.title} required />
        </div>

        {/* Category */}
        <div className="space-y-1.5 md:col-span-4">
          <Label className="text-xs">Categoría</Label>
          <Input name="category" defaultValue={service.category} required />
        </div>

        {/* Price & Duration */}
        <div className="space-y-1.5 md:col-span-3">
          <Label className="text-xs">Precio USD ($)</Label>
          <Input
            name="priceUsd"
            type="number"
            step="1"
            min="0"
            defaultValue={Math.round(service.price_cents / 100)}
            required
          />
        </div>

        <div className="space-y-1.5 md:col-span-3">
          <Label className="text-xs">Duración (min)</Label>
          <Input
            name="durationMins"
            type="number"
            step="5"
            min="15"
            defaultValue={service.duration_mins}
            required
          />
        </div>

        {/* Image selector from Public */}
        <div className="space-y-1.5 md:col-span-6">
          <Label className="text-xs flex items-center justify-between">
            <span>Imagen (desde carpeta /public)</span>
            <span className="text-[10px] text-muted-foreground">
              Sin subir archivos, toma de /public/images
            </span>
          </Label>
          <div className="flex items-center gap-2">
            <select
              name="imageUrl"
              value={selectedImage}
              onChange={(e) => setSelectedImage(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Sin imagen específica</option>
              {availableImages.map((imgPath) => (
                <option key={imgPath} value={imgPath}>
                  {imgPath}
                </option>
              ))}
            </select>

            {selectedImage ? (
              <div className="w-10 h-9 rounded border overflow-hidden flex-shrink-0 bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedImage}
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5 md:col-span-12">
          <Label className="text-xs">
            Descripción breve (se muestra en Landing Page y en /reservar)
          </Label>
          <Input
            name="description"
            defaultValue={service.description}
            placeholder="Breve detalle del procedimiento y beneficios..."
          />
        </div>
      </div>

      {/* Footer controls */}
      <div className="mt-4 pt-3 border-t flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            name="active"
            defaultChecked={service.active}
            className="rounded border-input text-primary focus:ring-primary h-4 w-4"
          />
          <span className="font-medium">
            Mostrar y permitir reservar en la web
          </span>
        </label>

        <Button type="submit" size="sm" disabled={isSaving}>
          {isSaving ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
