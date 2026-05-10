"use client";

import { useState } from "react";
import { PageHead } from "@/components/ui/page-head";

const filtros = ["pendiente", "aceptada", "rechazada", "todas"] as const;
type Filtro = (typeof filtros)[number];

export default function EspacioSolicitudesPage() {
  const [filtro, setFiltro] = useState<Filtro>("pendiente");

  return (
    <>
      <PageHead
        eyebrow="Quién quiere tu espacio"
        title="Solicitudes"
        sub="Cada productor que pidió tu espacio. Datos completos del evento. Decide en tres clics."
      />

      <div className="flex-row between" style={{ marginBottom: 24 }}>
        <div className="segmented">
          {filtros.map((f) => (
            <button
              key={f}
              type="button"
              className={filtro === f ? "active" : ""}
              onClick={() => setFiltro(f)}
              data-cursor="filtrar"
            >
              {f}
            </button>
          ))}
        </div>
        <span className="text-mute">0 resultados</span>
      </div>

      <div className="empty">
        <div className="num">0</div>
        <div className="msg">Sin solicitudes</div>
        <span className="text-mute">Cuando lleguen solicitudes para tu espacio, aparecerán aquí.</span>
      </div>
    </>
  );
}
