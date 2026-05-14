"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHead } from "@/components/ui/page-head";
import { Stat } from "@/components/ui/stat";
import { EventoDetailModal } from "@/components/productor/evento-detail-modal";
import { createClient } from "@/lib/supabase/client";
import type { EstadoEvento } from "@/types/database";

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

interface EventoCal {
  id: string;
  titulo: string;
  fecha_deseada: string;
  estado: EstadoEvento;
}

function buildMonth(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startWeekday = (first.getDay() + 6) % 7; // Mon = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: { date: Date; muted: boolean; key: string }[] = [];
  for (let i = startWeekday; i > 0; i--) {
    const d = new Date(year, month, 1 - i);
    days.push({ date: d, muted: true, key: `pre-${i}` });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ date: new Date(year, month, i), muted: false, key: `cur-${i}` });
  }
  while (days.length % 7) {
    const i = days.length - daysInMonth - startWeekday + 1;
    days.push({ date: new Date(year, month, daysInMonth + i), muted: true, key: `post-${i}` });
  }
  return days;
}

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function ProductorCalendarioPage() {
  const router = useRouter();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [eventos, setEventos] = useState<EventoCal[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<EventoCal | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("eventos")
        .select("id, titulo, fecha_deseada, estado")
        .not("fecha_deseada", "is", null);
      setEventos((data ?? []) as EventoCal[]);
      setLoading(false);
    }
    load();
  }, []);

  const days = buildMonth(year, month);

  const eventosPorDia = useMemo(() => {
    const map = new Map<string, EventoCal[]>();
    for (const e of eventos) {
      if (!e.fecha_deseada) continue;
      const k = e.fecha_deseada.slice(0, 10);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(e);
    }
    return map;
  }, [eventos]);

  const counts = useMemo(() => {
    const inMonth = eventos.filter((e) => {
      const d = new Date(e.fecha_deseada);
      return d.getFullYear() === year && d.getMonth() === month;
    });
    return {
      total: inMonth.length,
      activos: inMonth.filter((e) => e.estado === "activo").length,
      propuestas: inMonth.filter((e) => e.estado === "en_propuestas").length,
      borradores: inMonth.filter((e) => e.estado === "borrador").length,
    };
  }, [eventos, year, month]);

  function nav(delta: number) {
    let m = month + delta;
    let y = year;
    while (m < 0) {
      m += 12;
      y -= 1;
    }
    while (m > 11) {
      m -= 12;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  }

  return (
    <>
      <PageHead
        eyebrow={`Tus eventos — ${MONTHS[month]} ${year}`}
        title="Calendario"
        sub="Tus eventos por mes. Color según el estado. Click en un evento para abrirlo."
        actions={
          <div className="segmented">
            <button
              type="button"
              onClick={() => nav(-1)}
              data-cursor="mes anterior"
            >
              ← {MONTHS[(month + 11) % 12].slice(0, 3)}
            </button>
            <button
              type="button"
              className="active"
              onClick={() => {
                setMonth(today.getMonth());
                setYear(today.getFullYear());
              }}
              data-cursor="hoy"
            >
              {MONTHS[month].slice(0, 3)}
            </button>
            <button
              type="button"
              onClick={() => nav(1)}
              data-cursor="mes siguiente"
            >
              {MONTHS[(month + 1) % 12].slice(0, 3)} →
            </button>
          </div>
        }
      />

      <div className="card-grid cols-4" style={{ marginBottom: 32 }}>
        <Stat label="Eventos del mes" value={loading ? "—" : counts.total} accent />
        <Stat label="Confirmados" value={loading ? "—" : counts.activos} />
        <Stat label="En propuestas" value={loading ? "—" : counts.propuestas} />
        <Stat label="Borradores" value={loading ? "—" : counts.borradores} />
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
              !d.muted &&
              d.date.getDate() === today.getDate() &&
              d.date.getMonth() === today.getMonth() &&
              d.date.getFullYear() === today.getFullYear();
            const dayEvents = eventosPorDia.get(ymd(d.date)) ?? [];
            return (
              <div
                key={d.key}
                className={`cal-day${d.muted ? " muted" : ""}${isToday ? " today" : ""}`}
              >
                <span className="n">{d.date.getDate()}</span>
                {dayEvents.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    className={`ev ${e.estado}`}
                    title={`${e.titulo} · ${e.estado}`}
                    data-cursor="abrir →"
                    onClick={() =>
                      e.estado === "borrador"
                        ? router.push(`/productor/canvas/${e.id}`)
                        : setDetail(e)
                    }
                  >
                    {e.titulo || "Evento sin título"}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <EventoDetailModal
        evento={detail ? { id: detail.id, titulo: detail.titulo, estado: detail.estado } : null}
        onClose={() => setDetail(null)}
      />
    </>
  );
}
