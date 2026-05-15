"use client";

import { useEffect, useState } from "react";
import { Monitor } from "lucide-react";

export function MobileBlock() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!isMobile) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-background text-text-primary"
      style={{ cursor: "auto" }}
      role="dialog"
      aria-modal="true"
      aria-label="Versión móvil no disponible"
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-rule">
        <span
          className="font-[family-name:var(--font-display)] font-bold text-xl"
          style={{ letterSpacing: "-0.03em" }}
        >
          my<span style={{ color: "var(--color-accent)" }}>&apos;</span>G
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="flex items-center justify-center w-16 h-16 mb-8 border border-rule rounded-[var(--radius-md)] bg-surface">
          <Monitor className="w-7 h-7 text-accent" strokeWidth={1.5} />
        </div>

        <span
          className="font-mono text-[10px] uppercase text-accent mb-4"
          style={{ letterSpacing: "var(--tracking-extreme)" }}
        >
          ⊡ Solo escritorio
        </span>

        <h1
          className="font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight mb-4 text-text-primary"
          style={{ letterSpacing: "var(--tracking-tight)" }}
        >
          Versión móvil en construcción
        </h1>

        <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
          Estamos trabajando en la experiencia móvil de my
          <span style={{ color: "var(--color-accent)" }}>&apos;</span>G.
          Mientras tanto, accede desde un ordenador para usar la plataforma.
        </p>
      </div>

      <div className="px-6 py-4 border-t border-rule">
        <span
          className="font-mono text-[10px] uppercase text-text-muted block text-center"
          style={{ letterSpacing: "var(--tracking-wider)" }}
        >
          my&apos;G — sistema operativo de eventos
        </span>
      </div>
    </div>
  );
}
