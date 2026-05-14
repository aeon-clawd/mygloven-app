"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { createClient } from "@/lib/supabase/client";
import { eventoLabel, solicitudLabel } from "@/lib/estado-labels";
import type { EstadoEvento, EstadoSolicitud } from "@/types/database";

export interface EventoSummary {
  id: string;
  titulo: string;
  estado: EstadoEvento;
}

interface VenueSolicitudDetail {
  id: string;
  estado: EstadoSolicitud;
  respuesta_espacio: string | null;
  venue_nombre: string;
  annex_nombre: string | null;
}

interface ArtistaSolicitudDetail {
  id: string;
  estado: EstadoSolicitud;
  respuesta_artista: string | null;
  artista_nombre: string;
}

const estadoVariant: Record<EstadoEvento, "default" | "success" | "warning" | "error"> = {
  borrador: "warning",
  activo: "success",
  en_propuestas: "warning",
  cerrado: "success",
  cancelado: "error",
};

const respVariant: Record<EstadoSolicitud, "default" | "success" | "warning" | "error"> = {
  pendiente: "warning",
  aceptada: "success",
  rechazada: "error",
  info_solicitada: "default",
};

function unwrap<T>(rel: T | T[] | null | undefined): T | null {
  if (!rel) return null;
  return Array.isArray(rel) ? rel[0] ?? null : rel;
}

export function EventoDetailModal({
  evento,
  onClose,
}: {
  evento: EventoSummary | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [venueSols, setVenueSols] = useState<VenueSolicitudDetail[]>([]);
  const [artistaSols, setArtistaSols] = useState<ArtistaSolicitudDetail[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!evento) return;
    let cancelled = false;
    setLoading(true);
    setVenueSols([]);
    setArtistaSols([]);
    (async () => {
      const supabase = createClient();
      const [venueRes, artRes] = await Promise.all([
        supabase
          .from("solicitudes")
          .select(
            "id, estado, respuesta_espacio, venue:venues!solicitudes_venue_id_fkey(nombre), annex:venue_annexes!solicitudes_venue_annex_id_fkey(nombre)"
          )
          .eq("evento_id", evento.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("solicitudes_artistas")
          .select(
            "id, estado, respuesta_artista, artista:artistas!solicitudes_artistas_artista_id_fkey(nombre)"
          )
          .eq("evento_id", evento.id)
          .order("created_at", { ascending: false }),
      ]);
      if (cancelled) return;
      setVenueSols(
        ((venueRes.data ?? []) as Array<{
          id: string;
          estado: EstadoSolicitud;
          respuesta_espacio: string | null;
          venue: { nombre: string } | { nombre: string }[] | null;
          annex: { nombre: string } | { nombre: string }[] | null;
        }>).map((s) => ({
          id: s.id,
          estado: s.estado,
          respuesta_espacio: s.respuesta_espacio,
          venue_nombre: unwrap(s.venue)?.nombre ?? "—",
          annex_nombre: unwrap(s.annex)?.nombre ?? null,
        }))
      );
      setArtistaSols(
        ((artRes.data ?? []) as Array<{
          id: string;
          estado: EstadoSolicitud;
          respuesta_artista: string | null;
          artista: { nombre: string } | { nombre: string }[] | null;
        }>).map((s) => ({
          id: s.id,
          estado: s.estado,
          respuesta_artista: s.respuesta_artista,
          artista_nombre: unwrap(s.artista)?.nombre ?? "—",
        }))
      );
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [evento]);

  return (
    <Modal
      open={!!evento}
      onClose={onClose}
      title={evento?.titulo || "Detalle del evento"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
          {evento && (
            <Button
              variant="primary"
              onClick={() => router.push(`/productor/canvas/${evento.id}`)}
              data-cursor="abrir canvas →"
            >
              Abrir canvas <Icon.arrow />
            </Button>
          )}
        </>
      }
    >
      {evento && (
        <div className="flex-col">
          <div>
            <div className="text-mute" style={{ marginBottom: 6 }}>
              ESTADO
            </div>
            <Pill variant={estadoVariant[evento.estado] || "default"} dot>
              {eventoLabel(evento.estado)}
            </Pill>
          </div>
          <hr className="hr" />
          <div>
            <div className="text-mute" style={{ marginBottom: 8 }}>
              ESPACIO · {venueSols.length}
            </div>
            {loading ? (
              <div className="text-mute">Cargando…</div>
            ) : venueSols.length === 0 ? (
              <div className="text-mute">Sin solicitud de espacio.</div>
            ) : (
              <div className="flex-col" style={{ gap: 8 }}>
                {venueSols.map((s) => (
                  <div
                    key={s.id}
                    className="card raised"
                    style={{ padding: 14, display: "grid", gap: 6 }}
                  >
                    <div className="flex-row between">
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: 16,
                          fontWeight: 600,
                        }}
                      >
                        {s.annex_nombre
                          ? `${s.annex_nombre} · ${s.venue_nombre}`
                          : s.venue_nombre}
                      </span>
                      <Pill variant={respVariant[s.estado] || "default"} dot>
                        {solicitudLabel(s.estado)}
                      </Pill>
                    </div>
                    {s.respuesta_espacio && (
                      <div style={{ fontSize: 14 }}>
                        <span className="text-mute">Respuesta: </span>
                        {s.respuesta_espacio}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <hr className="hr" />
          <div>
            <div className="text-mute" style={{ marginBottom: 8 }}>
              ARTISTAS · {artistaSols.length}
            </div>
            {loading ? (
              <div className="text-mute">Cargando…</div>
            ) : artistaSols.length === 0 ? (
              <div className="text-mute">Sin solicitudes a artistas.</div>
            ) : (
              <div className="flex-col" style={{ gap: 8 }}>
                {artistaSols.map((s) => (
                  <div
                    key={s.id}
                    className="card raised"
                    style={{ padding: 14, display: "grid", gap: 6 }}
                  >
                    <div className="flex-row between">
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: 16,
                          fontWeight: 600,
                        }}
                      >
                        {s.artista_nombre}
                      </span>
                      <Pill variant={respVariant[s.estado] || "default"} dot>
                        {solicitudLabel(s.estado)}
                      </Pill>
                    </div>
                    {s.respuesta_artista && (
                      <div style={{ fontSize: 14 }}>
                        <span className="text-mute">Respuesta: </span>
                        {s.respuesta_artista}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
