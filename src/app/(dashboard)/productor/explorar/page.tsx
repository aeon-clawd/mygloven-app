"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { PageHead } from "@/components/ui/page-head";
import { createClient } from "@/lib/supabase/client";
import type { Venue, VenueImage, Artista, ArtistImage } from "@/types/database";

type Tab = "espacios" | "artistas";

function getVenueCover(venue: Venue): string | null {
  const imgs = (venue.images as VenueImage[] | null) || [];
  if (imgs.length === 0) return null;
  const principal = imgs.find((i) => i.tag === "principal");
  return (principal ?? imgs[0]).url;
}

function getArtistCover(artist: Artista): string | null {
  if (artist.avatar_url) return artist.avatar_url;
  const imgs = (artist.images as ArtistImage[] | null) || [];
  return imgs[0]?.url ?? null;
}

export default function ExplorarPage() {
  const [tab, setTab] = useState<Tab>("espacios");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [artists, setArtists] = useState<Artista[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [venueRes, artistRes] = await Promise.all([
        supabase
          .from("venues")
          .select("*")
          .eq("estado", "activo")
          .order("created_at", { ascending: false }),
        supabase
          .from("artistas")
          .select("*")
          .eq("estado", "activo")
          .order("created_at", { ascending: false }),
      ]);
      setVenues((venueRes.data as Venue[]) || []);
      setArtists((artistRes.data as Artista[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  const q = search.toLowerCase();
  const filteredVenues = venues.filter(
    (v) =>
      v.nombre.toLowerCase().includes(q) ||
      (v.ciudad?.toLowerCase().includes(q) ?? false)
  );
  const filteredArtists = artists.filter(
    (a) =>
      a.nombre.toLowerCase().includes(q) ||
      (a.genero_musical?.toLowerCase().includes(q) ?? false)
  );

  const list = tab === "espacios" ? filteredVenues : filteredArtists;

  return (
    <>
      <PageHead
        eyebrow="Marketplace"
        title="Explorar"
        sub="Espacios y artistas disponibles en my'G. Filtra, guarda favoritos, y mándales propuesta cuando estés listo."
        actions={
          <div className="segmented">
            {(
              [
                { k: "espacios", l: `Espacios · ${venues.length}` },
                { k: "artistas", l: `Artistas · ${artists.length}` },
              ] as const
            ).map((t) => (
              <button
                key={t.k}
                type="button"
                className={tab === t.k ? "active" : ""}
                onClick={() => setTab(t.k as Tab)}
                data-cursor={`ver`}
              >
                {t.l}
              </button>
            ))}
          </div>
        }
      />

      <div className="flex-row" style={{ marginBottom: 24, gap: 12 }}>
        <Input
          placeholder={
            tab === "espacios"
              ? "Buscar por nombre o ciudad…"
              : "Buscar por nombre o género…"
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 360 }}
        />
        <span className="text-mute" style={{ marginLeft: "auto" }}>
          {list.length} resultado{list.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div className="empty">
          <div className="msg">Cargando…</div>
        </div>
      ) : list.length === 0 ? (
        <div className="empty">
          <div className="num">0</div>
          <div className="msg">
            {search
              ? "Sin resultados"
              : tab === "espacios"
                ? "Aún no hay espacios activos"
                : "Aún no hay artistas activos"}
          </div>
        </div>
      ) : tab === "espacios" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {filteredVenues.map((venue, i) => {
            const cover = getVenueCover(venue);
            const num = String(i + 1).padStart(3, "0");
            return (
              <div key={venue.id} className="venue-tile" data-cursor="ver →">
                <div className="ph">
                  {cover && (
                    <Image
                      src={cover}
                      alt={venue.nombre}
                      fill
                      style={{ objectFit: "cover" }}
                      unoptimized
                    />
                  )}
                  <span className="stamp">№ {num}</span>
                </div>
                <div className="body">
                  <div className="head">
                    <h3>{venue.nombre}</h3>
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
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {filteredArtists.map((artist, i) => {
            const cover = getArtistCover(artist);
            const num = String(i + 1).padStart(3, "0");
            return (
              <div key={artist.id} className="venue-tile" data-cursor="ver →">
                <div className="ph">
                  {cover && (
                    <Image
                      src={cover}
                      alt={artist.nombre}
                      fill
                      style={{ objectFit: "cover" }}
                      unoptimized
                    />
                  )}
                  <span className="stamp">№ {num}</span>
                </div>
                <div className="body">
                  <div className="head">
                    <h3>{artist.nombre}</h3>
                  </div>
                  <div className="city">— {artist.genero_musical || "Sin género"}</div>
                  {artist.descripcion_corta && <p className="desc">{artist.descripcion_corta}</p>}
                  <div className="foot">
                    <span>{artist.verificado ? "Verificado" : "Artista"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
