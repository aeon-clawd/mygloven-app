"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface CandidaturaRow {
  id: string;
  usuario_id: string;
  rol: string;
  estado: string;
  datos: Record<string, unknown>;
  notas_admin: string | null;
  created_at: string;
  usuario: { nombre: string; email: string; ciudad: string | null } | null;
}

const rolLabels: Record<string, string> = {
  venue: "Espacio",
  artista: "Artista",
  proveedor: "Proveedor",
};

const estadoBadge: Record<string, "warning" | "success" | "error"> = {
  pendiente: "warning",
  aprobada: "success",
  rechazada: "error",
};

export default function AdminCandidaturasPage() {
  const [candidaturas, setCandidaturas] = useState<CandidaturaRow[]>([]);
  const [filtro, setFiltro] = useState<string>("pendiente");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CandidaturaRow | null>(null);
  const [notas, setNotas] = useState("");

  async function loadCandidaturas() {
    const supabase = createClient();
    let query = supabase
      .from("candidaturas")
      .select("*, usuario:profiles!candidaturas_usuario_id_fkey(nombre, email, ciudad)")
      .order("created_at", { ascending: false });

    if (filtro !== "todas") {
      query = query.eq("estado", filtro);
    }

    const { data } = await query;
    setCandidaturas(
      (data || []).map((c) => ({
        ...c,
        usuario: Array.isArray(c.usuario) ? c.usuario[0] || null : c.usuario,
      })) as CandidaturaRow[]
    );
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    loadCandidaturas();
  }, [filtro]);

  async function handleDecision(id: string, estado: "aprobada" | "rechazada") {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("candidaturas").update({
      estado,
      notas_admin: notas || null,
      revisado_por: user?.id,
    }).eq("id", id);

    if (estado === "aprobada" && selected) {
      await supabase.from("profiles").update({ estado: "activo" }).eq("id", selected.usuario_id);
    }

    setSelected(null);
    setNotas("");
    loadCandidaturas();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Candidaturas</h1>
        <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
          {["pendiente", "aprobada", "rechazada", "todas"].map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filtro === f
                  ? "bg-accent text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {f === "todas" ? "Todas" : f.charAt(0).toUpperCase() + f.slice(1) + "s"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Card className="animate-pulse h-32" />
      ) : candidaturas.length === 0 ? (
        <Card>
          <p className="text-text-secondary text-sm">
            No hay candidaturas {filtro !== "todas" ? filtro + "s" : ""}.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {candidaturas.map((c) => (
            <Card
              key={c.id}
              className="flex items-center justify-between cursor-pointer hover:border-accent/50 transition-colors"
              onClick={() => {
                setSelected(c);
                setNotas(c.notas_admin || "");
              }}
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent text-sm font-bold">
                  {c.usuario?.nombre?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="font-medium">{c.usuario?.nombre || "Sin nombre"}</p>
                  <p className="text-sm text-text-muted">{c.usuario?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge>{rolLabels[c.rol]}</Badge>
                <Badge variant={estadoBadge[c.estado]}>{c.estado}</Badge>
                <span className="text-xs text-text-muted">
                  {new Date(c.created_at).toLocaleDateString("es-ES")}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => { setSelected(null); setNotas(""); }}
        title="Revisar candidatura"
        size="lg"
      >
        {selected && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-text-muted">Nombre</p>
                <p className="font-medium">{selected.usuario?.nombre}</p>
              </div>
              <div>
                <p className="text-text-muted">Email</p>
                <p className="font-medium">{selected.usuario?.email}</p>
              </div>
              <div>
                <p className="text-text-muted">Rol solicitado</p>
                <Badge>{rolLabels[selected.rol]}</Badge>
              </div>
              <div>
                <p className="text-text-muted">Ciudad</p>
                <p className="font-medium">{selected.usuario?.ciudad || "—"}</p>
              </div>
            </div>

            {selected.datos && Object.keys(selected.datos).length > 0 && (
              <div>
                <p className="text-sm text-text-muted mb-2">Datos del formulario</p>
                <div className="rounded-lg bg-background p-4 text-sm space-y-1">
                  {Object.entries(selected.datos).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <span className="text-text-muted">{key}:</span>
                      <span>{String(value ?? "")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(() => {
              const web = selected.datos?.web as string | undefined;
              const ig = selected.datos?.instagram as string | undefined;
              if (!web && !ig) return null;
              return (
              <div className="flex gap-3">
                {web && (
                  <a
                    href={web}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover"
                  >
                    <ExternalLink size={14} /> Web
                  </a>
                )}
                {ig && (
                  <a
                    href={`https://instagram.com/${ig.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover"
                  >
                    <ExternalLink size={14} /> Instagram
                  </a>
                )}
              </div>
              );
            })()}

            <div>
              <label className="mb-1.5 block text-sm text-text-secondary">
                Notas del admin
              </label>
              <Textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Notas internas sobre esta candidatura..."
              />
            </div>

            {selected.estado === "pendiente" && (
              <div className="flex gap-3 border-t border-border pt-4">
                <Button
                  onClick={() => handleDecision(selected.id, "aprobada")}
                  className="flex-1"
                >
                  <Check size={16} /> Aprobar
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDecision(selected.id, "rechazada")}
                  className="flex-1"
                >
                  <X size={16} /> Rechazar
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
