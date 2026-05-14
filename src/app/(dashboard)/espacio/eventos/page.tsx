"use client";

import { useEffect, useState } from "react";
import { Pill } from "@/components/ui/badge";
import { eventoLabel } from "@/lib/estado-labels";
import { PageHead } from "@/components/ui/page-head";
import { Stat } from "@/components/ui/stat";
import { createClient } from "@/lib/supabase/client";

interface EventoConfirmadoRow {
  solicitud_id: string;
  estado_solicitud: string;
  fecha_evento: string | null;
  num_personas: number | null;
  venue_nombre: string;
  annex_nombre: string | null;
  evento_id: string;
  evento_titulo: string;
  evento_tipo: string | null;
  evento_estado: string;
  productor_nombre: string | null;
}

const eventoEstadoVariant: Record<string, "default" | "success" | "warning" | "error"> = {
  activo: "success",
  en_propuestas: "warning",
  cerrado: "default",
  cancelado: "error",
};

const DIAS = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

function formatDay(d: string | null): string {
  if (!d) return "—";
  const date = new Date(d);
  return `${DIAS[date.getDay()]} ${String(date.getDate()).padStart(2, "0")}`;
}

function formatMonth(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-ES", { month: "short", year: "numeric" });
}

function unwrap<T>(rel: T | T[] | null | undefined): T | null {
  if (!rel) return null;
  return Array.isArray(rel) ? rel[0] ?? null : rel;
}

export default function EspacioEventosPage() {
  const [rows, setRows] = useState<EventoConfirmadoRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("solicitudes")
        .select(
          `id, estado, fecha_evento, num_personas,
           venue:venues!solicitudes_venue_id_fkey(nombre),
           annex:venue_annexes!solicitudes_venue_annex_id_fkey(nombre),
           evento:eventos!solicitudes_evento_id_fkey(
             id, titulo, tipo, estado,
             cliente:profiles!eventos_cliente_id_fkey(nombre)
           )`
        )
        .eq("estado", "aceptada")
        .order("fecha_evento", { ascending: true });

      const mapped: EventoConfirmadoRow[] = (data ?? []).map((s) => {
        const venue = unwrap(s.venue) as { nombre: string } | null;
        const annex = unwrap(s.annex) as { nombre: string } | null;
        const ev = unwrap(s.evento) as {
          id: string;
          titulo: string;
          tipo: string | null;
          estado: string;
          cliente: { nombre: string } | { nombre: string }[] | null;
        } | null;
        const cliente = unwrap(ev?.cliente);
        return {
          solicitud_id: s.id as string,
          estado_solicitud: s.estado as string,
          fecha_evento: s.fecha_evento as string | null,
          num_personas: s.num_personas as number | null,
          venue_nombre: venue?.nombre || "—",
          annex_nombre: annex?.nombre ?? null,
          evento_id: ev?.id || "",
          evento_titulo: ev?.titulo || "—",
          evento_tipo: ev?.tipo ?? null,
          evento_estado: ev?.estado || "—",
          productor_nombre: cliente?.nombre ?? null,
        };
      });
      setRows(mapped);
      setLoading(false);
    }
    load();
  }, []);

  const upcoming = rows.filter(
    (r) => r.fecha_evento && new Date(r.fecha_evento) >= new Date()
  ).length;

  return (
    <>
      <PageHead
        eyebrow="Tu cartelera"
        title="Mis eventos"
        sub="Eventos confirmados y en proceso en tu espacio."
      />

      <div className="card-grid cols-3" style={{ marginBottom: 32 }}>
        <Stat label="Confirmados" value={loading ? "—" : rows.length} accent />
        <Stat label="Próximos" value={loading ? "—" : upcoming} />
        <Stat label="Pasados" value={loading ? "—" : Math.max(rows.length - upcoming, 0)} />
      </div>

      {loading ? (
        <div className="empty">
          <div className="msg">Cargando…</div>
        </div>
      ) : rows.length === 0 ? (
        <div className="empty">
          <div className="num">0</div>
          <div className="msg">Sin eventos confirmados</div>
          <span className="text-mute">
            Cuando aceptes una solicitud, el evento aparecerá aquí.
          </span>
        </div>
      ) : (
        <div className="lineup">
          {rows.map((r) => (
            <div key={r.solicitud_id} className="row" style={{ cursor: "default" }}>
              <span className="day">{formatDay(r.fecha_evento)}</span>
              <span className="time">{formatMonth(r.fecha_evento)}</span>
              <div>
                <div className="ttl">{r.evento_titulo}</div>
                <div className="sub">
                  {[
                    r.annex_nombre ? `${r.annex_nombre} · ${r.venue_nombre}` : r.venue_nombre,
                    r.num_personas ? `${r.num_personas} pax` : null,
                    r.evento_tipo,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </div>
              </div>
              <Pill variant={eventoEstadoVariant[r.evento_estado] || "default"} dot>
                {eventoLabel(r.evento_estado)}
              </Pill>
              <span className="text-mute">{r.productor_nombre || "—"}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
