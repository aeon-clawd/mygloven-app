"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Upload, X, GripVertical, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SpaceImage } from "./types";

const TAG_OPTIONS = [
  { value: "principal", label: "Principal" },
  { value: "base_space_studio", label: "Base Space Studio" },
  { value: "evento_montado", label: "Evento montado" },
  { value: "detalle", label: "Detalle" },
  { value: "exterior", label: "Exterior / Entrada" },
  { value: "zona", label: "Zona específica" },
];

interface PhotosSectionProps {
  images: SpaceImage[];
  onChange: (images: SpaceImage[]) => void;
  showWarnings?: boolean;
}

export function PhotosSection({ images, onChange, showWarnings = true }: PhotosSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const hasPrincipal = images.some((i) => i.tag === "principal");
  const hasBaseStudio = images.some((i) => i.tag === "base_space_studio");
  const warnings: string[] = [];
  if (showWarnings) {
    if (images.length > 0 && images.length < 5) warnings.push("Mínimo 5 fotos para activar el espacio");
    if (images.length > 0 && !hasPrincipal) warnings.push("Falta una foto etiquetada como Principal");
    if (images.length > 0 && !hasBaseStudio) warnings.push("Falta una foto etiquetada como Base Space Studio");
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const newImages: SpaceImage[] = [];

    Array.from(files).forEach((file) => {
      if (!validTypes.includes(file.type)) return;

      const preview = URL.createObjectURL(file);
      newImages.push({
        url: "",
        tag: "detalle",
        order: images.length + newImages.length,
        file,
        preview,
      });
    });

    onChange([...images, ...newImages]);
  }

  function updateTag(index: number, tag: string) {
    const updated = images.map((img, i) => {
      if (i !== index) return img;
      return { ...img, tag };
    });

    if (tag === "principal" || tag === "base_space_studio") {
      updated.forEach((img, i) => {
        if (i !== index && img.tag === tag) {
          img.tag = "detalle";
        }
      });
    }

    onChange(updated);
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index).map((img, i) => ({ ...img, order: i })));
  }

  function handleDragStart(index: number) {
    setDragIdx(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIdx === null || dragIdx === index) return;

    const reordered = [...images];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(index, 0, moved);
    onChange(reordered.map((img, i) => ({ ...img, order: i })));
    setDragIdx(index);
  }

  return (
    <div className="space-y-4">
      {warnings.length > 0 && (
        <div className="rounded-lg bg-warning/10 p-3 space-y-1">
          {warnings.map((w) => (
            <div key={w} className="flex items-center gap-2 text-sm text-warning">
              <AlertCircle size={14} />
              {w}
            </div>
          ))}
        </div>
      )}

      <div
        className={cn(
          "rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
          dragOver
            ? "border-accent bg-accent/5"
            : "border-border hover:border-text-muted"
        )}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <Upload size={24} className="mx-auto text-text-muted mb-2" />
        <p className="text-sm text-text-secondary">
          Arrastra fotos aquí o <span className="text-accent font-medium">haz click para seleccionar</span>
        </p>
        <p className="text-xs text-text-muted mt-1">JPG, PNG, WebP. Mín. 1920×1080</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img, index) => (
            <div
              key={index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={() => setDragIdx(null)}
              className={cn(
                "group relative rounded-lg border border-border bg-background overflow-hidden",
                dragIdx === index && "opacity-50"
              )}
            >
              <div className="aspect-video bg-surface-hover relative">
                {(img.preview || img.url) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img.preview || img.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-2 left-2 cursor-grab text-white/70 hover:text-white">
                  <GripVertical size={16} />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white/70 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="p-2">
                <Select
                  value={img.tag}
                  onChange={(e) => updateTag(index, e.target.value)}
                  className="text-xs"
                >
                  {TAG_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
