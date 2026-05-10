"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pill } from "@/components/ui/badge";
import { Stat } from "@/components/ui/stat";
import { PageHead } from "@/components/ui/page-head";
import { createClient } from "@/lib/supabase/client";

interface Stats {
  productores: number;
  espacios: number;
  eventos: number;
  solicitudes: number;
  candidaturasPendientes: number;
}

interface CandidaturaReciente {
  id: string;
  rol: string;
  created_at: string;
  usuario: { nombre: string; email: string } | null;
}

export default function AdminPanelPage() {
  const [stats, setStats] = useState<Stats>({
    productores: 0,
    espacios: 0,
    eventos: 0,
    solicitudes: 0,
    candidaturasPendientes: 0,
  });
  const [candidaturasRecientes, setCandidaturasRecientes] = useState<CandidaturaReciente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const [productores, espacios, eventos, solicitudes, candidaturas, recientes] =
        await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }).eq("rol", "productor"),
          supabase.from("venues").select("id", { count: "exact", head: true }),
          supabase.from("eventos").select("id", { count: "exact", head: true }),
          supabase.from("solicitudes").select("id", { count: "exact", head: true }),
          supabase.from("candidaturas").select("id", { count: "exact", head: true }).eq("estado", "pendiente"),
          supabase
            .from("candidaturas")
            .select("id, rol, created_at, usuario:profiles!candidaturas_usuario_id_fkey(nombre, email)")
            .eq("estado", "pendiente")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

      setStats({
        productores: productores.count || 0,
        espacios: espacios.count || 0,
        eventos: eventos.count || 0,
        solicitudes: solicitudes.count || 0,
        candidaturasPendientes: candidaturas.count || 0,
      });

      if (recientes.data) {
        setCandidaturasRecientes(
          recientes.data.map((c) => ({
            ...c,
            usuario: Array.isArray(c.usuario) ? c.usuario[0] || null : c.usuario,
          })) as CandidaturaReciente[]
        );
      }

      setLoading(false);
    }
    load();
  }, []);

  const rolLabels: Record<string, string> = {
    venue: "Espacio",
    artista: "Artista",
    proveedor: "Proveedor",
  };

  return (
    <>
      <PageHead
        eyebrow="Vista de operaciones"
        title="Panel"
        sub="Estado del sistema en tiempo real. Cifras de la red, candidaturas pendientes, eventos activos esta semana."
      />

      <div className="card-grid cols-4" style={{ marginBottom: 32 }}>
        <Stat label="Productores" value={loading ? "—" : stats.productores} />
        <Stat label="Espacios" value={loading ? "—" : stats.espacios} />
        <Stat label="Eventos" value={loading ? "—" : stats.eventos} accent />
        <Stat label="Solicitudes" value={loading ? "—" : stats.solicitudes} />
      </div>

      <div className="flex-row between" style={{ marginBottom: 16 }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 24,
            margin: 0,
            fontWeight: 600,
            letterSpacing: "-.01em",
          }}
        >
          Candidaturas pendientes
        </h2>
        {stats.candidaturasPendientes > 0 && (
          <Pill variant="warning" dot>
            {stats.candidaturasPendientes} pendientes
          </Pill>
        )}
      </div>

      {!loading && candidaturasRecientes.length === 0 ? (
        <div className="empty">
          <div className="num">0</div>
          <div className="msg">No hay candidaturas pendientes</div>
          <span className="text-mute">Las nuevas aparecerán aquí.</span>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th className="row-num">№</th>
                <th>Solicitante</th>
                <th>Rol</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {candidaturasRecientes.map((c, i) => (
                <tr key={c.id}>
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
                  <td className="cta">
                    <Link href="/admin/candidaturas" data-cursor="revisar →">
                      Revisar →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
