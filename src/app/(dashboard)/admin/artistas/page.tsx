"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHead } from "@/components/ui/page-head";
import { Icon } from "@/components/ui/icon";
import { createClient } from "@/lib/supabase/client";
import type { Artista } from "@/types/database";

const estadoVariant: Record<string, "success" | "warning" | "error" | "default"> = {
  activo: "success",
  borrador: "warning",
  pausado: "default",
  eliminado: "error",
};

export default function AdminArtistasPage() {
  const router = useRouter();
  const [artists, setArtists] = useState<Artista[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("artistas")
        .select("*")
        .order("created_at", { ascending: false });
      setArtists((data as Artista[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = artists.filter(
    (a) =>
      a.nombre.toLowerCase().includes(search.toLowerCase()) ||
      a.genero_musical?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <PageHead
        eyebrow={`Roster · ${artists.length} artista${artists.length !== 1 ? "s" : ""}`}
        title="Artistas"
        sub="DJs, bandas, performers. Filtrables por disciplina, ciudad y rango de precio."
        actions={
          <Button
            variant="primary"
            onClick={() => router.push("/admin/artistas/nuevo")}
            data-cursor="crear →"
          >
            <Icon.plus /> Nuevo artista
          </Button>
        }
      />

      <div className="flex-row" style={{ marginBottom: 24, gap: 12 }}>
        <Input
          placeholder="Buscar por nombre o género…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 360 }}
        />
        <span className="text-mute" style={{ marginLeft: "auto" }}>
          {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div className="empty">
          <div className="msg">Cargando…</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="num">0</div>
          <div className="msg">
            {search ? "Sin resultados" : "Sin artistas — crea el primero"}
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th className="row-num">№</th>
                <th>Nombre</th>
                <th>Género</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr
                  key={a.id}
                  data-cursor="ver →"
                  onClick={() => router.push(`/admin/artistas/${a.id}`)}
                  style={{ cursor: "none" }}
                >
                  <td className="row-num">{String(i + 1).padStart(3, "0")}</td>
                  <td
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 16,
                      fontWeight: 600,
                    }}
                  >
                    {a.nombre}
                    {a.descripcion_corta && (
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color: "var(--color-text-muted)",
                          fontWeight: 400,
                          marginTop: 2,
                          letterSpacing: "0.04em",
                          textTransform: "none",
                        }}
                      >
                        {a.descripcion_corta}
                      </div>
                    )}
                  </td>
                  <td className="text-mute">{a.genero_musical || "—"}</td>
                  <td>
                    <Pill variant={estadoVariant[a.estado] || "default"} dot>
                      {a.estado}
                    </Pill>
                  </td>
                  <td className="cta">Ver →</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
