"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SectionNav } from "./section-nav";
import {
  IdentidadSection,
  UbicacionSection,
  PricingSection,
  FotosSection,
  AnexosSection,
  EstadoSection,
} from "./sections";
import {
  SECTION_IDS,
  DEFAULT_FORM,
  type SectionId,
  type SpaceFormData,
  type AnnexFormData,
  type SpaceImage,
} from "./types";
import { createClient } from "@/lib/supabase/client";
import type { Venue, VenueAnnex } from "@/types/database";

interface SpaceFormProps {
  venue?: Venue;
  annexes?: VenueAnnex[];
}

function annexToForm(annex: VenueAnnex): AnnexFormData {
  return {
    id: annex.id,
    existing: true,
    nombre: annex.nombre,
    config_de_pie: annex.config_de_pie?.toString() || "",
    config_sentado: annex.config_sentado?.toString() || "",
    metros_cuadrados: annex.metros_cuadrados?.toString() || "",
    tipo_espacio: annex.tipo_espacio || "",
    tipos_evento: annex.tipos_evento || [],
    images: (annex.images || []).map((img) => ({
      url: img.url,
      tag: img.tag,
      label: img.label,
      order: img.order,
    })),
    precio_desde: annex.precio_desde?.toString() || "",
    precio_hasta: annex.precio_hasta?.toString() || "",
    unidad_precio: annex.unidad_precio || "evento",
    precio_referencia_interno: annex.precio_referencia_interno?.toString() || "",
    orden: annex.orden ?? 0,
  };
}

