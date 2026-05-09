"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SectionNav } from "./section-nav";
import {
  IdentidadSection,
  RedesSection,
  FotosSection,
  EstadoSection,
} from "./sections";
import {
  SECTION_IDS,
  DEFAULT_FORM,
  type SectionId,
  type ArtistFormData,
  type ArtistImage,
} from "./types";
import { createClient } from "@/lib/supabase/client";
import type { Artista } from "@/types/database";

interface ArtistFormProps {
  artist?: Artista;
}

export function ArtistForm({ artist }: ArtistFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ArtistFormData>(() => {
    if (!artist) return DEFAULT_FORM;
    return {
      nombre: artist.nombre || "",
      slug: artist.slug || "",
      descripcion_corta: artist.descripcion_corta || "",
      bio: artist.bio || "",
      genero_musical: artist.genero_musical || "",
      instagram: artist.instagram || "",
      spotify: artist.spotify || "",
      soundcloud: artist.soundcloud || "",
      youtube: artist.youtube || "",
      web: artist.web || "",
      linktree: artist.linktree || "",
      email: artist.email || "",
      telefono: artist.telefono || "",
      images: (artist.images || []).map((img) => ({
        url: img.url,
        tag: img.tag,
        label: img.label,
        order: img.order,
      })),
      estado: artist.estado || "borrador",
    };
  });
  const [activeSection, setActiveSection] = useState<SectionId>("identidad");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  function update(field: keyof ArtistFormData, value: unknown) {
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
    images: ArtistImage[]
  ): Promise<ArtistImage[]> {
    const uploaded: ArtistImage[] = [];

    for (const img of images) {
      if (img.file) {
        const ext = img.file.name.split(".").pop() || "jpg";
        const path = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from("artists")
          .upload(path, img.file, { contentType: img.file.type });

        if (!uploadErr) {
          const { data: urlData } = supabase.storage
            .from("artists")
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
    setError(null);
    const supabase = createClient();

    const artistId = artist?.id || crypto.randomUUID();

    try {
      const uploadedImages = await uploadImages(supabase, artistId, form.images);

      const payload = {
        nombre: form.nombre,
        slug: form.slug || null,
        descripcion_corta: form.descripcion_corta || null,
        bio: form.bio || null,
        genero_musical: form.genero_musical || null,
        instagram: form.instagram || null,
        spotify: form.spotify || null,
        soundcloud: form.soundcloud || null,
        youtube: form.youtube || null,
        web: form.web || null,
        linktree: form.linktree || null,
        email: form.email || null,
        telefono: form.telefono || null,
        images: uploadedImages,
        estado: form.estado,
      };

      if (artist) {
        const { error: updateErr } = await supabase
          .from("artistas")
          .update(payload)
          .eq("id", artist.id);
        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase
          .from("artistas")
          .insert({ id: artistId, ...payload, owner_id: null });
        if (insertErr) throw insertErr;
      }

      setSaving(false);
      setDirty(false);
      router.push("/admin/artistas");
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
            onClick={() => router.push("/admin/artistas")}
            className="hover:text-text-primary"
          >
            Artistas
          </button>
          <span>/</span>
          <span className="text-text-primary font-medium">
            {artist ? form.nombre || "Editar artista" : "Nuevo artista"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {error && <span className="text-xs text-error">{error}</span>}
          {dirty && !error && (
            <span className="text-xs text-warning">Borrador sin guardar</span>
          )}
          <Button
            variant="secondary"
            onClick={() => router.push("/admin/artistas")}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || !form.nombre}>
            {saving ? "Guardando..." : "Guardar artista"}
          </Button>
        </div>
      </div>

      <div className="flex gap-8 px-8 py-6">
        <div className="w-48 shrink-0">
          <SectionNav activeSection={activeSection} form={form} />
        </div>

        <div ref={formRef} className="flex-1 max-w-3xl space-y-6">
          <IdentidadSection {...sectionProps} />
          <RedesSection {...sectionProps} />
          <FotosSection {...sectionProps} />
          <EstadoSection {...sectionProps} />

          <p className="text-center text-sm text-text-muted py-4">
            Has llegado al final del formulario
          </p>
        </div>
      </div>
    </div>
  );
}
