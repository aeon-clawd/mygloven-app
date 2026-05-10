"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/page-head";
import { Icon } from "@/components/ui/icon";
import { Marquee } from "@/components/layout/marquee";

function RegisterForm() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "venue";

  const roleLabels: Record<string, string> = {
    venue: "Espacio",
    artista: "Artista",
    proveedor: "Proveedor",
  };

  useEffect(() => {
    document.body.classList.add("scroll-auto");
    return () => {
      document.body.classList.remove("scroll-auto");
    };
  }, []);

  return (
    <>
      <Marquee items={["my'G — registro", "Cada candidato pasa por revisión"]} />
      <div className="auth-stage">
        <div className="auth-left">
          <div className="brand">
            my<span className="ap">&apos;</span>G
          </div>
          <div className="display">
            Únete<span className="ap">.</span>
          </div>
          <div className="footer-meta">
            <span>v2.0 · Industrial</span>
            <span>Candidatura</span>
          </div>
        </div>

        <div className="auth-right">
          <Eyebrow>— Registro como {roleLabels[role] || "usuario"}</Eyebrow>
          <h2>Tu candidatura.</h2>
          <p className="sub">Completa los datos. Un admin revisará tu solicitud y te avisará cuando esté aprobada.</p>

          <div className="card raised">
            <p className="text-mute">— Wizard de registro próximamente</p>
            <p style={{ fontSize: 14, marginTop: 8, color: "var(--color-text-secondary)" }}>
              Por ahora, contacta con el equipo my&apos;G para iniciar el alta.
            </p>
          </div>

          <Button variant="primary" size="lg" full disabled data-cursor="enviar →">
            Enviar candidatura <Icon.arrow />
          </Button>
        </div>
      </div>
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
