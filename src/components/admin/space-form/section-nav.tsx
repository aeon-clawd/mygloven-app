"use client";

import { cn } from "@/lib/utils";
import { SECTION_IDS, SECTION_LABELS, type SectionId, type SpaceFormData, REQUIRED_FIELDS } from "./types";

interface SectionNavProps {
  activeSection: SectionId;
  form: SpaceFormData;
}

export function SectionNav({ activeSection, form }: SectionNavProps) {
  const filled = REQUIRED_FIELDS.filter((key) => {
    const val = form[key];
    if (Array.isArray(val)) return val.length > 0;
    return val !== "" && val !== null && val !== undefined;
  }).length;

  function scrollTo(id: SectionId) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav className="sticky top-20 space-y-1">
      {SECTION_IDS.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => scrollTo(id)}
          className={cn(
            "block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
            activeSection === id
              ? "bg-surface text-accent"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
          )}
        >
          {SECTION_LABELS[id]}
        </button>
      ))}

      <div className="mt-6 rounded-lg border border-border p-3">
        <p className="text-xs text-text-muted mb-2">Progreso</p>
        <p className="text-sm font-semibold">
          {filled} de {REQUIRED_FIELDS.length} campos
        </p>
        <div className="mt-2 h-1.5 rounded-full bg-border">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${(filled / REQUIRED_FIELDS.length) * 100}%` }}
          />
        </div>
      </div>
    </nav>
  );
}
