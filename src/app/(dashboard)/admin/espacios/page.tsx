"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Pill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHead } from "@/components/ui/page-head";
import { Icon } from "@/components/ui/icon";
import { createClient } from "@/lib/supabase/client";
import type { Venue, VenueImage } from "@/types/database";

const estadoVariant: Record<string, "success" | "warning" | "error" | "default"> = {
  activo: "success",
  borrador: "warning",
  pausado: "default",
  eliminado: "error",
};

function getCover(venue: Venue): string | null {
  const imgs = (venue.images as VenueImage[] | null) || [];
  if (imgs.length === 0) return null;
  const principal = imgs.find((i) => i.tag === "principal");
  return (principal ?? imgs[0]).url;
}

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
    <>
      <PageHead
        eyebrow={`Inventario de la red · ${venues.length} espacio${venues.length !== 1 ? "s" : ""}`}
        title="Espacios"
        sub="Cada espacio en my'G es una propiedad editada — copy real, fotografía cuidada, jerarquía propia."
        actions={
          <Button
            variant="primary"
            onClick={() => router.push("/admin/espacios/nuevo")}
            data-cursor="crear →"
          >
            <Icon.plus /> Nuevo espacio
          </Button>
        }
      />

      <div className="flex-row" style={{ marginBottom: 24, gap: 12 }}>
        <Input
          placeholder="Buscar por nombre o ciudad…"
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
            {search ? "Sin resultados" : "Sin espacios — crea el primero"}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {filtered.map((venue, i) => {
            const cover = getCover(venue);
            const num = String(i + 1).padStart(3, "0");
            return (
              <button
                type="button"
                key={venue.id}
                className="venue-tile"
                data-cursor="ver →"
                onClick={() => router.push(`/admin/espacios/${venue.id}`)}
              >
                <div className="ph">
                  {cover && (
                    <Image src={cover} alt={venue.nombre} fill style={{ objectFit: "cover" }} unoptimized />
                  )}
                  <span className="stamp">№ {num}</span>
                </div>
                <div className="body">
                  <div className="head">
                    <h3>{venue.nombre}</h3>
                    <Pill variant={estadoVariant[venue.estado] || "default"} dot>
                      {venue.estado}
                    </Pill>
                  </div>
                  <div className="city">— {venue.ciudad || "Sin ciudad"}</div>
                  {venue.descripcion_corta && <p className="desc">{venue.descripcion_corta}</p>}
                  <div className="foot">
                    <span>{venue.tipo || "—"}</span>
                    {venue.precio_desde && (
                      <span className="price">
                        {venue.precio_desde.toLocaleString("es-ES")}€ / {venue.unidad_precio}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
