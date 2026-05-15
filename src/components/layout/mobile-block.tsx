import { Monitor } from "lucide-react";
import { Logo } from "./logo";

export function MobileBlock() {
  return (
    <div
      className="md:hidden fixed inset-0 z-[9999] flex flex-col bg-background text-text-primary"
      style={{ cursor: "auto" }}
      role="dialog"
      aria-modal="true"
      aria-label="Versión móvil no disponible"
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-rule">
        <Logo className="h-7" />
        <span
          className="font-mono text-[10px] uppercase text-text-muted"
          style={{ letterSpacing: "var(--tracking-wider)" }}
        >
          v0.1 · WIP
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

        <p className="text-sm text-text-secondary leading-relaxed max-w-xs mb-10">
          Estamos trabajando en la experiencia móvil de my&apos;G.
          Mientras tanto, accede desde un ordenador para usar la plataforma.
        </p>

        <div className="w-full max-w-xs border border-rule rounded-[var(--radius-md)] bg-surface px-4 py-3 flex items-start gap-3 text-left">
          <span
            className="font-mono text-[10px] uppercase text-text-muted mt-0.5 shrink-0"
            style={{ letterSpacing: "var(--tracking-wider)" }}
          >
            tip
          </span>
          <p className="text-xs text-text-secondary leading-relaxed">
            Anchura mínima recomendada: <span className="font-mono text-text-primary">768&nbsp;px</span>.
            Abre my&apos;G desde un portátil o sobremesa.
          </p>
        </div>
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
