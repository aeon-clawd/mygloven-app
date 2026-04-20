"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Venue } from "@/types/database";

const estadoBadge: Record<string, "success" | "warning" | "error" | "default"> = {
  activo: "success",
  borrador: "warning",
  pausado: "default",
  eliminado: "error",
};

export default function AdminEspaciosPage() {
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("venues")
        .select("*")
        .order("created_at", { ascending: false });
      setVenues((data as Venue[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = venues.filter(
    (v) =>
      v.nombre.toLowerCase().includes(search.toLowerCase()) ||
      v.ciudad?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Espacios</h1>
        <Button onClick={() => router.push("/admin/espacios/nuevo")}>
          <Plus size={16} /> Crear espacio
        </Button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <Input
          placeholder="Buscar por nombre o ciudad..."
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
            {search ? "No se encontraron espacios." : "No hay espacios registrados aún. Crea el primer espacio."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((venue) => (
            <Card
              key={venue.id}
              className="cursor-pointer hover:border-accent/50 transition-colors"
              onClick={() => router.push(`/admin/espacios/${venue.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{venue.nombre}</h3>
                  <p className="text-sm text-text-muted">
                    {venue.ciudad || "Sin ciudad"}
                  </p>
                </div>
                <Badge variant={estadoBadge[venue.estado]}>
                  {venue.estado}
                </Badge>
              </div>
              {venue.descripcion_corta && (
                <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                  {venue.descripcion_corta}
                </p>
              )}
              <div className="flex gap-4 text-xs text-text-muted">
                {venue.precio_desde && (
                  <span>
                    Desde {venue.precio_desde}€/{venue.unidad_precio}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
