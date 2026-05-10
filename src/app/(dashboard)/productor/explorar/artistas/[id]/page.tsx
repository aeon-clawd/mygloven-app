"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { createClient } from "@/lib/supabase/client";
import type { Artista, ArtistImage } from "@/types/database";

export default function ArtistDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [artist, setArtist] = useState<Artista | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("artistas")
        .select("*")
        .eq("id", id)
        .single();
      setArtist(data as Artista | null);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="empty">
        <div className="msg">Cargando…</div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="empty">
        <div className="num">404</div>
        <div className="msg">Artista no encontrado</div>
        <Link href="/productor/explorar">
          <Button variant="primary">Volver a Explorar</Button>
        </Link>
      </div>
    );
  }

  const images = (artist.images as ArtistImage[] | null) ?? [];
  const gallery = images.slice(0, 6);

  const platforms = [
    { k: "spotify", l: "Spotify", v: artist.spotify },
    { k: "youtube", l: "YouTube", v: artist.youtube },
    { k: "soundcloud", l: "SoundCloud", v: artist.soundcloud },
    { k: "instagram", l: "Instagram", v: artist.instagram },
    { k: "linktree", l: "Linktree", v: artist.linktree },
    { k: "web", l: "Web oficial", v: artist.web },
  ].filter((p) => Boolean(p.v));

  function platformHref(k: string, v: string): string {
    if (v.startsWith("http")) return v;
    if (k === "instagram") return `https://instagram.com/${v.replace(/^@/, "")}`;
    return v;
  }

  return (
    <>
      <Link href="/productor/explorar" className="detail-back" data-cursor="volver">
        ← Roster
      </Link>

      <section className="detail-hero">
        <div className="page-eyebrow" style={{ marginBottom: 16 }}>
          — {artist.genero_musical || "Artista"}
        </div>
        <h1>
          {artist.nombre}
          <span className="ap">.</span>
        </h1>
        <div className="detail-meta">
          {artist.genero_musical && (
            <div className="item">
              <span className="lbl">Disciplina</span>
              <span className="val">{artist.genero_musical}</span>
            </div>
          )}
          {artist.verificado && (
            <div className="item">
              <span className="lbl">Estado</span>
              <span className="val" style={{ color: "var(--color-accent)" }}>
                Verificado
              </span>
            </div>
          )}
          <div className="item">
            <span className="lbl">Disponibilidad</span>
            <span className="val">Activa</span>
          </div>
        </div>
      </section>

      <section className="detail-body">
        <div>
          {artist.bio && <p>{artist.bio}</p>}
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <Button variant="primary" disabled data-cursor="contratar →">
              Contratar <Icon.arrow />
            </Button>
            {artist.rider && (
              <a href={artist.rider} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" data-cursor="rider">
                  Ver rider
                </Button>
              </a>
            )}
          </div>
        </div>

        <aside className="detail-aside">
          <h4>— Plataformas</h4>
          {platforms.length === 0 ? (
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--color-text-muted)",
              }}
            >
              Próximamente
            </div>
          ) : (
            <div className="platforms">
              {platforms.map((p) => (
                <a
                  key={p.k}
                  href={platformHref(p.k, p.v as string)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="abrir ↗"
                >
                  <span>{p.l}</span>
                  <span>↗</span>
                </a>
              ))}
            </div>
          )}

          {(artist.email || artist.telefono) && (
            <>
              <h4>— Contacto</h4>
              <div className="platforms">
                {artist.email && (
                  <a href={`mailto:${artist.email}`} data-cursor="email">
                    <span>Email</span>
                    <span>↗</span>
                  </a>
                )}
                {artist.telefono && (
                  <a href={`tel:${artist.telefono}`} data-cursor="llamar">
                    <span>Teléfono</span>
                    <span>↗</span>
                  </a>
                )}
              </div>
            </>
          )}
        </aside>
      </section>

      {gallery.length > 0 && (
        <div className="detail-gallery">
          {gallery.map((img, i) => (
            <div className="ph" key={i}>
              <Image
                src={img.url}
                alt={img.label || artist.nombre}
                fill
                style={{ objectFit: "cover" }}
                unoptimized
              />
              <span className="stamp">
                — {String(i + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
