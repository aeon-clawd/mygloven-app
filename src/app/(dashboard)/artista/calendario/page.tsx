"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/badge";
import { PageHead } from "@/components/ui/page-head";
import { Stat } from "@/components/ui/stat";
import { createClient } from "@/lib/supabase/client";
import { eventoLabel } from "@/lib/estado-labels";
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

interface SolicitudArtistaCal {
  id: string;
  fecha_evento: string;
  mensaje_productor: string | null;
  artista_nombre: string;
  evento_id: string;
  evento_titulo: string;
  evento_tipo: string | null;
  evento_ciudad: string | null;
  evento_estado: EstadoEvento;
  evento_num_personas: number | null;
  productor_nombre: string | null;
  productor_email: string | null;
}

const estadoVariant: Record<EstadoEvento, "default" | "success" | "warning" | "error"> = {
  borrador: "warning",
  activo: "success",
  en_propuestas: "warning",
  cerrado: "success",
  cancelado: "error",
};

function buildMonth(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startWeekday = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: { date: Date; muted: boolean; key: string }[] = [];
  for (let i = startWeekday; i > 0; i--) {
    days.push({ date: new Date(year, month, 1 - i), muted: true, key: `pre-${i}` });
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

function unwrap<T>(rel: T | T[] | null | undefined): T | null {
  if (!rel) return null;
  return Array.isArray(rel) ? rel[0] ?? null : rel;
}

export default function ArtistaCalendarioPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [rows, setRows] = useState<SolicitudArtistaCal[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<SolicitudArtistaCal | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("solicitudes_artistas")
        .select(
          `id, fecha_evento, mensaje_productor,
           artista:artistas!solicitudes_artistas_artista_id_fkey(nombre),
           evento:eventos!solicitudes_artistas_evento_id_fkey(
             id, titulo, tipo, ciudad, estado, num_personas,
             cliente:profiles!eventos_cliente_id_fkey(nombre, email)
           )`
        )
        .eq("estado", "aceptada")
        .not("fecha_evento", "is", null);

      const mapped: SolicitudArtistaCal[] = (data ?? [])
        .map((s) => {
          const artista = unwrap(s.artista) as { nombre: string } | null;
          const ev = unwrap(s.evento) as {
            id: string;
            titulo: string;
            tipo: string | null;
            ciudad: string | null;
            estado: EstadoEvento;
            num_personas: number | null;
            cliente: { nombre: string; email: string } | { nombre: string; email: string }[] | null;
          } | null;
          if (!ev || !s.fecha_evento) return null;
          const cli = unwrap(ev.cliente);
          return {
            id: s.id as string,
            fecha_evento: s.fecha_evento as string,
            mensaje_productor: s.mensaje_productor as string | null,
            artista_nombre: artista?.nombre ?? "—",
            evento_id: ev.id,
            evento_titulo: ev.titulo,
            evento_tipo: ev.tipo,
            evento_ciudad: ev.ciudad,
            evento_estado: ev.estado,
            evento_num_personas: ev.num_personas,
            productor_nombre: cli?.nombre ?? null,
            productor_email: cli?.email ?? null,
          };
        })
        .filter((x): x is SolicitudArtistaCal => !!x);
      setRows(mapped);
      setLoading(false);
    }
    load();
  }, []);

  const days = buildMonth(year, month);
  const eventosPorDia = useMemo(() => {
    const map = new Map<string, SolicitudArtistaCal[]>();
    for (const r of rows) {
      const k = r.fecha_evento.slice(0, 10);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(r);
    }
    return map;
  }, [rows]);

  const inMonth = useMemo(
    () =>
      rows.filter((r) => {
        const d = new Date(r.fecha_evento);
        return d.getFullYear() === year && d.getMonth() === month;
      }),
    [rows, year, month]
  );

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
        eyebrow={`Tu agenda — ${MONTHS[month]} ${year}`}
        title="Calendario"
        sub="Eventos confirmados en los que tocarás. Click para ver el detalle."
        actions={
          <div className="segmented">
            <button type="button" onClick={() => nav(-1)} data-cursor="mes anterior">
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
            <button type="button" onClick={() => nav(1)} data-cursor="mes siguiente">
              {MONTHS[(month + 1) % 12].slice(0, 3)} →
            </button>
          </div>
        }
      />

      <div className="card-grid cols-3" style={{ marginBottom: 32 }}>
        <Stat label="Eventos confirmados" value={loading ? "—" : inMonth.length} accent />
        <Stat
          label="Próximos"
          value={
            loading
              ? "—"
              : inMonth.filter((r) => new Date(r.fecha_evento) >= new Date()).length
          }
        />
        <Stat
          label="Total este año"
          value={
            loading
              ? "—"
              : rows.filter((r) => new Date(r.fecha_evento).getFullYear() === year).length
          }
        />
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
                {dayEvents.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className={`ev ${r.evento_estado}`}
                    title={`${r.evento_titulo} · ${eventoLabel(r.evento_estado)}`}
                    data-cursor="abrir →"
                    onClick={() => setDetail(r)}
                  >
                    {r.evento_titulo || "Evento"}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.evento_titulo || "Detalle del evento"}
        footer={
          <Button variant="ghost" onClick={() => setDetail(null)}>
            Cerrar
          </Button>
        }
      >
        {detail && (
          <div className="flex-col">
            <div>
              <Pill variant={estadoVariant[detail.evento_estado] || "default"} dot>
                {eventoLabel(detail.evento_estado)}
              </Pill>
            </div>
            <hr className="hr" />
            <div className="card-grid cols-2">
              <Field
                label="Fecha"
                value={new Date(detail.fecha_evento).toLocaleDateString("es-ES")}
              />
              <Field label="Tocando como" value={detail.artista_nombre} />
              <Field
                label="Tipo · ciudad"
                value={
                  [detail.evento_tipo, detail.evento_ciudad].filter(Boolean).join(" · ") || "—"
                }
              />
              <Field
                label="Pax"
                value={
                  detail.evento_num_personas ? String(detail.evento_num_personas) : "—"
                }
              />
              <Field
                label="Productor"
                value={detail.productor_nombre || detail.productor_email || "—"}
              />
            </div>
            {detail.mensaje_productor && (
              <>
                <hr className="hr" />
                <div>
                  <div className="text-mute" style={{ marginBottom: 6 }}>
                    MENSAJE DEL PRODUCTOR
                  </div>
                  <div>{detail.mensaje_productor}</div>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-mute" style={{ marginBottom: 4 }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>
        {value}
      </div>
    </div>
  );
}
