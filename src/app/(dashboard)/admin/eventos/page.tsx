"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
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

const estadoBadge: Record<string, "default" | "success" | "warning" | "error"> = {
  borrador: "default",
  activo: "success",
  en_propuestas: "warning",
  cerrado: "success",
  cancelado: "error",
};

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

  const solicitudBadge: Record<string, "default" | "success" | "warning" | "error"> = {
    pendiente: "warning",
    aceptada: "success",
    rechazada: "error",
    info_solicitada: "default",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Eventos</h1>

      {loading ? (
        <Card className="animate-pulse h-32" />
      ) : eventos.length === 0 ? (
        <Card>
          <p className="text-text-secondary text-sm">No hay eventos creados aún.</p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-muted">
                <th className="px-6 py-3 font-medium">Evento</th>
                <th className="px-6 py-3 font-medium">Productor</th>
                <th className="px-6 py-3 font-medium">Tipo</th>
                <th className="px-6 py-3 font-medium">Ciudad</th>
                <th className="px-6 py-3 font-medium">Fecha</th>
                <th className="px-6 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((evento) => (
                <tr
                  key={evento.id}
                  className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors cursor-pointer"
                  onClick={() => openDetail(evento)}
                >
                  <td className="px-6 py-3 font-medium">{evento.titulo}</td>
                  <td className="px-6 py-3 text-text-secondary">
                    {evento.productor?.nombre || "—"}
                  </td>
                  <td className="px-6 py-3 text-text-secondary">{evento.tipo || "—"}</td>
                  <td className="px-6 py-3 text-text-secondary">{evento.ciudad || "—"}</td>
                  <td className="px-6 py-3 text-text-muted">
                    {evento.fecha_deseada
                      ? new Date(evento.fecha_deseada).toLocaleDateString("es-ES")
                      : "—"}
                  </td>
                  <td className="px-6 py-3">
                    <Badge variant={estadoBadge[evento.estado]}>{evento.estado}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Detalle del evento"
        size="lg"
      >
        {selected && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-text-muted">Título</p>
                <p className="font-medium">{selected.titulo}</p>
              </div>
              <div>
                <p className="text-text-muted">Productor</p>
                <p className="font-medium">{selected.productor?.nombre}</p>
                <p className="text-xs text-text-muted">{selected.productor?.email}</p>
              </div>
              <div>
                <p className="text-text-muted">Tipo</p>
                <p className="font-medium">{selected.tipo || "—"}</p>
              </div>
              <div>
                <p className="text-text-muted">Ciudad</p>
                <p className="font-medium">{selected.ciudad || "—"}</p>
              </div>
              <div>
                <p className="text-text-muted">Fecha deseada</p>
                <p className="font-medium">
                  {selected.fecha_deseada
                    ? new Date(selected.fecha_deseada).toLocaleDateString("es-ES")
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-text-muted">Personas</p>
                <p className="font-medium">{selected.num_personas || "—"}</p>
              </div>
              <div>
                <p className="text-text-muted">Presupuesto</p>
                <p className="font-medium">
                  {selected.presupuesto ? `${selected.presupuesto}€` : "—"}
                </p>
              </div>
              <div>
                <p className="text-text-muted">Estado</p>
                <Badge variant={estadoBadge[selected.estado]}>{selected.estado}</Badge>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-semibold mb-3">
                Solicitudes ({solicitudes.length})
              </h3>
              {solicitudes.length === 0 ? (
                <p className="text-sm text-text-muted">Sin solicitudes a espacios</p>
              ) : (
                <div className="space-y-2">
                  {solicitudes.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <span className="text-sm font-medium">{s.venue?.nombre || "—"}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={solicitudBadge[s.estado]}>{s.estado}</Badge>
                        <span className="text-xs text-text-muted">
                          {new Date(s.created_at).toLocaleDateString("es-ES")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
