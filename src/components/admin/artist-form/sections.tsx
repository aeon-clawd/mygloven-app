"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { type ArtistFormData } from "./types";
import { PhotosSection } from "./photos-section";

interface SectionProps {
  form: ArtistFormData;
  update: (field: keyof ArtistFormData, value: unknown) => void;
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm text-text-secondary">
      {children}
      {required && <span className="text-error ml-0.5">*</span>}
    </label>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-text-muted mt-1">{subtitle}</p>
    </div>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function IdentidadSection({ form, update }: SectionProps) {
  return (
    <section id="identidad" className="scroll-mt-24 rounded-xl border border-border bg-surface p-6">
      <SectionHeader
        title="Identidad"
        subtitle="Información básica del artista"
      />
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label required>Nombre artístico</Label>
            <Input
              value={form.nombre}
              onChange={(e) => {
                update("nombre", e.target.value);
                if (!form.slug || form.slug === slugify(form.nombre)) {
                  update("slug", slugify(e.target.value));
                }
              }}
              placeholder="Ej: Bad Gyal"
            />
          </div>
          <div>
            <Label>Slug / URL</Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted whitespace-nowrap">mygloven.com/artistas/</span>
              <Input
                value={form.slug}
                onChange={(e) => update("slug", slugify(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div>
          <Label required>Descripción corta</Label>
          <Input
            value={form.descripcion_corta}
            onChange={(e) => update("descripcion_corta", e.target.value)}
            placeholder="1-2 frases que resuman al artista"
            maxLength={200}
          />
          <p className="text-xs text-text-muted mt-1 text-right">{form.descripcion_corta.length}/200</p>
        </div>

        <div>
          <Label required>Bio</Label>
          <Textarea
            value={form.bio}
            onChange={(e) => update("bio", e.target.value)}
            placeholder="Bio detallada: trayectoria, propuesta, destacados..."
            className="min-h-[120px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Género musical</Label>
            <Input
              value={form.genero_musical}
              onChange={(e) => update("genero_musical", e.target.value)}
              placeholder="Ej: Reggaeton, House, Indie..."
            />
          </div>
          <div>
            <Label>Email de contacto</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="booking@artista.com"
            />
          </div>
        </div>

        <div className="max-w-xs">
          <Label>Teléfono de contacto</Label>
          <Input
            value={form.telefono}
            onChange={(e) => update("telefono", e.target.value)}
            placeholder="+34 ..."
          />
        </div>
      </div>
    </section>
  );
}

export function RedesSection({ form, update }: SectionProps) {
  return (
    <section id="redes" className="scroll-mt-24 rounded-xl border border-border bg-surface p-6">
      <SectionHeader
        title="Redes y enlaces"
        subtitle="Todos opcionales. Solo se mostrarán los que rellenes."
      />
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Instagram</Label>
            <div className="flex">
              <span className="flex items-center rounded-l-lg border border-r-0 border-border bg-background px-3 text-sm text-text-muted">@</span>
              <Input
                value={form.instagram}
                onChange={(e) => update("instagram", e.target.value)}
                placeholder="usuario"
                className="rounded-l-none"
              />
            </div>
          </div>
          <div>
            <Label>Spotify</Label>
            <Input
              value={form.spotify}
              onChange={(e) => update("spotify", e.target.value)}
              placeholder="https://open.spotify.com/artist/..."
            />
          </div>
          <div>
            <Label>SoundCloud</Label>
            <Input
              value={form.soundcloud}
              onChange={(e) => update("soundcloud", e.target.value)}
              placeholder="https://soundcloud.com/..."
            />
          </div>
          <div>
            <Label>YouTube</Label>
            <Input
              value={form.youtube}
              onChange={(e) => update("youtube", e.target.value)}
              placeholder="https://youtube.com/@..."
            />
          </div>
          <div>
            <Label>Web</Label>
            <Input
              value={form.web}
              onChange={(e) => update("web", e.target.value)}
              placeholder="https://"
            />
          </div>
          <div>
            <Label>Linktree</Label>
            <Input
              value={form.linktree}
              onChange={(e) => update("linktree", e.target.value)}
              placeholder="https://linktr.ee/..."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function FotosSection({ form, update }: SectionProps) {
  return (
    <section id="fotos" className="scroll-mt-24 rounded-xl border border-border bg-surface p-6">
      <SectionHeader
        title="Fotos"
        subtitle="Mínimo 2 fotos. Se requiere una etiquetada como Principal."
      />
      <PhotosSection
        images={form.images}
        onChange={(images) => update("images", images)}
      />
    </section>
  );
}

export function EstadoSection({ form, update }: SectionProps) {
  return (
    <section id="estado" className="scroll-mt-24 rounded-xl border border-border bg-surface p-6">
      <SectionHeader
        title="Estado"
        subtitle="Controla la visibilidad del artista en la plataforma"
      />
      <div className="space-y-4">
        <div className="max-w-xs">
          <Label required>Estado del artista</Label>
          <Select
            value={form.estado}
            onChange={(e) => update("estado", e.target.value)}
          >
            <option value="borrador">Borrador</option>
            <option value="activo">Activo</option>
            <option value="pausado">Pausado</option>
            <option value="eliminado">Eliminado</option>
          </Select>
        </div>
      </div>
    </section>
  );
}
