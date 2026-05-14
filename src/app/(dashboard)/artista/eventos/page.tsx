"use client";

import { useEffect, useState } from "react";
import { Pill } from "@/components/ui/badge";
import { PageHead } from "@/components/ui/page-head";
import { Stat } from "@/components/ui/stat";
import { createClient } from "@/lib/supabase/client";

interface EventoArtistaRow {
  solicitud_id: string;
  fecha_evento: string | null;
  artista_nombre: string;
  evento_id: string;
  evento_titulo: string;
  evento_tipo: string | null;
  evento_ciudad: string | null;
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

export default function ArtistaEventosPage() {
  const [rows, setRows] = useState<EventoArtistaRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("solicitudes_artistas")
        .select(
          `id, estado, fecha_evento,
           artista:artistas!solicitudes_artistas_artista_id_fkey(nombre),
           evento:eventos!solicitudes_artistas_evento_id_fkey(
             id, titulo, tipo, ciudad, estado,
             cliente:profiles!eventos_cliente_id_fkey(nombre)
           )`
        )
        .eq("estado", "aceptada")
        .order("fecha_evento", { ascending: true });

      const mapped: EventoArtistaRow[] = (data ?? []).map((s) => {
        const artista = unwrap(s.artista) as { nombre: string } | null;
        const ev = unwrap(s.evento) as {
          id: string;
          titulo: string;
          tipo: string | null;
          ciudad: string | null;
          estado: string;
          cliente: { nombre: string } | { nombre: string }[] | null;
        } | null;
        const cliente = unwrap(ev?.cliente);
        return {
          solicitud_id: s.id as string,
          fecha_evento: s.fecha_evento as string | null,
          artista_nombre: artista?.nombre || "—",
          evento_id: ev?.id || "",
          evento_titulo: ev?.titulo || "—",
          evento_tipo: ev?.tipo ?? null,
          evento_ciudad: ev?.ciudad ?? null,
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
        eyebrow="Tu agenda"
        title="Mis eventos"
        sub="Eventos confirmados en los que tocarás."
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
                  {[r.evento_ciudad, r.evento_tipo, r.artista_nombre]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </div>
              </div>
              <Pill variant={eventoEstadoVariant[r.evento_estado] || "default"} dot>
                {r.evento_estado}
              </Pill>
              <span className="text-mute">{r.productor_nombre || "—"}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
