"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SectionNav } from "./section-nav";
import {
  IdentidadSection,
  UbicacionSection,
  CapacidadSection,
  TipoDeUsoSection,
  PricingSection,
  FotosSection,
  ContactoSection,
  EstadoSection,
} from "./sections";
import { SECTION_IDS, DEFAULT_FORM, type SectionId, type SpaceFormData } from "./types";
import { createClient } from "@/lib/supabase/client";
import type { Venue } from "@/types/database";

interface SpaceFormProps {
  venue?: Venue;
}

export function SpaceForm({ venue }: SpaceFormProps) {
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
      pais: (venue as unknown as Record<string, unknown>).pais as string || "España",
      ciudad: venue.ciudad || "",
      barrio: (venue as unknown as Record<string, unknown>).barrio as string || "",
      direccion: venue.direccion || "",
      mostrar_direccion: venue.mostrar_direccion ?? false,
      coordenadas: venue.coordenadas || null,
      config_de_pie: venue.config_de_pie?.toString() || "",
      config_sentado: venue.config_sentado?.toString() || "",
      metros_cuadrados: venue.metros_cuadrados?.toString() || "",
      tipo_espacio: venue.tipo_espacio || "",
      zonas: venue.zonas || [],
      tipos_evento: venue.tipos_evento || [],
      precio_desde: venue.precio_desde?.toString() || "",
      precio_hasta: venue.precio_hasta?.toString() || "",
      unidad_precio: venue.unidad_precio || "evento",
      precio_referencia_interno: venue.precio_referencia_interno?.toString() || "",
      images: venue.images || [],
      nombre_gestor: (venue as unknown as Record<string, unknown>).nombre_gestor as string || "",
      email_interno: venue.email_interno || "",
      telefono_interno: venue.telefono_interno || "",
      notas_internas: (venue as unknown as Record<string, unknown>).notas_internas as string || "",
      estado: venue.estado || "borrador",
    };
  });
  const [activeSection, setActiveSection] = useState<SectionId>("identidad");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  function update(field: keyof SpaceFormData, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
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

  async function uploadImages(supabase: ReturnType<typeof createClient>, venueId: string) {
    const uploaded: SpaceFormData["images"] = [];

    for (const img of form.images) {
      if (img.file) {
        const ext = img.file.name.split(".").pop() || "jpg";
        const path = `${venueId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error } = await supabase.storage
          .from("venues")
          .upload(path, img.file, { contentType: img.file.type });

        if (!error) {
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

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();

    const venueId = venue?.id || crypto.randomUUID();

    const uploadedImages = await uploadImages(supabase, venueId);

    const payload = {
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
      config_de_pie: form.config_de_pie ? parseInt(form.config_de_pie) : null,
      config_sentado: form.config_sentado ? parseInt(form.config_sentado) : null,
      metros_cuadrados: form.metros_cuadrados ? parseFloat(form.metros_cuadrados) : null,
      tipo_espacio: form.tipo_espacio || null,
      zonas: form.zonas,
      tipos_evento: form.tipos_evento,
      precio_desde: form.precio_desde ? parseFloat(form.precio_desde) : null,
      precio_hasta: form.precio_hasta ? parseFloat(form.precio_hasta) : null,
      unidad_precio: form.unidad_precio,
      precio_referencia_interno: form.precio_referencia_interno
        ? parseFloat(form.precio_referencia_interno)
        : null,
      images: uploadedImages,
      nombre_gestor: form.nombre_gestor || null,
      email_interno: form.email_interno || null,
      telefono_interno: form.telefono_interno || null,
      notas_internas: form.notas_internas || null,
      estado: form.estado,
    };

    if (venue) {
      await supabase.from("venues").update(payload).eq("id", venue.id);
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      await supabase
        .from("venues")
        .insert({ id: venueId, ...payload, owner_id: user!.id });
    }

    setSaving(false);
    setDirty(false);
    router.push("/admin/espacios");
    router.refresh();
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
          {dirty && (
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
          <CapacidadSection {...sectionProps} />
          <TipoDeUsoSection {...sectionProps} />
          <PricingSection {...sectionProps} />
          <FotosSection {...sectionProps} />
          <ContactoSection {...sectionProps} />
          <EstadoSection {...sectionProps} />

          <p className="text-center text-sm text-text-muted py-4">
            Has llegado al final del formulario
          </p>
        </div>
      </div>
    </div>
  );
}
