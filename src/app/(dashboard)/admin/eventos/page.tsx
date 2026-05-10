"use client";

import { useEffect, useState } from "react";
import { Pill } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { PageHead } from "@/components/ui/page-head";
import { Stat } from "@/components/ui/stat";
import { createClient } from "@/lib/supabase/client";

interface EventoRow {
  id: string;
  titulo: string;
  tipo: string | null;
  ciudad: string | null;
  fecha_deseada: string | null;
  num_personas: number | null;
  presupuesto: number | null;
  estado: string;
  created_at: string;
  productor: { nombre: string; email: string } | null;
}

interface SolicitudRow {
  id: string;
  estado: string;
  created_at: string;
  venue: { nombre: string } | null;
}

const estadoVariant: Record<string, "default" | "success" | "warning" | "error"> = {
  borrador: "warning",
  activo: "success",
  en_propuestas: "warning",
  cerrado: "success",
  cancelado: "error",
};

const solicitudVariant: Record<string, "default" | "success" | "warning" | "error"> = {
  pendiente: "warning",
  aceptada: "success",
  rechazada: "error",
  info_solicitada: "default",
};

const DIAS = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

function formatDay(d: string | null): string {
  if (!d) return "—";
  const date = new Date(d);
  return `${DIAS[date.getDay()]} ${String(date.getDate()).padStart(2, "0")}`;
}

export default function AdminEventosPage() {
  const [eventos, setEventos] = useState<EventoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<EventoRow | null>(null);
  const [solicitudes, setSolicitudes] = useState<SolicitudRow[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("eventos")
        .select("*, productor:profiles!eventos_cliente_id_fkey(nombre, email)")
        .order("created_at", { ascending: false });

      setEventos(
        (data || []).map((e) => ({
          ...e,
          productor: Array.isArray(e.productor) ? e.productor[0] || null : e.productor,
        })) as EventoRow[]
      );
      setLoading(false);
    }
    load();
  }, []);

  async function openDetail(evento: EventoRow) {
    setSelected(evento);
    const supabase = createClient();
    const { data } = await supabase
      .from("solicitudes")
      .select("id, estado, created_at, venue:venues!solicitudes_venue_id_fkey(nombre)")
      .eq("evento_id", evento.id)
      .order("created_at", { ascending: false });

    setSolicitudes(
      (data || []).map((s) => ({
        ...s,
        venue: Array.isArray(s.venue) ? s.venue[0] || null : s.venue,
      })) as SolicitudRow[]
    );
  }

  const counts = {
    activos: eventos.filter((e) => e.estado === "activo").length,
    propuestas: eventos.filter((e) => e.estado === "en_propuestas").length,
    borradores: eventos.filter((e) => e.estado === "borrador").length,
    cerrados: eventos.filter((e) => e.estado === "cerrado").length,
  };

  return (
    <>
      <PageHead
        eyebrow="Cartelera de la red"
        title="Eventos"
        sub="Todo lo que se está produciendo, todo lo que se está negociando. Ordenado por fecha."
      />

      <div className="card-grid cols-4" style={{ marginBottom: 32 }}>
        <Stat label="Activos" value={loading ? "—" : counts.activos} accent />
        <Stat label="En propuestas" value={loading ? "—" : counts.propuestas} />
        <Stat label="Borradores" value={loading ? "—" : counts.borradores} />
        <Stat label="Cerrados" value={loading ? "—" : counts.cerrados} />
      </div>

      {loading ? (
        <div className="empty">
          <div className="msg">Cargando…</div>
        </div>
      ) : eventos.length === 0 ? (
        <div className="empty">
          <div className="num">0</div>
          <div className="msg">Sin eventos creados</div>
        </div>
      ) : (
        <div className="lineup">
          {eventos.map((e) => (
            <div
              key={e.id}
              className="row"
              data-cursor="abrir →"
              onClick={() => openDetail(e)}
              style={{ cursor: "none" }}
            >
              <span className="day">{formatDay(e.fecha_deseada)}</span>
              <span className="time">
                {e.fecha_deseada
                  ? new Date(e.fecha_deseada).toLocaleDateString("es-ES", {
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </span>
              <div>
                <div className="ttl">{e.titulo}</div>
                <div className="sub">
                  {[e.ciudad, e.num_personas ? `${e.num_personas} pax` : null, e.tipo]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </div>
              <Pill variant={estadoVariant[e.estado] || "default"} dot>
                {e.estado}
              </Pill>
              <span className="text-mute">{e.productor?.nombre || "—"}</span>
              <span className="cta">Abrir →</span>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.titulo || "Detalle del evento"}
      >
        {selected && (
          <div className="flex-col">
            <div className="card-grid cols-2" style={{ borderRadius: 4 }}>
              <div>
                <div className="text-mute" style={{ marginBottom: 4 }}>
                  FECHA
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600 }}>
                  {selected.fecha_deseada
                    ? new Date(selected.fecha_deseada).toLocaleDateString("es-ES")
                    : "—"}
                </div>
              </div>
              <div>
                <div className="text-mute" style={{ marginBottom: 4 }}>
                  PRODUCTOR
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>
                  {selected.productor?.nombre || "—"}
                  {selected.productor?.email && (
                    <span
                      style={{
                        display: "block",
                        fontSize: 12,
                        color: "var(--color-text-muted)",
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        marginTop: 4,
                      }}
                    >
                      {selected.productor.email}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-mute" style={{ marginBottom: 4 }}>
                  TIPO · CIUDAD
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>
                  {[selected.tipo, selected.ciudad].filter(Boolean).join(" · ") || "—"}
                </div>
              </div>
              <div>
                <div className="text-mute" style={{ marginBottom: 4 }}>
                  PAX · PRESUPUESTO
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>
                  {selected.num_personas || "—"}
                  {selected.presupuesto ? ` · ${selected.presupuesto.toLocaleString()}€` : ""}
                </div>
              </div>
            </div>
            <hr className="hr" />
            <div>
              <div className="text-mute" style={{ marginBottom: 12 }}>
                SOLICITUDES A ESPACIOS · {solicitudes.length}
              </div>
              {solicitudes.length === 0 ? (
                <div className="text-mute">Sin solicitudes a espacios</div>
              ) : (
                <div className="flex-col" style={{ gap: 8 }}>
                  {solicitudes.map((s) => (
                    <div
                      key={s.id}
                      className="card raised flex-row between"
                      style={{ padding: 14 }}
                    >
                      <span style={{ fontFamily: "var(--font-display)", fontSize: 16 }}>
                        {s.venue?.nombre || "—"}
                      </span>
                      <Pill variant={solicitudVariant[s.estado] || "default"} dot>
                        {s.estado}
                      </Pill>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
