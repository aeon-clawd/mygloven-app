"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { PageHead } from "@/components/ui/page-head";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { createClient } from "@/lib/supabase/client";

interface PhotoTile {
  key: string;
  url: string;
  title: string;
  subtitle: string;
  annex_id: string | null;
  venue_id: string;
  evento_id?: string | null;
}

interface RenderRow {
  id: string;
  prompt: string;
  base_image_url: string;
  output_image_url: string | null;
  status: "pendiente" | "generando" | "listo" | "error";
  error_message: string | null;
  created_at: string;
  evento_id: string | null;
  venue_annex_id: string | null;
}

function principalUrl(images: unknown): string | null {
  const arr = (images as { url: string; tag?: string }[] | null) ?? [];
  if (arr.length === 0) return null;
  return (arr.find((i) => i.tag === "principal") ?? arr[0]).url ?? null;
}

function unwrap<T>(rel: T | T[] | null | undefined): T | null {
  if (!rel) return null;
  return Array.isArray(rel) ? rel[0] ?? null : rel;
}

type Tab = "catalogo" | "eventos";
type Step = "pick" | "prompt" | "result";

export default function SpaceStudioPage() {
  const params = useSearchParams();
  const presetAnnex = params.get("annex_id");
  const presetEvento = params.get("evento_id");

  const [tab, setTab] = useState<Tab>("catalogo");
  const [step, setStep] = useState<Step>("pick");
  const [picked, setPicked] = useState<PhotoTile | null>(null);

  const [catalogo, setCatalogo] = useState<PhotoTile[]>([]);
  const [misEventos, setMisEventos] = useState<PhotoTile[]>([]);
  const [loadingCat, setLoadingCat] = useState(true);
  const [loadingEv, setLoadingEv] = useState(true);
  const [search, setSearch] = useState("");

  const [prompt, setPrompt] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSug, setLoadingSug] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [renderUrl, setRenderUrl] = useState<string | null>(null);
  const [renderId, setRenderId] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  const [gallery, setGallery] = useState<RenderRow[]>([]);

  const loadGallery = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("space_studio_renders")
      .select(
        "id, prompt, base_image_url, output_image_url, status, error_message, created_at, evento_id, venue_annex_id"
      )
      .order("created_at", { ascending: false })
      .limit(24);
    setGallery((data ?? []) as RenderRow[]);
  }, []);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  // Catalog: all active annexes with their parent venue info
  useEffect(() => {
    async function loadCat() {
      const supabase = createClient();
      const { data } = await supabase
        .from("venue_annexes")
        .select(
          "id, nombre, images, venue:venues!venue_annexes_venue_id_fkey(id, nombre, ciudad, images, estado)"
        );
      const tiles: PhotoTile[] = [];
      for (const a of (data ?? []) as Array<{
        id: string;
        nombre: string;
        images: unknown;
        venue: {
          id: string;
          nombre: string;
          ciudad: string | null;
          images: unknown;
          estado: string;
        } | { id: string; nombre: string; ciudad: string | null; images: unknown; estado: string }[] | null;
      }>) {
        const venue = unwrap(a.venue);
        if (!venue || venue.estado !== "activo") continue;
        const url = principalUrl(a.images) ?? principalUrl(venue.images);
        if (!url) continue;
        tiles.push({
          key: `annex-${a.id}`,
          url,
          title: a.nombre,
          subtitle: `${venue.nombre}${venue.ciudad ? ` · ${venue.ciudad}` : ""}`,
          annex_id: a.id,
          venue_id: venue.id,
        });
      }
      setCatalogo(tiles);
      setLoadingCat(false);
    }
    loadCat();
  }, []);

  // Mis eventos: eventos that have annex/venue selected, show their photo
  useEffect(() => {
    async function loadEv() {
      const supabase = createClient();
      const { data } = await supabase
        .from("eventos")
        .select(
          `id, titulo, fecha_deseada, estado, venue_id, venue_annex_id,
           venue:venues!eventos_venue_id_fkey(nombre, ciudad, images),
           annex:venue_annexes!eventos_venue_annex_id_fkey(nombre, images)`
        )
        .not("venue_id", "is", null)
        .order("created_at", { ascending: false });

      const tiles: PhotoTile[] = [];
      for (const e of (data ?? []) as Array<{
        id: string;
        titulo: string;
        fecha_deseada: string | null;
        estado: string;
        venue_id: string;
        venue_annex_id: string | null;
        venue: { nombre: string; ciudad: string | null; images: unknown } | { nombre: string; ciudad: string | null; images: unknown }[] | null;
        annex: { nombre: string; images: unknown } | { nombre: string; images: unknown }[] | null;
      }>) {
        const venue = unwrap(e.venue);
        const annex = unwrap(e.annex);
        const url =
          principalUrl(annex?.images) ?? principalUrl(venue?.images) ?? null;
        if (!url) continue;
        const where = annex?.nombre
          ? `${annex.nombre} · ${venue?.nombre ?? ""}`
          : venue?.nombre ?? "—";
        tiles.push({
          key: `ev-${e.id}`,
          url,
          title: e.titulo || "Evento sin título",
          subtitle: where,
          annex_id: e.venue_annex_id,
          venue_id: e.venue_id,
          evento_id: e.id,
        });
      }
      setMisEventos(tiles);
      setLoadingEv(false);
    }
    loadEv();
  }, []);

  // Preselect from query params after lists load.
  useEffect(() => {
    if (picked) return;
    if (presetEvento) {
      const t = misEventos.find((x) => x.evento_id === presetEvento);
      if (t) {
        setTab("eventos");
        setPicked(t);
        setStep("prompt");
      }
    } else if (presetAnnex) {
      const t = catalogo.find((x) => x.annex_id === presetAnnex);
      if (t) {
        setTab("catalogo");
        setPicked(t);
        setStep("prompt");
      }
    }
  }, [presetEvento, presetAnnex, misEventos, catalogo, picked]);

  const filteredCat = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return catalogo;
    return catalogo.filter(
      (t) =>
        t.title.toLowerCase().includes(q) || t.subtitle.toLowerCase().includes(q)
    );
  }, [catalogo, search]);

  async function fetchSuggestions() {
    if (!picked || loadingSug) return;
    setLoadingSug(true);
    try {
      const res = await fetch("/api/space-studio/suggest-prompts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          evento_id: picked.evento_id ?? null,
          venue_annex_id: picked.annex_id ?? null,
          venue_id: picked.venue_id ?? null,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; suggestions?: string[] };
      setSuggestions(json.suggestions ?? []);
    } finally {
      setLoadingSug(false);
    }
  }

  async function generate() {
    if (!picked || !prompt.trim() || generating) return;
    setGenerating(true);
    setRenderError(null);
    setRenderUrl(null);
    setRenderId(null);
    setStep("result");
    try {
      const res = await fetch("/api/space-studio/render", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          base_image_url: picked.url,
          prompt: prompt.trim(),
          evento_id: picked.evento_id ?? null,
          venue_annex_id: picked.annex_id ?? null,
          venue_id: picked.venue_id ?? null,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        id?: string;
        output_image_url?: string;
        error?: string;
      };
      if (!json.ok || !json.output_image_url) {
        setRenderError(json.error ?? "No se pudo generar la imagen.");
      } else {
        setRenderUrl(json.output_image_url);
        setRenderId(json.id ?? null);
        await loadGallery();
      }
    } catch (e) {
      setRenderError(e instanceof Error ? e.message : String(e));
    } finally {
      setGenerating(false);
    }
  }

  function reset() {
    setPicked(null);
    setPrompt("");
    setSuggestions([]);
    setRenderUrl(null);
    setRenderError(null);
    setRenderId(null);
    setStep("pick");
  }

  function startOver() {
    setRenderUrl(null);
    setRenderError(null);
    setRenderId(null);
    setStep("prompt");
  }

  const tiles = tab === "catalogo" ? filteredCat : misEventos;
  const loadingTiles = tab === "catalogo" ? loadingCat : loadingEv;

  return (
    <>
      <PageHead
        eyebrow="my'G — visualiza antes de firmar"
        title="Space Studio"
        sub="Elige una foto del espacio, describe cómo lo quieres y la IA te lo monta. Antes de hablar con un solo proveedor."
        actions={
          <div className="segmented">
            {(["pick", "prompt", "result"] as Step[]).map((s, i) => (
              <button
                key={s}
                type="button"
                className={step === s ? "active" : ""}
                onClick={() => {
                  if (s === "pick") reset();
                }}
                data-cursor={s === "pick" ? "volver a elegir" : undefined}
                disabled={s !== "pick" && (step === "pick" || (s === "result" && !renderUrl && !generating && !renderError))}
              >
                {`0${i + 1} / 03`}
              </button>
            ))}
          </div>
        }
      />

      {step === "pick" && (
        <>
          <div className="flex-row between" style={{ marginBottom: 24 }}>
            <div className="segmented">
              <button
                type="button"
                className={tab === "catalogo" ? "active" : ""}
                onClick={() => setTab("catalogo")}
                data-cursor="cambiar tab"
              >
                Desde el catálogo
              </button>
              <button
                type="button"
                className={tab === "eventos" ? "active" : ""}
                onClick={() => setTab("eventos")}
                data-cursor="cambiar tab"
              >
                Desde mis eventos
              </button>
            </div>
            {tab === "catalogo" && (
              <input
                className="input"
                placeholder="Buscar espacio…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ maxWidth: 280 }}
              />
            )}
          </div>

          {loadingTiles ? (
            <div className="empty">
              <div className="msg">Cargando…</div>
            </div>
          ) : tiles.length === 0 ? (
            <div className="empty">
              <div className="num">0</div>
              <div className="msg">
                {tab === "catalogo"
                  ? "Sin espacios con foto"
                  : "Aún no tienes eventos con espacio elegido"}
              </div>
            </div>
          ) : (
            <div className="studio-grid">
              {tiles.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className="studio-tile"
                  data-cursor="elegir →"
                  onClick={() => {
                    setPicked(t);
                    setStep("prompt");
                  }}
                >
                  <div className="ph">
                    <Image src={t.url} alt={t.title} fill style={{ objectFit: "cover" }} unoptimized />
                  </div>
                  <div className="meta">
                    <span className="ttl">{t.title}</span>
                    <span className="sub">{t.subtitle}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {step === "prompt" && picked && (
        <div className="studio-stage">
          <div className="studio-base">
            <div className="ph">
              <Image src={picked.url} alt={picked.title} fill style={{ objectFit: "cover" }} unoptimized />
            </div>
            <div className="meta">
              <span className="ttl">{picked.title}</span>
              <span className="sub">{picked.subtitle}</span>
            </div>
            <button type="button" className="btn ghost" onClick={reset} data-cursor="cambiar">
              <Icon.arrowLeft /> Elegir otra foto
            </button>
          </div>
          <div className="studio-prompt">
            <label className="text-mute">DESCRIBE CÓMO LO QUIERES MONTADO</label>
            <textarea
              className="input"
              rows={6}
              value={prompt}
              placeholder="Ej. Cena corporativa con mesas redondas para 10, iluminación cálida, decoración mediterránea, escenario al fondo."
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="flex-row" style={{ gap: 8, justifyContent: "space-between" }}>
              <Button
                variant="ghost"
                onClick={fetchSuggestions}
                disabled={loadingSug}
                data-cursor="sugerir"
              >
                {loadingSug ? "Pensando…" : "Sugiéreme ideas"}
              </Button>
              <Button
                variant="primary"
                onClick={generate}
                disabled={!prompt.trim() || generating}
                data-cursor="generar →"
              >
                Generar visualización <Icon.arrow />
              </Button>
            </div>
            {suggestions.length > 0 && (
              <div className="flex-col" style={{ gap: 6 }}>
                <span className="text-mute">SUGERENCIAS</span>
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    className="chip"
                    data-cursor="usar"
                    onClick={() => setPrompt(s)}
                    style={{ textAlign: "left" }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {step === "result" && picked && (
        <div className="studio-stage">
          <div className="studio-base">
            <span className="text-mute">ANTES</span>
            <div className="ph">
              <Image src={picked.url} alt="base" fill style={{ objectFit: "cover" }} unoptimized />
            </div>
          </div>
          <div className="studio-base">
            <span className="text-mute">DESPUÉS</span>
            <div className="ph">
              {generating ? (
                <div className="generating">Generando… esto tarda unos 20–40s.</div>
              ) : renderUrl ? (
                <Image src={renderUrl} alt="render" fill style={{ objectFit: "cover" }} unoptimized />
              ) : renderError ? (
                <div className="generating" style={{ color: "var(--color-error)" }}>
                  {renderError}
                </div>
              ) : null}
            </div>
            <div className="flex-row" style={{ gap: 8, marginTop: 12 }}>
              <Button variant="ghost" onClick={startOver} data-cursor="otro prompt">
                Cambiar prompt
              </Button>
              <Button
                variant="primary"
                onClick={generate}
                disabled={generating || !prompt.trim()}
                data-cursor="regenerar"
              >
                Regenerar
              </Button>
            </div>
            {renderId && renderUrl && (
              <a
                href={renderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-mute"
                style={{ marginTop: 8, display: "inline-block" }}
              >
                Abrir en grande ↗
              </a>
            )}
          </div>
        </div>
      )}

      <hr className="hr" />

      <div>
        <div className="flex-row between" style={{ marginBottom: 12 }}>
          <span className="page-eyebrow">— Tu galería</span>
          <span className="text-mute">{gallery.length} renders</span>
        </div>
        {gallery.length === 0 ? (
          <div className="empty">
            <div className="msg">Aún no has generado ninguna visualización.</div>
          </div>
        ) : (
          <div className="studio-grid">
            {gallery.map((r) => (
              <div key={r.id} className="studio-tile" style={{ cursor: "default" }}>
                <div className="ph">
                  {r.output_image_url ? (
                    <Image src={r.output_image_url} alt={r.prompt} fill style={{ objectFit: "cover" }} unoptimized />
                  ) : (
                    <div className="generating">{r.status}</div>
                  )}
                </div>
                <div className="meta">
                  <span className="sub" title={r.prompt}>
                    {r.prompt.slice(0, 80)}
                    {r.prompt.length > 80 ? "…" : ""}
                  </span>
                  <Pill
                    variant={
                      r.status === "listo"
                        ? "success"
                        : r.status === "error"
                          ? "error"
                          : "warning"
                    }
                    dot
                  >
                    {r.status}
                  </Pill>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
