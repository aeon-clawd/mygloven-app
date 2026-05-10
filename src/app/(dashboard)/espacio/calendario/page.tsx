"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Stat } from "@/components/ui/stat";
import { PageHead } from "@/components/ui/page-head";
import { Icon } from "@/components/ui/icon";

const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function buildMonth(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startWeekday = (first.getDay() + 6) % 7; // Mon = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: { n: number; muted: boolean; key: string }[] = [];
  for (let i = startWeekday; i > 0; i--) {
    const d = new Date(year, month, 1 - i);
    days.push({ n: d.getDate(), muted: true, key: `pre-${i}` });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ n: i, muted: false, key: `cur-${i}` });
  }
  while (days.length % 7) {
    const d = days.length - daysInMonth - startWeekday + 1;
    days.push({ n: d, muted: true, key: `post-${d}` });
  }
  return days;
}

export default function EspacioCalendarioPage() {
  const today = new Date();
  const [year] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const days = buildMonth(year, month);

  return (
    <>
      <PageHead
        eyebrow={`Tu disponibilidad — ${MONTHS[month]} ${year}`}
        title="Calendario"
        sub="Reservas en color de acento. Bloqueos en gris. Click para añadir o editar."
        actions={
          <>
            <div className="segmented">
              {[-1, 0, 1].map((d) => {
                const m = (month + d + 12) % 12;
                return (
                  <button
                    key={d}
                    type="button"
                    className={d === 0 ? "active" : ""}
                    onClick={() => setMonth((month + d + 12) % 12)}
                    data-cursor="cambiar mes"
                  >
                    {MONTHS[m].slice(0, 3)}
                  </button>
                );
              })}
            </div>
            <Button variant="primary" data-cursor="bloquear día →">
              <Icon.plus /> Bloquear día
            </Button>
          </>
        }
      />

      <div className="card-grid cols-4" style={{ marginBottom: 32 }}>
        <Stat label="Días reservados" value="0" accent />
        <Stat label="Días bloqueados" value="0" />
        <Stat label="Días disponibles" value="—" />
        <Stat label="Ocupación" value="—" delta="vs. mes anterior" deltaDir="flat" />
      </div>

      <div className="calendar">
        <div className="cal-head">
          <div>Lun</div>
          <div>Mar</div>
          <div>Mié</div>
          <div>Jue</div>
          <div>Vie</div>
          <div>Sáb</div>
          <div>Dom</div>
        </div>
        <div className="cal-grid">
          {days.map((d) => {
            const isToday =
              !d.muted && d.n === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            return (
              <div
                key={d.key}
                className={`cal-day${d.muted ? " muted" : ""}${isToday ? " today" : ""}`}
                data-cursor={d.muted ? "" : "ver →"}
              >
                <span className="n">{d.n}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
