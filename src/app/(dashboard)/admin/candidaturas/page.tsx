"use client";

import { useEffect, useState, useCallback } from "react";
import { Pill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { PageHead } from "@/components/ui/page-head";
import { Icon } from "@/components/ui/icon";
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

const estadoVariant: Record<string, "warning" | "success" | "error"> = {
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

  const loadCandidaturas = useCallback(async () => {
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
  }, [filtro]);

  useEffect(() => {
    setLoading(true);
    loadCandidaturas();
  }, [loadCandidaturas]);

  async function handleDecision(id: string, estado: "aprobada" | "rechazada") {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase
      .from("candidaturas")
      .update({
        estado,
        notas_admin: notas || null,
        revisado_por: user?.id,
      })
      .eq("id", id);

    if (estado === "aprobada" && selected) {
      await supabase.from("profiles").update({ estado: "activo" }).eq("id", selected.usuario_id);
    }

    setSelected(null);
    setNotas("");
    loadCandidaturas();
  }

  const filterCount = candidaturas.length;

  return (
    <>
      <PageHead
        eyebrow="Quién entra al sistema"
        title="Candidaturas"
        sub="Cada espacio, artista y proveedor pasa por aquí antes de entrar a la red. Decide en tres clics."
      />

      <div className="flex-row between" style={{ marginBottom: 24 }}>
        <div className="segmented">
          {["pendiente", "aprobada", "rechazada", "todas"].map((f) => (
            <button
              key={f}
              type="button"
              className={filtro === f ? "active" : ""}
              onClick={() => setFiltro(f)}
              data-cursor="filtrar"
            >
              {f === "todas" ? "Todas" : f}
            </button>
          ))}
        </div>
        <span className="text-mute">
          {filterCount} resultado{filterCount !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div className="empty">
          <div className="msg">Cargando…</div>
        </div>
      ) : candidaturas.length === 0 ? (
        <div className="empty">
          <div className="num">0</div>
          <div className="msg">Sin candidaturas {filtro !== "todas" ? `${filtro}s` : ""}</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th className="row-num">№</th>
                <th>Solicitante</th>
                <th>Rol</th>
                <th>Ciudad</th>
                <th>Estado</th>
                <th>Recibida</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {candidaturas.map((c, i) => (
                <tr
                  key={c.id}
                  data-cursor="abrir →"
                  onClick={() => {
                    setSelected(c);
                    setNotas(c.notas_admin || "");
                  }}
                  style={{ cursor: "none" }}
                >
                  <td className="row-num">{String(i + 1).padStart(3, "0")}</td>
                  <td>
                    <div>{c.usuario?.nombre || "Sin nombre"}</div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--color-text-muted)",
                        marginTop: 2,
                      }}
                    >
                      {c.usuario?.email}
                    </div>
                  </td>
                  <td>
                    <Pill>{rolLabels[c.rol] || c.rol}</Pill>
                  </td>
                  <td className="text-mute">{c.usuario?.ciudad || "—"}</td>
                  <td>
                    <Pill variant={estadoVariant[c.estado] || "default"} dot>
                      {c.estado}
                    </Pill>
                  </td>
                  <td className="text-mute">
                    {new Date(c.created_at).toLocaleDateString("es-ES")}
                  </td>
                  <td className="cta">Abrir →</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => {
          setSelected(null);
          setNotas("");
        }}
        title={selected?.usuario?.nombre || "Candidatura"}
        footer={
          selected?.estado === "pendiente" && (
            <>
              <Button
                variant="danger"
                onClick={() => handleDecision(selected.id, "rechazada")}
                data-cursor="rechazar"
              >
                <Icon.x /> Rechazar
              </Button>
              <Button
                variant="primary"
                onClick={() => handleDecision(selected.id, "aprobada")}
                data-cursor="aprobar"
              >
                <Icon.check /> Aprobar
              </Button>
            </>
          )
        }
      >
        {selected && (
          <div className="flex-col">
            <div className="card-grid cols-2" style={{ borderRadius: 4 }}>
              <div>
                <div className="text-mute" style={{ marginBottom: 4 }}>
                  NOMBRE
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600 }}>
                  {selected.usuario?.nombre}
                </div>
              </div>
              <div>
                <div className="text-mute" style={{ marginBottom: 4 }}>
                  EMAIL
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
                  {selected.usuario?.email}
                </div>
              </div>
              <div>
                <div className="text-mute" style={{ marginBottom: 4 }}>
                  ROL SOLICITADO
                </div>
                <Pill>{rolLabels[selected.rol]}</Pill>
              </div>
              <div>
                <div className="text-mute" style={{ marginBottom: 4 }}>
                  CIUDAD
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600 }}>
                  {selected.usuario?.ciudad || "—"}
                </div>
              </div>
            </div>

            {selected.datos && Object.keys(selected.datos).length > 0 && (
              <div>
                <div className="text-mute" style={{ marginBottom: 8 }}>
                  DATOS DEL FORMULARIO
                </div>
                <div className="card raised" style={{ fontSize: 13 }}>
                  {Object.entries(selected.datos).map(([key, value]) => (
                    <div
                      key={key}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "120px 1fr",
                        gap: 12,
                        padding: "6px 0",
                      }}
                    >
                      <span className="text-mute" style={{ textTransform: "uppercase" }}>
                        {key}
                      </span>
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
                <div className="flex-row" style={{ paddingTop: 8, gap: 16 }}>
                  {web && (
                    <a
                      href={web}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="web ↗"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        color: "var(--color-accent)",
                      }}
                    >
                      <Icon.ext /> {web}
                    </a>
                  )}
                  {ig && (
                    <a
                      href={`https://instagram.com/${ig.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="instagram ↗"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        color: "var(--color-accent)",
                      }}
                    >
                      <Icon.ext /> @{ig.replace("@", "")}
                    </a>
                  )}
                </div>
              );
            })()}

            <Field label="Notas internas">
              <Textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Notas para el equipo…"
              />
            </Field>
          </div>
        )}
      </Modal>
    </>
  );
}
