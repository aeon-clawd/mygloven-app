"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Chips } from "@/components/ui/chips";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  type SpaceFormData,
  type AnnexFormData,
  DEFAULT_ANNEX,
  TIPOS_EVENTO_OPTIONS,
  TIPO_ESPACIO_OPTIONS,
} from "./types";
import { PhotosSection } from "./photos-section";

interface SectionProps {
  form: SpaceFormData;
  update: (field: keyof SpaceFormData, value: unknown) => void;
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
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function IdentidadSection({ form, update }: SectionProps) {
  return (
    <section id="identidad" className="scroll-mt-24 rounded-xl border border-border bg-surface p-6">
      <SectionHeader
        title="Identidad"
        subtitle="Información básica del espacio que verán los productores"
      />
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label required>Nombre del espacio</Label>
            <Input
              value={form.nombre}
              onChange={(e) => {
                update("nombre", e.target.value);
                if (!form.slug || form.slug === slugify(form.nombre)) {
                  update("slug", slugify(e.target.value));
                }
              }}
              placeholder="Ej: Sala Apolo"
            />
          </div>
          <div>
            <Label>Slug / URL</Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted whitespace-nowrap">mygloven.com/espacios/</span>
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
            placeholder="1-2 frases que resuman el espacio"
            maxLength={200}
          />
          <p className="text-xs text-text-muted mt-1 text-right">{form.descripcion_corta.length}/200</p>
        </div>

        <div>
          <Label required>Descripción larga</Label>
          <Textarea
            value={form.descripcion}
            onChange={(e) => update("descripcion", e.target.value)}
            placeholder="Descripción detallada del espacio, su ambiente, qué lo hace especial..."
            className="min-h-[120px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Web</Label>
            <Input
              value={form.web}
              onChange={(e) => update("web", e.target.value)}
              placeholder="https://"
            />
          </div>
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
        </div>
      </div>
    </section>
  );
}

export function UbicacionSection({ form, update }: SectionProps) {
  return (
    <section id="ubicacion" className="scroll-mt-24 rounded-xl border border-border bg-surface p-6">
      <SectionHeader
        title="Ubicación"
        subtitle="Dónde está el espacio. La dirección exacta puede ocultarse a los productores"
      />
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label required>País</Label>
            <Input
              value={form.pais}
              onChange={(e) => update("pais", e.target.value)}
            />
          </div>
          <div>
            <Label required>Ciudad</Label>
            <Input
              value={form.ciudad}
              onChange={(e) => update("ciudad", e.target.value)}
              placeholder="Ej: Barcelona"
            />
          </div>
          <div>
            <Label required>Barrio / Zona</Label>
            <Input
              value={form.barrio}
              onChange={(e) => update("barrio", e.target.value)}
              placeholder="Ej: Poble Sec"
            />
          </div>
        </div>

        <div>
          <Label required>Dirección completa</Label>
          <Input
            value={form.direccion}
            onChange={(e) => update("direccion", e.target.value)}
            placeholder="Calle, número, piso..."
          />
        </div>

        <Toggle
          checked={form.mostrar_direccion}
          onChange={(v) => update("mostrar_direccion", v)}
          label="Mostrar dirección públicamente"
          description="Si está desactivado, solo se muestra barrio/zona al productor. La dirección exacta se revela tras aceptar la solicitud."
        />
      </div>
    </section>
  );
}

export function PricingSection({ form, update }: SectionProps) {
  return (
    <section id="pricing" className="scroll-mt-24 rounded-xl border border-border bg-surface p-6">
      <SectionHeader
        title="Pricing"
        subtitle="Rango orientativo del espacio completo. Cada anexo puede tener su propio precio."
      />
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label required>Desde (€)</Label>
            <Input
              type="number"
              value={form.precio_desde}
              onChange={(e) => update("precio_desde", e.target.value)}
              placeholder="500"
            />
          </div>
          <div>
            <Label required>Hasta (€)</Label>
            <Input
              type="number"
              value={form.precio_hasta}
              onChange={(e) => update("precio_hasta", e.target.value)}
              placeholder="3000"
            />
          </div>
          <div>
            <Label required>Unidad</Label>
            <Select
              value={form.unidad_precio}
              onChange={(e) => update("unidad_precio", e.target.value)}
            >
              <option value="hora">Por hora</option>
              <option value="evento">Por evento</option>
              <option value="dia">Por día</option>
            </Select>
          </div>
        </div>

        <div className="max-w-xs">
          <Label>Precio de referencia interno</Label>
          <Input
            type="number"
            value={form.precio_referencia_interno}
            onChange={(e) => update("precio_referencia_interno", e.target.value)}
            placeholder="1500"
          />
          <p className="text-xs text-text-muted mt-1">Solo visible para admins. Para estimaciones internas.</p>
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
        subtitle="Mínimo 5 fotos. Cada foto debe tener una etiqueta. Se requiere una Principal y una Base Space Studio."
      />
      <PhotosSection
        images={form.images}
        onChange={(images) => update("images", images)}
      />
    </section>
  );
}

export function AnexosSection({ form, update }: SectionProps) {
  function updateAnnex(id: string, field: keyof AnnexFormData, value: unknown) {
    update(
      "annexes",
      form.annexes.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  }

  function addAnnex() {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `new-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    update("annexes", [
      ...form.annexes,
      { ...DEFAULT_ANNEX, id, orden: form.annexes.length },
    ]);
  }

  function removeAnnex(annex: AnnexFormData) {
    if (annex.existing) {
      update("annexesToDelete", [...form.annexesToDelete, annex.id]);
    }
    update(
      "annexes",
      form.annexes
        .filter((a) => a.id !== annex.id)
        .map((a, i) => ({ ...a, orden: i }))
    );
  }

  return (
    <section id="anexos" className="scroll-mt-24 rounded-xl border border-border bg-surface p-6">
      <SectionHeader
        title="Anexos"
        subtitle="Zonas o salas dentro del espacio. Cada anexo tiene su capacidad, uso, fotos y precio propios. Mínimo 1 anexo."
      />

      {form.annexes.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <p className="text-sm text-text-muted mb-3">
            Este espacio todavía no tiene anexos. Añade al menos uno.
          </p>
          <Button type="button" onClick={addAnnex}>
            <Plus size={16} /> Añadir anexo
          </Button>
        </div>
      )}

      <div className="space-y-6">
        {form.annexes.map((annex, i) => (
          <AnnexCard
            key={annex.id}
            index={i}
            annex={annex}
            update={(field, value) => updateAnnex(annex.id, field, value)}
            onRemove={() => removeAnnex(annex)}
          />
        ))}
      </div>

      {form.annexes.length > 0 && (
        <div className="mt-6">
          <Button type="button" variant="secondary" onClick={addAnnex}>
            <Plus size={16} /> Añadir otro anexo
          </Button>
        </div>
      )}
    </section>
  );
}

function AnnexCard({
  index,
  annex,
  update,
  onRemove,
}: {
  index: number;
  annex: AnnexFormData;
  update: (field: keyof AnnexFormData, value: unknown) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-5 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Label required>Nombre del anexo #{index + 1}</Label>
          <Input
            value={annex.nombre}
            onChange={(e) => update("nombre", e.target.value)}
            placeholder="Ej: Terraza, Sala principal, Barra..."
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="mt-7 rounded-lg border border-border p-2 text-text-muted hover:text-error hover:border-error/50 transition-colors"
          title="Eliminar anexo"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div>
        <p className="text-sm font-medium mb-3">Capacidad</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label required>Aforo de pie</Label>
            <Input
              type="number"
              value={annex.config_de_pie}
              onChange={(e) => update("config_de_pie", e.target.value)}
              placeholder="200"
            />
          </div>
          <div>
            <Label>Aforo sentado</Label>
            <Input
              type="number"
              value={annex.config_sentado}
              onChange={(e) => update("config_sentado", e.target.value)}
              placeholder="120"
            />
          </div>
          <div>
            <Label required>Metros cuadrados</Label>
            <Input
              type="number"
              value={annex.metros_cuadrados}
              onChange={(e) => update("metros_cuadrados", e.target.value)}
              placeholder="350"
            />
          </div>
        </div>
      </div>

      <div>
        <Label required>Uso</Label>
        <Chips
          options={TIPO_ESPACIO_OPTIONS}
          selected={annex.tipo_espacio ? [annex.tipo_espacio] : []}
          onChange={(sel) => update("tipo_espacio", sel[0] || "")}
          multiple={false}
        />
      </div>

      <div>
        <Label required>Tipo de uso</Label>
        <Chips
          options={TIPOS_EVENTO_OPTIONS}
          selected={annex.tipos_evento}
          onChange={(sel) => update("tipos_evento", sel)}
        />
      </div>

      <div>
        <p className="text-sm font-medium mb-3">Pricing</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label required>Desde (€)</Label>
            <Input
              type="number"
              value={annex.precio_desde}
              onChange={(e) => update("precio_desde", e.target.value)}
              placeholder="500"
            />
          </div>
          <div>
            <Label required>Hasta (€)</Label>
            <Input
              type="number"
              value={annex.precio_hasta}
              onChange={(e) => update("precio_hasta", e.target.value)}
              placeholder="3000"
            />
          </div>
          <div>
            <Label required>Unidad</Label>
            <Select
              value={annex.unidad_precio}
              onChange={(e) => update("unidad_precio", e.target.value)}
            >
              <option value="hora">Por hora</option>
              <option value="evento">Por evento</option>
              <option value="dia">Por día</option>
            </Select>
          </div>
        </div>
        <div className="mt-4 max-w-xs">
          <Label>Precio de referencia interno</Label>
          <Input
            type="number"
            value={annex.precio_referencia_interno}
            onChange={(e) => update("precio_referencia_interno", e.target.value)}
            placeholder="1500"
          />
          <p className="text-xs text-text-muted mt-1">Solo visible para admins.</p>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-3">Fotos del anexo</p>
        <PhotosSection
          images={annex.images}
          onChange={(images) => update("images", images)}
          showWarnings={false}
        />
      </div>
    </div>
  );
}

export function EstadoSection({ form, update }: SectionProps) {
  return (
    <section id="estado" className="scroll-mt-24 rounded-xl border border-border bg-surface p-6">
      <SectionHeader
        title="Estado"
        subtitle="Controla la visibilidad del espacio en la plataforma"
      />
      <div className="space-y-4">
        <div className="max-w-xs">
          <Label required>Estado del espacio</Label>
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
