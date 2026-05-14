"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { PageHead } from "@/components/ui/page-head";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/modal";
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

const QUICK_CHIPS = [
  "Mesa cóctel",
  "Escenario / DJ",
  "Barra",
  "Plantas",
  "Luces cálidas",
  "Decoración floral",
  "Pantalla LED",
  "Sillas y mesas redondas",
];

function principalUrl(images: unknown): string | null {
  const arr = (images as { url: string; tag?: string }[] | null) ?? [];
  if (arr.length === 0) return null;
  return (arr.find((i) => i.tag === "principal") ?? arr[0]).url ?? null;
}

function unwrap<T>(rel: T | T[] | null | undefined): T | null {
  if (!rel) return null;
  return Array.isArray(rel) ? rel[0] ?? null : rel;
}

type PickerTab = "catalogo" | "eventos";

export default function SpaceStudioPage() {
  const params = useSearchParams();
  const presetAnnex = params.get("annex_id");
  const presetEvento = params.get("evento_id");

  const [picked, setPicked] = useState<PhotoTile | null>(null);

  // Catalog/events for the picker modal
  const [catalogo, setCatalogo] = useState<PhotoTile[]>([]);
  const [misEventos, setMisEventos] = useState<PhotoTile[]>([]);
  const [loadingCat, setLoadingCat] = useState(true);
  const [loadingEv, setLoadingEv] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTab, setPickerTab] = useState<PickerTab>("catalogo");
  const [pickerSearch, setPickerSearch] = useState("");

  // Prompt state
  const [prompt, setPrompt] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSug, setLoadingSug] = useState(false);

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [current, setCurrent] = useState<RenderRow | null>(null);

  // History thumbnails (renders for the current picked base url)
  const [history, setHistory] = useState<RenderRow[]>([]);

  const loadHistory = useCallback(async (baseUrl: string | null) => {
    if (!baseUrl) {
      setHistory([]);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase
      .from("space_studio_renders")
      .select(
        "id, prompt, base_image_url, output_image_url, status, error_message, created_at, evento_id, venue_annex_id"
      )
      .eq("base_image_url", baseUrl)
      .order("created_at", { ascending: false })
      .limit(20);
    const rows = (data ?? []) as RenderRow[];
    setHistory(rows);
    const firstReady = rows.find((r) => r.status === "listo" && r.output_image_url);
    setCurrent((cur) => cur ?? firstReady ?? null);
  }, []);

  // Catalog
  useEffect(() => {
    async function load() {
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
        venue:
          | { id: string; nombre: string; ciudad: string | null; images: unknown; estado: string }
          | { id: string; nombre: string; ciudad: string | null; images: unknown; estado: string }[]
          | null;
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
    load();
  }, []);

  // Mis eventos
  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("eventos")
        .select(
          `id, titulo, venue_id, venue_annex_id,
           venue:venues!eventos_venue_id_fkey(nombre, ciudad, images),
           annex:venue_annexes!eventos_venue_annex_id_fkey(nombre, images)`
        )
        .not("venue_id", "is", null)
        .order("created_at", { ascending: false });

      const tiles: PhotoTile[] = [];
      for (const e of (data ?? []) as Array<{
        id: string;
        titulo: string;
        venue_id: string;
        venue_annex_id: string | null;
        venue: { nombre: string; ciudad: string | null; images: unknown } | { nombre: string; ciudad: string | null; images: unknown }[] | null;
        annex: { nombre: string; images: unknown } | { nombre: string; images: unknown }[] | null;
      }>) {
        const venue = unwrap(e.venue);
        const annex = unwrap(e.annex);
        const url = principalUrl(annex?.images) ?? principalUrl(venue?.images);
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
    load();
  }, []);

  // Preselect from query params
  useEffect(() => {
    if (picked) return;
    if (presetEvento) {
      const t = misEventos.find((x) => x.evento_id === presetEvento);
      if (t) {
        setPicked(t);
        setPickerTab("eventos");
      }
    } else if (presetAnnex) {
      const t = catalogo.find((x) => x.annex_id === presetAnnex);
      if (t) {
        setPicked(t);
        setPickerTab("catalogo");
      }
    }
  }, [presetEvento, presetAnnex, catalogo, misEventos, picked]);

  // Refresh history when the picked base url changes
  useEffect(() => {
    setCurrent(null);
    loadHistory(picked?.url ?? null);
  }, [picked?.url, loadHistory]);

  const filteredCat = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    if (!q) return catalogo;
    return catalogo.filter(
      (t) => t.title.toLowerCase().includes(q) || t.subtitle.toLowerCase().includes(q)
    );
  }, [catalogo, pickerSearch]);

  function appendChip(text: string) {
    setPrompt((cur) => (cur.trim().length === 0 ? text : `${cur.trim()}, ${text}`));
  }

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
        await loadHistory(picked.url);
        // Optimistically show the just-finished render as current.
        setCurrent({
          id: json.id ?? "",
          prompt: prompt.trim(),
          base_image_url: picked.url,
          output_image_url: json.output_image_url,
          status: "listo",
          error_message: null,
          created_at: new Date().toISOString(),
          evento_id: picked.evento_id ?? null,
          venue_annex_id: picked.annex_id ?? null,
        });
      }
    } catch (e) {
      setRenderError(e instanceof Error ? e.message : String(e));
    } finally {
      setGenerating(false);
    }
  }

  return (
    <>
      <PageHead
        eyebrow="my'G — visualiza antes de firmar"
        title="Space Studio"
        sub="Elige una foto del espacio, descríbelo y la IA te lo muestra montado."
      />

      <div className="studio-board">
        {/* ── Columna izquierda ── */}
        <div className="studio-col left">
          <Section
            num="1"
            title="Foto del espacio"
            sub="Imagen real del espacio cargada en my'G"
          >
            {picked ? (
              <>
                <div className="studio-photo">
                  <Image src={picked.url} alt={picked.title} fill style={{ objectFit: "cover" }} unoptimized />
                </div>
                <div className="flex-row between" style={{ marginTop: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 14,
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {picked.title}
                    </div>
                    <div
                      className="text-mute"
                      style={{
                        fontSize: 11,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {picked.subtitle}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => setPickerOpen(true)}
                    data-cursor="cambiar"
                  >
                    <Icon.edit /> Cambiar foto
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                className="studio-photo studio-photo-empty"
                onClick={() => setPickerOpen(true)}
                data-cursor="elegir →"
              >
                <span>Elige una foto del espacio</span>
                <span className="text-mute" style={{ fontSize: 11, marginTop: 4 }}>
                  De catálogo o de tus eventos
                </span>
              </button>
            )}
          </Section>

          <Section
            num="2"
            title="Describe cómo quieres imaginar este espacio"
            sub="Cuéntanos qué elementos necesitas y cómo te gustaría que se vea."
          >
            <textarea
              className="input"
              rows={6}
              value={prompt}
              placeholder="Ej. Cena corporativa con mesas redondas para 10, iluminación cálida, escenario al fondo…"
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="studio-chips" style={{ marginTop: 8 }}>
              {QUICK_CHIPS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="chip"
                  onClick={() => appendChip(c)}
                  data-cursor="añadir"
                >
                  + {c}
                </button>
              ))}
            </div>

            <div className="flex-row" style={{ gap: 8, marginTop: 12 }}>
              <Button
                variant="ghost"
                onClick={fetchSuggestions}
                disabled={!picked || loadingSug}
                data-cursor="sugerir"
              >
                {loadingSug ? "Pensando…" : "Sugiéreme ideas"}
              </Button>
              <Button
                variant="primary"
                onClick={generate}
                disabled={!picked || !prompt.trim() || generating}
                data-cursor="generar →"
                full
              >
                {generating ? "Generando…" : "Generar imagen con IA"} <Icon.arrow />
              </Button>
            </div>

            {suggestions.length > 0 && (
              <div className="flex-col" style={{ gap: 6, marginTop: 12 }}>
                <span className="text-mute" style={{ fontSize: 10 }}>
                  SUGERENCIAS
                </span>
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    className="chip"
                    style={{ textAlign: "left", width: "100%" }}
                    onClick={() => setPrompt(s)}
                    data-cursor="usar"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* ── Columna derecha ── */}
        <div className="studio-col right">
          <Section
            num="3"
            title="Visualización generada por IA"
            sub="Así se vería tu espacio con los elementos que has pedido."
            action={
              current?.output_image_url && !generating ? (
                <Button
                  variant="ghost"
                  onClick={generate}
                  disabled={!prompt.trim() || generating}
                  data-cursor="regenerar"
                >
                  <Icon.arrow /> Regenerar
                </Button>
              ) : undefined
            }
          >
            <div className="studio-render">
              {generating ? (
                <div className="generating">Generando… esto tarda unos 20–40s.</div>
              ) : current?.output_image_url ? (
                <Image
                  src={current.output_image_url}
                  alt="render"
                  fill
                  style={{ objectFit: "cover" }}
                  unoptimized
                />
              ) : renderError ? (
                <div className="generating" style={{ color: "var(--color-error)" }}>
                  {renderError}
                </div>
              ) : (
                <div className="generating">
                  {picked
                    ? "Describe el montaje y dale a Generar."
                    : "Elige una foto para empezar."}
                </div>
              )}
            </div>

            {history.length > 0 && (
              <div className="studio-history">
                {history.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className={`thumb ${current?.id === r.id ? "active" : ""}`}
                    onClick={() => setCurrent(r)}
                    title={r.prompt}
                    data-cursor="ver"
                    disabled={!r.output_image_url}
                  >
                    {r.output_image_url ? (
                      <Image
                        src={r.output_image_url}
                        alt={r.prompt}
                        fill
                        style={{ objectFit: "cover" }}
                        unoptimized
                      />
                    ) : (
                      <span className="text-mute" style={{ fontSize: 9 }}>
                        {r.status}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>

      <Modal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Elige una foto del espacio"
      >
        <div className="flex-row between" style={{ marginBottom: 16 }}>
          <div className="segmented">
            <button
              type="button"
              className={pickerTab === "catalogo" ? "active" : ""}
              onClick={() => setPickerTab("catalogo")}
              data-cursor="tab"
            >
              Catálogo
            </button>
            <button
              type="button"
              className={pickerTab === "eventos" ? "active" : ""}
              onClick={() => setPickerTab("eventos")}
              data-cursor="tab"
            >
              Mis eventos
            </button>
          </div>
          {pickerTab === "catalogo" && (
            <input
              className="input"
              placeholder="Buscar espacio…"
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              style={{ maxWidth: 240 }}
            />
          )}
        </div>

        {(pickerTab === "catalogo" ? loadingCat : loadingEv) ? (
          <div className="empty">
            <div className="msg">Cargando…</div>
          </div>
        ) : (
          <div className="studio-grid">
            {(pickerTab === "catalogo" ? filteredCat : misEventos).map((t) => (
              <button
                key={t.key}
                type="button"
                className="studio-tile"
                data-cursor="elegir →"
                onClick={() => {
                  setPicked(t);
                  setPickerOpen(false);
                  setPickerSearch("");
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
      </Modal>
    </>
  );
}

function Section({
  num,
  title,
  sub,
  action,
  children,
}: {
  num: string;
  title: string;
  sub: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="studio-section">
      <div className="head">
        <div>
          <div className="step">
            <span className="num">{num}.</span> {title}
          </div>
          <div className="sub">{sub}</div>
        </div>
        {action}
      </div>
      <div className="body">{children}</div>
    </section>
  );
}
