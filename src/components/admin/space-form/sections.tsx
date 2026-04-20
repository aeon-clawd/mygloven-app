"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Chips } from "@/components/ui/chips";
import { Toggle } from "@/components/ui/toggle";
import {
  type SpaceFormData,
  ZONAS_OPTIONS,
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

export function CapacidadSection({ form, update }: SectionProps) {
  return (
    <section id="capacidad" className="scroll-mt-24 rounded-xl border border-border bg-surface p-6">
      <SectionHeader
        title="Capacidad y físico"
        subtitle="Dimensiones, aforo y zonas disponibles en el espacio"
      />
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label required>Aforo máximo de pie</Label>
            <Input
              type="number"
              value={form.config_de_pie}
              onChange={(e) => update("config_de_pie", e.target.value)}
              placeholder="200"
            />
          </div>
          <div>
            <Label>Aforo máximo sentado</Label>
            <Input
              type="number"
              value={form.config_sentado}
              onChange={(e) => update("config_sentado", e.target.value)}
              placeholder="120"
            />
          </div>
          <div>
            <Label required>Metros cuadrados</Label>
            <Input
              type="number"
              value={form.metros_cuadrados}
              onChange={(e) => update("metros_cuadrados", e.target.value)}
              placeholder="350"
            />
          </div>
        </div>

        <div>
          <Label required>Tipo</Label>
          <Chips
            options={TIPO_ESPACIO_OPTIONS}
            selected={form.tipo_espacio ? [form.tipo_espacio] : []}
            onChange={(sel) => update("tipo_espacio", sel[0] || "")}
            multiple={false}
          />
        </div>

        <div>
          <Label required>Zonas del espacio</Label>
          <Chips
            options={ZONAS_OPTIONS}
            selected={form.zonas}
            onChange={(sel) => update("zonas", sel)}
          />
        </div>
      </div>
    </section>
  );
}

export function TipoDeUsoSection({ form, update }: SectionProps) {
  return (
    <section id="tipo-de-uso" className="scroll-mt-24 rounded-xl border border-border bg-surface p-6">
      <SectionHeader
        title="Tipo de uso"
        subtitle="Qué tipos de eventos se pueden realizar en este espacio"
      />
      <div>
        <Label required>Tipos de evento permitidos</Label>
        <Chips
          options={TIPOS_EVENTO_OPTIONS}
          selected={form.tipos_evento}
          onChange={(sel) => update("tipos_evento", sel)}
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
        subtitle="Rango de precio orientativo para productores"
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

export function ContactoSection({ form, update }: SectionProps) {
  return (
    <section id="contacto" className="scroll-mt-24 rounded-xl border border-border bg-surface p-6">
      <SectionHeader
        title="Contacto interno"
        subtitle="Información privada del gestor del espacio. Solo visible para admins."
      />
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Nombre del gestor</Label>
            <Input
              value={form.nombre_gestor}
              onChange={(e) => update("nombre_gestor", e.target.value)}
              placeholder="Nombre y apellidos"
            />
          </div>
          <div>
            <Label>Email del gestor</Label>
            <Input
              type="email"
              value={form.email_interno}
              onChange={(e) => update("email_interno", e.target.value)}
              placeholder="gestor@espacio.com"
            />
          </div>
        </div>
        <div className="max-w-xs">
          <Label>Teléfono del gestor</Label>
          <Input
            value={form.telefono_interno}
            onChange={(e) => update("telefono_interno", e.target.value)}
            placeholder="+34 600 000 000"
          />
        </div>
        <div>
          <Label>Notas internas</Label>
          <Textarea
            value={form.notas_internas}
            onChange={(e) => update("notas_internas", e.target.value)}
            placeholder="Notas privadas sobre este espacio, acuerdos, condiciones especiales..."
          />
        </div>
      </div>
    </section>
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
