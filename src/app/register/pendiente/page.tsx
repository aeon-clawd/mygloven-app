"use client";

import { useEffect } from "react";
import { Eyebrow } from "@/components/ui/page-head";
import { Marquee } from "@/components/layout/marquee";

export default function PendientePage() {
  useEffect(() => {
    document.body.classList.add("scroll-auto");
    return () => {
      document.body.classList.remove("scroll-auto");
    };
  }, []);

  return (
    <>
      <Marquee items={["Tu candidatura está siendo revisada", "Te avisaremos por email"]} />
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
        }}
      >
        <div
          className="card raised"
          style={{
            maxWidth: 520,
            textAlign: "center",
            padding: "56px 40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          <Eyebrow>— Candidatura en revisión</Eyebrow>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 56,
              lineHeight: 0.95,
              letterSpacing: "var(--tracking-tight)",
              margin: 0,
            }}
          >
            En cola<span style={{ color: "var(--color-accent)" }}>.</span>
          </h1>
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: 15,
              maxWidth: "40ch",
              lineHeight: 1.5,
            }}
          >
            Tu solicitud está siendo revisada por el equipo my&apos;G. Te notificaremos por email
            en cuanto sea aprobada.
          </p>
        </div>
      </div>
    </>
  );
}
