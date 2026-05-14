"use client";

import { useEffect, useState } from "react";
import { Pill } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { PageHead } from "@/components/ui/page-head";
import { Stat } from "@/components/ui/stat";
import { createClient } from "@/lib/supabase/client";

const filtros = ["pendiente", "aceptada", "rechazada", "todas"] as const;
type Filtro = (typeof filtros)[number];

interface SolicitudArtistaRow {
  id: string;
  estado: string;
  fecha_evento: string | null;
  mensaje_productor: string | null;
  respuesta_artista: string | null;
  created_at: string;
  artista: { nombre: string } | null;
  evento: {
    id: string;
    titulo: string;
    tipo: string | null;
    ciudad: string | null;
    num_personas: number | null;
    presupuesto_min: number | null;
    presupuesto_max: number | null;
    cliente: { nombre: string; email: string } | null;
  } | null;
}

const estadoVariant: Record<string, "default" | "success" | "warning" | "error"> = {
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

function formatMonth(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-ES", { month: "short", year: "numeric" });
}

function unwrap<T>(rel: T | T[] | null | undefined): T | null {
  if (!rel) return null;
  return Array.isArray(rel) ? rel[0] ?? null : rel;
}

export default function ArtistaSolicitudesPage() {
  const [filtro, setFiltro] = useState<Filtro>("pendiente");
  const [rows, setRows] = useState<SolicitudArtistaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SolicitudArtistaRow | null>(null);
  const [decision, setDecision] = useState<"aceptada" | "rechazada" | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("solicitudes_artistas")
      .select(
        `id, estado, fecha_evento, mensaje_productor, respuesta_artista, created_at,
         artista:artistas!solicitudes_artistas_artista_id_fkey(nombre),
         evento:eventos!solicitudes_artistas_evento_id_fkey(
           id, titulo, tipo, ciudad, num_personas, presupuesto_min, presupuesto_max,
           cliente:profiles!eventos_cliente_id_fkey(nombre, email)
         )`
      )
      .order("created_at", { ascending: false });

    const mapped: SolicitudArtistaRow[] = (data ?? []).map((s) => {
      const evRaw = unwrap(s.evento) as {
        id: string;
        titulo: string;
        tipo: string | null;
        ciudad: string | null;
        num_personas: number | null;
        presupuesto_min: number | null;
        presupuesto_max: number | null;
        cliente: { nombre: string; email: string }[] | { nombre: string; email: string } | null;
      } | null;
      return {
        id: s.id as string,
        estado: s.estado as string,
        fecha_evento: s.fecha_evento as string | null,
        mensaje_productor: s.mensaje_productor as string | null,
        respuesta_artista: s.respuesta_artista as string | null,
        created_at: s.created_at as string,
        artista: unwrap(s.artista) as { nombre: string } | null,
        evento: evRaw
          ? {
              id: evRaw.id,
              titulo: evRaw.titulo,
              tipo: evRaw.tipo,
              ciudad: evRaw.ciudad,
              num_personas: evRaw.num_personas,
              presupuesto_min: evRaw.presupuesto_min,
              presupuesto_max: evRaw.presupuesto_max,
              cliente: unwrap(evRaw.cliente),
            }
          : null,
      };
    });
    setRows(mapped);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = rows.filter((r) => filtro === "todas" || r.estado === filtro);
  const counts = {
    pendiente: rows.filter((r) => r.estado === "pendiente").length,
    aceptada: rows.filter((r) => r.estado === "aceptada").length,
    rechazada: rows.filter((r) => r.estado === "rechazada").length,
  };

  function openDetail(s: SolicitudArtistaRow) {
    setSelected(s);
    setDecision(null);
    setMensaje("");
    setError(null);
  }

  async function submitDecision() {
    if (!selected || !decision) return;
    if (decision === "rechazada" && mensaje.trim().length === 0) {
      setError("Indica el motivo del rechazo.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/solicitudes-artistas/${selected.id}/responder`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ decision, mensaje: mensaje.trim() || undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error || "No se pudo guardar la respuesta.");
        return;
      }
      await load();
      setSelected(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHead
        eyebrow="Quién te quiere tocando"
        title="Solicitudes"
        sub="Productores que te quieren para sus eventos. Decide y deja tu nota."
      />

      <div className="card-grid cols-3" style={{ marginBottom: 32 }}>
        <Stat label="Pendientes" value={loading ? "—" : counts.pendiente} accent />
        <Stat label="Aceptadas" value={loading ? "—" : counts.aceptada} />
        <Stat label="Rechazadas" value={loading ? "—" : counts.rechazada} />
      </div>

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
        <span className="text-mute">{filtered.length} resultados</span>
      </div>

      {loading ? (
        <div className="empty">
          <div className="msg">Cargando…</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="num">0</div>
          <div className="msg">Sin solicitudes</div>
          <span className="text-mute">
            Cuando un productor te quiera para un evento, aparecerá aquí.
          </span>
        </div>
      ) : (
        <div className="lineup">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="row"
              data-cursor="abrir →"
              onClick={() => openDetail(r)}
              style={{ cursor: "none" }}
            >
              <span className="day">{formatDay(r.fecha_evento)}</span>
              <span className="time">{formatMonth(r.fecha_evento)}</span>
              <div>
                <div className="ttl">
                  {r.evento?.titulo || "—"}{" "}
                  <span className="text-mute" style={{ fontSize: 13, marginLeft: 6 }}>
                    como {r.artista?.nombre || "—"}
                  </span>
                </div>
                <div className="sub">
                  {[
                    r.evento?.cliente?.nombre,
                    r.evento?.ciudad,
                    r.evento?.tipo,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </div>
              </div>
              <Pill variant={estadoVariant[r.estado] || "default"} dot>
                {r.estado}
              </Pill>
              <span className="cta">Abrir →</span>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => (submitting ? undefined : setSelected(null))}
        title={selected?.evento?.titulo || "Solicitud"}
        footer={
          selected && selected.estado === "pendiente" ? (
            decision ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setDecision(null);
                    setMensaje("");
                    setError(null);
                  }}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button
                  variant={decision === "aceptada" ? "primary" : "danger"}
                  onClick={submitDecision}
                  disabled={submitting}
                >
                  {submitting
                    ? "Enviando…"
                    : decision === "aceptada"
                      ? "Confirmar aceptación"
                      : "Confirmar rechazo"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="danger" onClick={() => setDecision("rechazada")}>
                  Rechazar
                </Button>
                <Button variant="primary" onClick={() => setDecision("aceptada")}>
                  Aceptar
                </Button>
              </>
            )
          ) : (
            <Button variant="ghost" onClick={() => setSelected(null)}>
              Cerrar
            </Button>
          )
        }
      >
        {selected && (
          <div className="flex-col">
            <div className="card-grid cols-2" style={{ borderRadius: 4 }}>
              <DetailField label="Artista" value={selected.artista?.nombre || "—"} />
              <DetailField
                label="Productor"
                value={
                  selected.evento?.cliente?.nombre ||
                  selected.evento?.cliente?.email ||
                  "—"
                }
              />
              <DetailField
                label="Fecha"
                value={
                  selected.fecha_evento
                    ? new Date(selected.fecha_evento).toLocaleDateString("es-ES")
                    : "—"
                }
              />
              <DetailField
                label="Tipo · ciudad"
                value={
                  [selected.evento?.tipo, selected.evento?.ciudad].filter(Boolean).join(" · ") ||
                  "—"
                }
              />
              <DetailField
                label="Pax"
                value={
                  selected.evento?.num_personas ? String(selected.evento.num_personas) : "—"
                }
              />
              <DetailField
                label="Presupuesto"
                value={
                  selected.evento?.presupuesto_min || selected.evento?.presupuesto_max
                    ? `${selected.evento?.presupuesto_min?.toLocaleString("es-ES") ?? "?"} – ${
                        selected.evento?.presupuesto_max?.toLocaleString("es-ES") ?? "?"
                      } €`
                    : "—"
                }
              />
            </div>

            {selected.mensaje_productor && (
              <>
                <hr className="hr" />
                <div>
                  <div className="text-mute" style={{ marginBottom: 6 }}>
                    MENSAJE DEL PRODUCTOR
                  </div>
                  <div>{selected.mensaje_productor}</div>
                </div>
              </>
            )}

            {selected.respuesta_artista && (
              <>
                <hr className="hr" />
                <div>
                  <div className="text-mute" style={{ marginBottom: 6 }}>
                    TU RESPUESTA
                  </div>
                  <div>{selected.respuesta_artista}</div>
                </div>
              </>
            )}

            {selected.estado === "pendiente" && decision && (
              <>
                <hr className="hr" />
                <div className="flex-col" style={{ gap: 8 }}>
                  <label className="text-mute">
                    {decision === "rechazada"
                      ? "Motivo del rechazo (obligatorio)"
                      : "Mensaje al productor (opcional)"}
                  </label>
                  <textarea
                    className="input"
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    rows={4}
                    placeholder={
                      decision === "rechazada"
                        ? "Explica al productor por qué no puedes…"
                        : "Algo que quieras decir al productor…"
                    }
                  />
                  {error && <span style={{ color: "var(--color-danger)" }}>{error}</span>}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
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