export function SpaceForm({ venue, annexes }: SpaceFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<SpaceFormData>(() => {
    if (!venue) return DEFAULT_FORM;
    return {
      nombre: venue.nombre || "",
      slug: venue.slug || "",
      descripcion_corta: venue.descripcion_corta || "",
      descripcion: venue.descripcion || "",
      web: venue.web || "",
      instagram: venue.instagram || "",
      pais: venue.pais || "España",
      ciudad: venue.ciudad || "",
      barrio: venue.barrio || "",
      direccion: venue.direccion || "",
      mostrar_direccion: venue.mostrar_direccion ?? false,
      coordenadas: venue.coordenadas || null,
      precio_desde: venue.precio_desde?.toString() || "",
      precio_hasta: venue.precio_hasta?.toString() || "",
      unidad_precio: venue.unidad_precio || "evento",
      precio_referencia_interno: venue.precio_referencia_interno?.toString() || "",
      images: venue.images || [],
      estado: venue.estado || "borrador",
      annexes: (annexes || [])
        .slice()
        .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
        .map(annexToForm),
      annexesToDelete: [],
    };
  });
  const [activeSection, setActiveSection] = useState<SectionId>("identidad");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  function update(field: keyof SpaceFormData, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
    setError(null);
  }

  const handleScroll = useCallback(() => {
    const container = formRef.current;
    if (!container) return;

    for (const id of [...SECTION_IDS].reverse()) {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120) {
          setActiveSection(id);
          break;
        }
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  async function uploadImages(
    supabase: ReturnType<typeof createClient>,
    pathPrefix: string,
    images: SpaceImage[]
  ): Promise<SpaceImage[]> {
    const uploaded: SpaceImage[] = [];

    for (const img of images) {
      if (img.file) {
        const ext = img.file.name.split(".").pop() || "jpg";
        const path = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from("venues")
          .upload(path, img.file, { contentType: img.file.type });

        if (!uploadErr) {
          const { data: urlData } = supabase.storage
            .from("venues")
            .getPublicUrl(path);

          uploaded.push({
            url: urlData.publicUrl,
            tag: img.tag,
            label: img.label,
            order: img.order,
          });
        }
      } else {
        uploaded.push({
          url: img.url,
          tag: img.tag,
          label: img.label,
          order: img.order,
        });
      }
    }

    return uploaded;
  }

  function toNumber(value: string): number | null {
    if (value === "" || value === null || value === undefined) return null;
    const n = parseFloat(value);
    return isNaN(n) ? null : n;
  }

  function toInt(value: string): number | null {
    if (value === "" || value === null || value === undefined) return null;
    const n = parseInt(value);
    return isNaN(n) ? null : n;
  }

  async function handleSave() {
    if (form.annexes.length === 0) {
      setError("El espacio necesita al menos un anexo.");
      return;
    }

    setSaving(true);
    setError(null);
    const supabase = createClient();

    const venueId = venue?.id || crypto.randomUUID();

    try {
      const uploadedVenueImages = await uploadImages(
        supabase,
        venueId,
        form.images
      );

      const venuePayload = {
        nombre: form.nombre,
        slug: form.slug || null,
        descripcion_corta: form.descripcion_corta || null,
        descripcion: form.descripcion || null,
        web: form.web || null,
        instagram: form.instagram || null,
        ciudad: form.ciudad || null,
        barrio: form.barrio || null,
        pais: form.pais || null,
        direccion: form.direccion || null,
        mostrar_direccion: form.mostrar_direccion,
        coordenadas: form.coordenadas,
        precio_desde: toNumber(form.precio_desde),
        precio_hasta: toNumber(form.precio_hasta),
        unidad_precio: form.unidad_precio,
        precio_referencia_interno: toNumber(form.precio_referencia_interno),
        images: uploadedVenueImages,
        estado: form.estado,
      };

      if (venue) {
        const { error: updateErr } = await supabase
          .from("venues")
          .update(venuePayload)
          .eq("id", venue.id);
        if (updateErr) throw updateErr;
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const { error: insertErr } = await supabase
          .from("venues")
          .insert({ id: venueId, ...venuePayload, owner_id: user!.id });
        if (insertErr) throw insertErr;
      }

      if (form.annexesToDelete.length > 0) {
        const { error: deleteErr } = await supabase
          .from("venue_annexes")
          .delete()
          .in("id", form.annexesToDelete);
        if (deleteErr) throw deleteErr;
      }

      for (const [index, annex] of form.annexes.entries()) {
        const uploadedAnnexImages = await uploadImages(
          supabase,
          `${venueId}/annexes/${annex.id}`,
          annex.images
        );

        const annexPayload = {
          venue_id: venueId,
          nombre: annex.nombre,
          config_de_pie: toInt(annex.config_de_pie),
          config_sentado: toInt(annex.config_sentado),
          metros_cuadrados: toNumber(annex.metros_cuadrados),
          tipo_espacio: annex.tipo_espacio || null,
          tipos_evento: annex.tipos_evento,
          images: uploadedAnnexImages,
          precio_desde: toNumber(annex.precio_desde),
          precio_hasta: toNumber(annex.precio_hasta),
          unidad_precio: annex.unidad_precio,
          precio_referencia_interno: toNumber(annex.precio_referencia_interno),
          orden: index,
        };

        if (annex.existing) {
          const { error: updateErr } = await supabase
            .from("venue_annexes")
            .update(annexPayload)
            .eq("id", annex.id);
          if (updateErr) throw updateErr;
        } else {
          const { error: insertErr } = await supabase
            .from("venue_annexes")
            .insert({ id: annex.id, ...annexPayload });
          if (insertErr) throw insertErr;
        }
      }

      setSaving(false);
      setDirty(false);
      router.push("/admin/espacios");
      router.refresh();
    } catch (e) {
      setSaving(false);
      setError(e instanceof Error ? e.message : "Error al guardar");
    }
  }

  const sectionProps = { form, update };

  return (
    <div>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background px-8 py-4">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <button
            type="button"
            onClick={() => router.push("/admin/espacios")}
            className="hover:text-text-primary"
          >
            Espacios
          </button>
          <span>/</span>
          <span className="text-text-primary font-medium">
            {venue ? form.nombre || "Editar espacio" : "Nuevo espacio"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {error && <span className="text-xs text-error">{error}</span>}
          {dirty && !error && (
            <span className="text-xs text-warning">Borrador sin guardar</span>
          )}
          <Button
            variant="secondary"
            onClick={() => router.push("/admin/espacios")}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || !form.nombre}>
            {saving ? "Guardando..." : "Guardar espacio"}
          </Button>
        </div>
      </div>

      <div className="flex gap-8 px-8 py-6">
        <div className="w-48 shrink-0">
          <SectionNav activeSection={activeSection} form={form} />
        </div>

        <div ref={formRef} className="flex-1 max-w-3xl space-y-6">
          <IdentidadSection {...sectionProps} />
          <UbicacionSection {...sectionProps} />
          <PricingSection {...sectionProps} />
          <FotosSection {...sectionProps} />
          <AnexosSection {...sectionProps} />
          <EstadoSection {...sectionProps} />

          <p className="text-center text-sm text-text-muted py-4">
            Has llegado al final del formulario
          </p>
        </div>
      </div>
    </div>
  );
}
