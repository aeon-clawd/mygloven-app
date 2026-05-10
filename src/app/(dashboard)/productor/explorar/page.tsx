"use client";

import { useState } from "react";
import { PageHead } from "@/components/ui/page-head";

type Tab = "espacios" | "artistas";

export default function ExplorarPage() {
  const [tab, setTab] = useState<Tab>("espacios");

  return (
    <>
      <PageHead
        eyebrow="Marketplace"
        title="Explorar"
        sub="Espacios y artistas que pueden encajar con tu próximo evento. Filtra, guarda favoritos, y mándales propuesta cuando estés listo."
        actions={
          <div className="segmented">
            {(
              [
                { k: "espacios", l: "Espacios" },
                { k: "artistas", l: "Artistas" },
              ] as const
            ).map((t) => (
              <button
                key={t.k}
                type="button"
                className={tab === t.k ? "active" : ""}
                onClick={() => setTab(t.k)}
                data-cursor={`ver ${t.l.toLowerCase()}`}
              >
                {t.l}
              </button>
            ))}
          </div>
        }
      />

      <div className="empty">
        <div className="num">0</div>
        <div className="msg">
          {tab === "espacios" ? "Sin espacios disponibles aún" : "Sin artistas disponibles aún"}
        </div>
        <span className="text-mute">
          Estamos terminando el catálogo. Pronto podrás filtrar por ciudad, aforo y estilo.
        </span>
      </div>
    </>
  );
}
