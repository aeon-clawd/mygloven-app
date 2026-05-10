"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { createClient } from "@/lib/supabase/client";
import type { Venue, VenueAnnex, VenueImage } from "@/types/database";

function venueCapacity(venue: Venue, annexes: VenueAnnex[]): string | null {
  const caps = annexes
    .map((a) => Math.max(a.config_de_pie ?? 0, a.config_sentado ?? 0))
    .filter((n) => n > 0);
  if (caps.length === 0) return null;
  const max = Math.max(...caps);
  return `${max.toLocaleString("es-ES")} pax`;
}

export default function VenueDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [venue, setVenue] = useState<Venue | null>(null);
  const [annexes, setAnnexes] = useState<VenueAnnex[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [venueRes, annexesRes] = await Promise.all([
        supabase.from("venues").select("*").eq("id", id).single(),
        supabase
          .from("venue_annexes")
          .select("*")
          .eq("venue_id", id)
          .order("orden", { ascending: true }),
      ]);
      setVenue(venueRes.data as Venue | null);
      setAnnexes((annexesRes.data as VenueAnnex[]) || []);
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

  if (!venue) {
    return (
      <div className="empty">
        <div className="num">404</div>
        <div className="msg">Espacio no encontrado</div>
        <Link href="/productor/explorar">
          <Button variant="primary">Volver a Explorar</Button>
        </Link>
      </div>
    );
  }

  const images = (venue.images as VenueImage[] | null) ?? [];
  const gallery = images.slice(0, 6);
  const capacity = venueCapacity(venue, annexes);
  const cityCountry = [venue.ciudad?.trim(), venue.pais?.trim()]
    .filter(Boolean)
    .join(", ");

  const platforms = [
    { k: "web", l: "Web oficial", v: venue.web },
    {
      k: "instagram",
      l: "Instagram",
      v: venue.instagram
        ? venue.instagram.startsWith("http")
          ? venue.instagram
          : `https://instagram.com/${venue.instagram.replace(/^@/, "")}`
        : null,
    },
    { k: "email", l: "Email", v: venue.email ? `mailto:${venue.email}` : null },
  ].filter((p) => Boolean(p.v));

  return (
    <>
      <Link href="/productor/explorar" className="detail-back" data-cursor="volver">
        ← Explorar
      </Link>

      <section className="detail-hero">
        <div className="page-eyebrow" style={{ marginBottom: 16 }}>
          — {venue.tipo || "Espacio"}
          {venue.ciudad ? ` · ${venue.ciudad}` : ""}
        </div>
        <h1>
          {venue.nombre}
          <span className="ap">.</span>
        </h1>
        <div className="detail-meta">
          {cityCountry && (
            <div className="item">
              <span className="lbl">Ciudad</span>
              <span className="val">{cityCountry}</span>
            </div>
          )}
          {capacity && (
            <div className="item">
              <span className="lbl">Capacidad</span>
              <span className="val">{capacity}</span>
            </div>
          )}
          {venue.tipo && (
            <div className="item">
              <span className="lbl">Tipo</span>
              <span className="val">{venue.tipo}</span>
            </div>
          )}
          {venue.precio_desde && (
            <div className="item">
              <span className="lbl">Precio desde</span>
              <span className="val">
                {venue.precio_desde.toLocaleString("es-ES")}€ / {venue.unidad_precio}
              </span>
            </div>
          )}
        </div>
      </section>

      {gallery.length > 0 && (
        <div className="detail-gallery">
          {gallery.map((img, i) => (
            <div className="ph" key={i}>
              <Image
                src={img.url}
                alt={img.label || venue.nombre}
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

      <section className="detail-body">
        <div>
          {venue.descripcion && <p>{venue.descripcion}</p>}
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <Button variant="primary" disabled data-cursor="propuesta →">
              Enviar propuesta <Icon.arrow />
            </Button>
            {venue.web && (
              <a href={venue.web} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" data-cursor="web ↗">
                  Web oficial
                </Button>
              </a>
            )}
          </div>
        </div>

        <aside className="detail-aside">
          <h4>— Datos clave</h4>
          {capacity && (
            <div className="detail-data-row">
              <span className="k">Aforo</span>
              <span className="v accent">{capacity}</span>
            </div>
          )}
          {venue.barrio && (
            <div className="detail-data-row">
              <span className="k">Distrito</span>
              <span className="v">{venue.barrio}</span>
            </div>
          )}
          {venue.equipo_sonido && (
            <div className="detail-data-row">
              <span className="k">Sonido</span>
              <span className="v">{venue.equipo_sonido}</span>
            </div>
          )}
          {venue.exterior && (
            <div className="detail-data-row">
              <span className="k">Exterior</span>
              <span className="v">Sí</span>
            </div>
          )}
          {venue.licencia_musica && (
            <div className="detail-data-row">
              <span className="k">Lic. música</span>
              <span className="v">Sí</span>
            </div>
          )}

          {annexes.length > 0 && (
            <>
              <h4>— Anexos</h4>
              <div className="platforms">
                {annexes.map((a) => {
                  const cap = Math.max(a.config_de_pie ?? 0, a.config_sentado ?? 0);
                  return (
                    <a key={a.id} href="#" data-cursor="ver">
                      <span>{a.nombre}</span>
                      <span>{cap > 0 ? `${cap} pax` : "—"}</span>
                    </a>
                  );
                })}
              </div>
            </>
          )}

          {platforms.length > 0 && (
            <>
              <h4>— Contacto</h4>
              <div className="platforms">
                {platforms.map((p) => (
                  <a
                    key={p.k}
                    href={p.v as string}
                    target={p.k === "email" ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    data-cursor={p.k === "email" ? "email" : "abrir ↗"}
                  >
                    <span>{p.l}</span>
                    <span>↗</span>
                  </a>
                ))}
              </div>
            </>
          )}
        </aside>
      </section>
    </>
  );
}
