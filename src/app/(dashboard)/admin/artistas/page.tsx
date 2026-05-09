"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Artista } from "@/types/database";

const estadoBadge: Record<string, "success" | "warning" | "error" | "default"> = {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Artistas</h1>
        <Button onClick={() => router.push("/admin/artistas/nuevo")}>
          <Plus size={16} /> Crear artista
        </Button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <Input
          placeholder="Buscar por nombre o género..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="h-36 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <p className="text-text-secondary text-sm">
            {search ? "No se encontraron artistas." : "No hay artistas registrados aún. Crea el primer artista."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((artist) => (
            <Card
              key={artist.id}
              className="cursor-pointer hover:border-accent/50 transition-colors"
              onClick={() => router.push(`/admin/artistas/${artist.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{artist.nombre}</h3>
                  <p className="text-sm text-text-muted">
                    {artist.genero_musical || "Sin género"}
                  </p>
                </div>
                <Badge variant={estadoBadge[artist.estado]}>
                  {artist.estado}
                </Badge>
              </div>
              {artist.descripcion_corta && (
                <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                  {artist.descripcion_corta}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
