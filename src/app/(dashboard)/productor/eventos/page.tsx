"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Stat } from "@/components/ui/stat";
import { PageHead } from "@/components/ui/page-head";
import { Icon } from "@/components/ui/icon";
import { Pill } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EventoDetailModal } from "@/components/productor/evento-detail-modal";
import { createClient } from "@/lib/supabase/client";
import { eventoLabel } from "@/lib/estado-labels";
import type { EstadoEvento } from "@/types/database";

interface EventoRow {
  id: string;
  titulo: string;
  tipo: string | null;
  ciudad: string | null;
  fecha_deseada: string | null;
  num_personas: number | null;
  estado: EstadoEvento;
  created_at: string;
}

const estadoVariant: Record<EstadoEvento, "default" | "success" | "warning" | "error"> = {
  borrador: "warning",
  activo: "success",
  en_propuestas: "warning",
  cerrado: "success",
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


export default function ProductorEventosPage() {
  const router = useRouter();
  const [eventos, setEventos] = useState<EventoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<EventoRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [detail, setDetail] = useState<EventoRow | null>(null);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("eventos")
      .select("id, titulo, tipo, ciudad, fecha_deseada, num_personas, estado, created_at")
      .order("created_at", { ascending: false });
    setEventos((data || []) as EventoRow[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete() {
    if (!toDelete) return;
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("eventos")
      .delete()
      .eq("id", toDelete.id)
      .eq("estado", "borrador");
    setDeleting(false);
    if (!error) {
      setEventos((prev) => prev.filter((e) => e.id !== toDelete.id));
      setToDelete(null);
    }
  }

  const counts = {
    propuestas: eventos.filter((e) => e.estado === "en_propuestas").length,
    confirmados: eventos.filter((e) => e.estado === "activo").length,
    borradores: eventos.filter((e) => e.estado === "borrador").length,
  };

  return (
    <>
      <PageHead
        eyebrow="Tus producciones"
        title="Mis eventos"
        sub="Lo que estás montando. Lo que ya cerraste. Y lo que aún no te has atrevido a empezar."
        actions={
          <Link href="/productor/canvas">
            <Button variant="primary" data-cursor="empezar →">
              <Icon.plus /> Nuevo evento
            </Button>
          </Link>
        }
      />

      <div className="card-grid cols-3" style={{ marginBottom: 32 }}>
        <Stat
          label="En propuestas"
          value={loading ? "—" : counts.propuestas}
          deltaDir="flat"
          delta="esperando respuesta"
        />
        <Stat
          label="Confirmados"
          value={loading ? "—" : counts.confirmados}
          deltaDir="up"
          delta="próximos 30 días"
          accent
        />
        <Stat
          label="Borradores"
          value={loading ? "—" : counts.borradores}
          deltaDir="flat"
          delta="por completar"
        />
      </div>

      {loading ? (
        <div className="empty">
          <div className="msg">Cargando…</div>
        </div>
      ) : eventos.length === 0 ? (
        <div className="empty">
          <div className="num">0</div>
          <div className="msg">Aún no tienes eventos</div>
          <span className="text-mute">Crea tu primer evento desde el canvas.</span>
          <Link href="/productor/canvas">
            <Button variant="primary" data-cursor="empezar →">
              <Icon.plus /> Crear evento
            </Button>
          </Link>
        </div>
      ) : (
        <div className="lineup">
          {eventos.map((e) => (
            <div
              key={e.id}
              className="row"
              data-cursor="abrir →"
              onClick={() =>
                e.estado === "borrador"
                  ? router.push(`/productor/canvas/${e.id}`)
                  : setDetail(e)
              }
              style={{ cursor: "none" }}
            >
              <span className="day">{formatDay(e.fecha_deseada)}</span>
              <span className="time">{formatMonth(e.fecha_deseada)}</span>
              <div>
                <div className="ttl">{e.titulo || "Evento sin título"}</div>
                <div className="sub">
                  {[e.ciudad, e.num_personas ? `${e.num_personas} pax` : null, e.tipo]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </div>
              </div>
              <Pill variant={estadoVariant[e.estado] || "default"} dot>
                {eventoLabel(e.estado)}
              </Pill>
              {e.estado === "borrador" ? (
                <button
                  type="button"
                  className="btn ghost"
                  data-cursor="borrar"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    setToDelete(e);
                  }}
                  aria-label="Borrar evento"
                >
                  <Icon.trash />
                </button>
              ) : (
                <span />
              )}
              <span className="cta">Abrir →</span>
            </div>
          ))}
        </div>
      )}

      <hr className="hr" />

      <div
        className="card raised"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
          gap: 24,
        }}
      >
        <div>
          <div className="page-eyebrow" style={{ marginBottom: 8 }}>
            — Lo siguiente
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 32,
              lineHeight: 1,
              fontWeight: 600,
              letterSpacing: "-.02em",
              marginBottom: 8,
            }}
          >
            Empieza un evento describiéndolo en una frase
            <span style={{ color: "var(--color-accent)" }}>.</span>
          </div>
          <p className="page-sub" style={{ margin: 0 }}>
            El canvas combina chat con my&apos;G y datos estructurados. Tú hablas, el sistema rellena.
          </p>
        </div>
        <Link href="/productor/canvas">
          <Button variant="primary" size="lg" data-cursor="abrir canvas →">
            Abrir canvas <Icon.arrow />
          </Button>
        </Link>
      </div>

      <EventoDetailModal
        evento={detail ? { id: detail.id, titulo: detail.titulo, estado: detail.estado } : null}
        onClose={() => setDetail(null)}
      />

      <Modal
        open={!!toDelete}
        onClose={() => (deleting ? undefined : setToDelete(null))}
        title="Borrar borrador"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setToDelete(null)}
              disabled={deleting}
              data-cursor="cancelar"
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleting}
              data-cursor="borrar"
            >
              {deleting ? "Borrando…" : "Borrar"}
            </Button>
          </>
        }
      >
        <p>
          ¿Seguro que quieres borrar{" "}
          <strong>{toDelete?.titulo || "este borrador"}</strong>? Esta acción no se puede deshacer.
        </p>
      </Modal>
    </>
  );
}
