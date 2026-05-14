"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/badge";
import { PageHead } from "@/components/ui/page-head";
import { Icon } from "@/components/ui/icon";
import { createClient } from "@/lib/supabase/client";
import { TIPOS_EVENTO, CATERING_OPTIONS } from "@/lib/event-options";
import type { ChatMessage, Evento, Venue, Artista } from "@/types/database";

type CanvasMode = "chat" | "split" | "data";

const PRESUPUESTO_MAX_BAR = 100_000;
const PRESUPUESTO_STEP = 1_000;

const INITIAL_GREETING: UIMessage = {
  id: "greeting",
  role: "assistant",
  parts: [
    {
      type: "text",
      text: "Cuéntame qué tienes entre manos. Una frase basta — fecha, ciudad, tipo de evento, presupuesto orientativo.",
    },
  ],
};

function persistedToUI(messages: ChatMessage[]): UIMessage[] {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m, i) => ({
      id: `${m.ts ?? "msg"}-${i}`,
      role: m.role as "user" | "assistant",
      parts: [{ type: "text", text: m.content }],
    }));
}

function uiToText(message: UIMessage): string {
  return (message.parts ?? [])
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

interface VenueCover {
  id: string;
  nombre: string;
  ciudad: string | null;
  tipo: string | null;
  cover: string | null;
}

interface ArtistCover {
  id: string;
  nombre: string;
  genero_musical: string | null;
  cover: string | null;
}

export default function CanvasPage() {
  const params = useParams<{ id: string }>();
  const eventoId = params.id;
  const [mode, setMode] = useState<CanvasMode>("split");
  const [evento, setEvento] = useState<Evento | null>(null);
  const [venue, setVenue] = useState<VenueCover | null>(null);
  const [artistas, setArtistas] = useState<ArtistCover[]>([]);
  const [ciudades, setCiudades] = useState<string[]>([]);
  const [initialMessages, setInitialMessages] = useState<UIMessage[] | null>(null);
  const [input, setInput] = useState("");

  const refetch = useCallback(async () => {
    const supabase = createClient();
    const [eventoRes, ciudadesRes] = await Promise.all([
      supabase.from("eventos").select("*").eq("id", eventoId).single(),
      supabase.from("venues").select("ciudad").eq("estado", "activo").not("ciudad", "is", null),
    ]);

    const ev = eventoRes.data as Evento | null;
    setEvento(ev);

    setCiudades(
      Array.from(
        new Set(
          ((ciudadesRes.data ?? []) as { ciudad: string }[]).map((r) => r.ciudad.trim())
        )
      ).sort()
    );

    if (ev?.venue_id) {
      const { data } = await supabase
        .from("venues")
        .select("id, nombre, ciudad, tipo, images")
        .eq("id", ev.venue_id)
        .single();
      if (data) {
        const imgs = (data.images as { url: string; tag?: string }[] | null) ?? [];
        const principal = imgs.find((i) => i.tag === "principal") ?? imgs[0];
        setVenue({
          id: data.id,
          nombre: data.nombre,
          ciudad: data.ciudad,
          tipo: data.tipo,
          cover: principal?.url ?? null,
        });
      }
    } else {
      setVenue(null);
    }

    const ids = (ev?.artistas_ids as string[] | null) ?? [];
    if (ids.length > 0) {
      const { data } = await supabase
        .from("artistas")
        .select("id, nombre, genero_musical, avatar_url, images")
        .in("id", ids);
      const list = (data ?? []).map((a) => {
        let cover = (a.avatar_url as string | null) ?? null;
        if (!cover) {
          const imgs = (a.images as { url: string }[] | null) ?? [];
          cover = imgs[0]?.url ?? null;
        }
        return {
          id: a.id as string,
          nombre: a.nombre as string,
          genero_musical: a.genero_musical as string | null,
          cover,
        };
      });
      setArtistas(list);
    } else {
      setArtistas([]);
    }

    if (initialMessages === null) {
      const ui = persistedToUI((ev?.messages as ChatMessage[] | null) ?? []);
      setInitialMessages(ui.length > 0 ? ui : [INITIAL_GREETING]);
    }
  }, [eventoId, initialMessages]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (initialMessages === null || !evento) {
    return (
      <div className="empty">
        <div className="msg">Cargando canvas…</div>
      </div>
    );
  }

  return (
    <CanvasInner
      eventoId={eventoId}
      mode={mode}
      setMode={setMode}
      evento={evento}
      venue={venue}
      artistas={artistas}
      ciudades={ciudades}
      initialMessages={initialMessages}
      input={input}
      setInput={setInput}
      onTurnFinished={refetch}
    />
  );
}

function CanvasInner({
  eventoId,
  mode,
  setMode,
  evento,
  venue,
  artistas,
  ciudades,
  initialMessages,
  input,
  setInput,
  onTurnFinished,
}: {
  eventoId: string;
  mode: CanvasMode;
  setMode: (m: CanvasMode) => void;
  evento: Evento;
  venue: VenueCover | null;
  artistas: ArtistCover[];
  ciudades: string[];
  initialMessages: UIMessage[];
  input: string;
  setInput: (s: string) => void;
  onTurnFinished: () => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { messages, sendMessage, status } = useChat({
    messages: initialMessages,
    transport: new DefaultChatTransport({ api: `/api/eventos/${eventoId}/chat` }),
    onFinish: () => onTurnFinished(),
    onError: (err) => console.error("[chat]", err),
  });

  const sending = status === "submitted" || status === "streaming";

  function send() {
    const text = input.trim();
    if (!text || sending) return;
    sendMessage({ text });
    setInput("");
  }

  async function patchEvento(patch: Partial<Evento>) {
    const supabase = createClient();
    await supabase.from("eventos").update(patch).eq("id", eventoId);
    onTurnFinished();
  }

  async function patchBriefField(key: string, value: unknown) {
    const next = { ...(evento.brief ?? {}), [key]: value };
    await patchEvento({ brief: next });
  }

  async function selectVenue(venue_id: string | null) {
    await fetch(`/api/eventos/${eventoId}/select-venue`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ venue_id }),
    });
    onTurnFinished();
  }

  async function addArtist(artist_id: string) {
    await fetch(`/api/eventos/${eventoId}/artistas`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ artist_id }),
    });
    onTurnFinished();
  }

  async function removeArtist(artist_id: string) {
    await fetch(`/api/eventos/${eventoId}/artistas`, {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ artist_id }),
    });
    onTurnFinished();
  }

  const isDraft = evento.estado === "borrador";
  const isSent = evento.estado === "en_propuestas";
  const canSend = isDraft && !!evento.venue_id && !submitting;

  async function enviarSolicitudes() {
    if (!canSend) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/eventos/${eventoId}/enviar`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setSubmitError(body?.error || "No se pudo enviar la solicitud.");
        return;
      }
      await onTurnFinished();
      router.push("/productor/eventos");
    } finally {
      setSubmitting(false);
    }
  }

  const sendLabel = submitting
    ? "Enviando…"
    : isSent
      ? "Solicitud enviada"
      : !evento.venue_id
        ? "Elige un espacio primero"
        : "Enviar solicitud";

  return (
    <>
      <PageHead
        eyebrow="Canvas operativo"
        title={evento.titulo && evento.titulo !== "Evento sin título" ? evento.titulo : "Nuevo evento"}
        sub="Habla con my'G a la izquierda. El brief se rellena solo a la derecha — y tú puedes editar lo que quieras."
        actions={
          <>
            <div className="segmented">
              {(
                [
                  { k: "chat", l: "Chat" },
                  { k: "split", l: "Split" },
                  { k: "data", l: "Datos" },
                ] as const
              ).map((m) => (
                <button
                  key={m.k}
                  type="button"
                  className={mode === m.k ? "active" : ""}
                  onClick={() => setMode(m.k)}
                  data-cursor="cambiar vista"
                >
                  {m.l}
                </button>
              ))}
            </div>
            <Button
              variant="primary"
              disabled={!canSend}
              onClick={enviarSolicitudes}
              data-cursor={canSend ? "enviar →" : undefined}
              title={submitError ?? undefined}
            >
              {sendLabel} <Icon.arrow />
            </Button>
          </>
        }
      />

      {mode === "split" && (
        <div className="canvas-stage">
          <ChatPane
            messages={messages}
            input={input}
            setInput={setInput}
            send={send}
            sending={sending}
            currentVenueId={evento.venue_id}
            currentArtistIds={evento.artistas_ids ?? []}
            onChooseVenue={selectVenue}
            onAddArtist={addArtist}
            onRemoveArtist={removeArtist}
          />
          <BriefPane
            evento={evento}
            venue={venue}
            artistas={artistas}
            ciudades={ciudades}
            onPatch={patchEvento}
            onPatchBrief={patchBriefField}
            onClearVenue={() => selectVenue(null)}
            onRemoveArtist={removeArtist}
          />
        </div>
      )}

      {mode === "chat" && (
        <div className="canvas-stage" style={{ gridTemplateColumns: "1fr" }}>
          <ChatPane
            messages={messages}
            input={input}
            setInput={setInput}
            send={send}
            sending={sending}
            currentVenueId={evento.venue_id}
            currentArtistIds={evento.artistas_ids ?? []}
            onChooseVenue={selectVenue}
            onAddArtist={addArtist}
            onRemoveArtist={removeArtist}
          />
        </div>
      )}

      {mode === "data" && (
        <div className="canvas-stage" style={{ gridTemplateColumns: "1fr" }}>
          <BriefPane
            evento={evento}
            venue={venue}
            artistas={artistas}
            ciudades={ciudades}
            onPatch={patchEvento}
            onPatchBrief={patchBriefField}
            onClearVenue={() => selectVenue(null)}
            onRemoveArtist={removeArtist}
          />
        </div>
      )}
    </>
  );
}

/* ─────────────────────────────────────────── Chat pane ─── */

function ChatPane({
  messages,
  input,
  setInput,
  send,
  sending,
  currentVenueId,
  currentArtistIds,
  onChooseVenue,
  onAddArtist,
  onRemoveArtist,
}: {
  messages: UIMessage[];
  input: string;
  setInput: (s: string) => void;
  send: () => void;
  sending: boolean;
  currentVenueId: string | null;
  currentArtistIds: string[];
  onChooseVenue: (id: string) => void | Promise<void>;
  onAddArtist: (id: string) => void | Promise<void>;
  onRemoveArtist: (id: string) => void | Promise<void>;
}) {
  return (
    <div className="canvas-pane">
      <div className="pane-head">
        <span className="lbl">— Chat</span>
        <Pill variant="accent" dot>
          {sending ? "pensando…" : "en curso"}
        </Pill>
      </div>
      <div className="canvas-chat">
        {messages.map((m) => (
          <ChatMessageBlock
            key={m.id}
            m={m}
            currentVenueId={currentVenueId}
            currentArtistIds={currentArtistIds}
            onChooseVenue={onChooseVenue}
            onAddArtist={onAddArtist}
            onRemoveArtist={onRemoveArtist}
          />
        ))}
        {sending && <Typing />}
      </div>
      <ChatInput input={input} setInput={setInput} send={send} sending={sending} />
    </div>
  );
}

function ChatInput({
  input,
  setInput,
  send,
  sending,
}: {
  input: string;
  setInput: (s: string) => void;
  send: () => void;
  sending: boolean;
}) {
  return (
    <div className="canvas-input">
      <input
        className="input"
        placeholder={sending ? "my'G está respondiendo…" : "Sigue contándome…"}
        value={input}
        disabled={sending}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
      />
      <Button variant="primary" onClick={send} disabled={sending} data-cursor="enviar">
        <Icon.send />
      </Button>
    </div>
  );
}

function ChatMessageBlock({
  m,
  currentVenueId,
  currentArtistIds,
  onChooseVenue,
  onAddArtist,
  onRemoveArtist,
}: {
  m: UIMessage;
  currentVenueId: string | null;
  currentArtistIds: string[];
  onChooseVenue: (id: string) => void | Promise<void>;
  onAddArtist: (id: string) => void | Promise<void>;
  onRemoveArtist: (id: string) => void | Promise<void>;
}) {
  const text = uiToText(m);
  const venueResults = pickToolResults<VenueResult>(m, "tool-search_venues");
  const artistResults = pickToolResults<ArtistResult>(m, "tool-search_artists");

  if (!text && venueResults.length === 0 && artistResults.length === 0) return null;

  return (
    <div className={`msg ${m.role === "user" ? "user" : "ai"}`}>
      {text && <div className="bubble">{text}</div>}

      {venueResults.length > 0 && (
        <div className="tool-cards">
          {venueResults.map((v) => (
            <VenueResultCard
              key={v.id}
              v={v}
              chosen={currentVenueId === v.id}
              onChoose={() => onChooseVenue(v.id)}
            />
          ))}
        </div>
      )}

      {artistResults.length > 0 && (
        <div className="tool-cards">
          {artistResults.map((a) => (
            <ArtistResultCard
              key={a.id}
              a={a}
              chosen={currentArtistIds.includes(a.id)}
              onAdd={() => onAddArtist(a.id)}
              onRemove={() => onRemoveArtist(a.id)}
            />
          ))}
        </div>
      )}

      <div className="meta">{m.role === "user" ? "Tú · ahora" : "my'G · ahora"}</div>
    </div>
  );
}

interface VenueResult {
  id: string;
  nombre: string;
  ciudad: string | null;
  tipo: string | null;
  descripcion_corta: string | null;
  precio_desde: number | null;
  unidad_precio: string | null;
  cover: string | null;
}
interface ArtistResult {
  id: string;
  nombre: string;
  genero_musical: string | null;
  descripcion_corta: string | null;
  verificado: boolean;
  cover: string | null;
}

function pickToolResults<T>(m: UIMessage, type: string): T[] {
  const out: T[] = [];
  for (const part of m.parts ?? []) {
    if (
      "type" in part &&
      part.type === type &&
      "state" in part &&
      part.state === "output-available"
    ) {
      const o = (part as { output?: { ok: boolean; results?: T[] } }).output;
      if (o?.ok && Array.isArray(o.results)) out.push(...o.results);
    }
  }
  return out;
}

function VenueResultCard({
  v,
  chosen,
  onChoose,
}: {
  v: VenueResult;
  chosen: boolean;
  onChoose: () => void;
}) {
  return (
    <div className="tool-card">
      <div className="ph">
        {v.cover && (
          <Image src={v.cover} alt={v.nombre} fill style={{ objectFit: "cover" }} unoptimized />
        )}
      </div>
      <div className="body">
        <h4>{v.nombre}</h4>
        <div className="sub">
          {[v.ciudad, v.tipo].filter(Boolean).join(" · ") || "—"}
          {v.precio_desde && ` · ${v.precio_desde.toLocaleString("es-ES")}€`}
        </div>
        {v.descripcion_corta && <div className="desc">{v.descripcion_corta}</div>}
        <div className="actions">
          <Link
            href={`/productor/explorar/espacios/${v.id}`}
            target="_blank"
            data-cursor="ver ↗"
          >
            Ver
          </Link>
          <button
            type="button"
            className={chosen ? "" : "primary"}
            onClick={onChoose}
            disabled={chosen}
            data-cursor={chosen ? "elegido" : "elegir →"}
          >
            {chosen ? "Elegido ✓" : "Elegir"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ArtistResultCard({
  a,
  chosen,
  onAdd,
  onRemove,
}: {
  a: ArtistResult;
  chosen: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="tool-card">
      <div className="ph">
        {a.cover && (
          <Image src={a.cover} alt={a.nombre} fill style={{ objectFit: "cover" }} unoptimized />
        )}
      </div>
      <div className="body">
        <h4>{a.nombre}</h4>
        <div className="sub">
          {a.genero_musical || "—"}
          {a.verificado && " · ✓ verificado"}
        </div>
        {a.descripcion_corta && <div className="desc">{a.descripcion_corta}</div>}
        <div className="actions">
          <Link
            href={`/productor/explorar/artistas/${a.id}`}
            target="_blank"
            data-cursor="ver ↗"
          >
            Ver
          </Link>
          <button
            type="button"
            className={chosen ? "" : "primary"}
            onClick={chosen ? onRemove : onAdd}
            data-cursor={chosen ? "quitar" : "añadir +"}
          >
            {chosen ? "Quitar" : "Añadir"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Typing() {
  return (
    <div className="msg ai">
      <div className="bubble" style={{ opacity: 0.6 }}>
        …
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── Brief pane ─── */

function BriefPane({
  evento,
  venue,
  artistas,
  ciudades,
  onPatch,
  onPatchBrief,
  onClearVenue,
  onRemoveArtist,
}: {
  evento: Evento;
  venue: VenueCover | null;
  artistas: ArtistCover[];
  ciudades: string[];
  onPatch: (patch: Partial<Evento>) => void | Promise<void>;
  onPatchBrief: (key: string, value: unknown) => void | Promise<void>;
  onClearVenue: () => void | Promise<void>;
  onRemoveArtist: (id: string) => void | Promise<void>;
}) {
  const hasTitle = !!evento.titulo && evento.titulo !== "Evento sin título";
  const filledCount = useMemo(() => {
    let n = 0;
    if (hasTitle) n++;
    if (evento.tipo) n++;
    if (evento.ciudad) n++;
    if (evento.fecha_deseada) n++;
    if (evento.num_personas) n++;
    if (evento.presupuesto_min !== null || evento.presupuesto_max !== null) n++;
    if (evento.brief?.catering) n++;
    if (evento.venue_id) n++;
    if ((evento.artistas_ids?.length ?? 0) > 0) n++;
    return n;
  }, [evento, hasTitle]);

  return (
    <div className="canvas-pane">
      <div className="pane-head">
        <span className="lbl">— Brief estructurado</span>
        <span className="text-mute">9 campos · {filledCount} completos</span>
      </div>
      <div className="canvas-data">
        <BriefTextRow
          label="Título"
          value={hasTitle ? evento.titulo : ""}
          placeholder="Ponle un nombre…"
          onCommit={(v) => onPatch({ titulo: v.trim() || "Evento sin título" })}
        />
        <BriefSelectRow
          label="Tipo"
          value={evento.tipo ?? ""}
          options={TIPOS_EVENTO}
          placeholder="Elige tipo…"
          onChange={(v) => onPatch({ tipo: v || null })}
        />
        <BriefSelectRow
          label="Ciudad"
          value={evento.ciudad ?? ""}
          options={ciudades.map((c) => ({ value: c, label: c }))}
          placeholder="Elige ciudad…"
          onChange={(v) => onPatch({ ciudad: v || null })}
        />
        <BriefDateRow
          label="Fecha"
          value={evento.fecha_deseada ?? ""}
          onChange={(v) => onPatch({ fecha_deseada: v || null })}
        />
        <BriefNumberRow
          label="Personas"
          hint="aprox."
          value={evento.num_personas}
          min={1}
          onChange={(n) => onPatch({ num_personas: n })}
        />
        <BriefBudgetRow
          min={evento.presupuesto_min}
          max={evento.presupuesto_max}
          onChange={(min, max) =>
            onPatch({ presupuesto_min: min, presupuesto_max: max })
          }
        />
        <BriefSegmentRow
          label="Catering"
          value={(evento.brief?.catering as string | undefined) ?? ""}
          options={CATERING_OPTIONS}
          onChange={(v) => onPatchBrief("catering", v || null)}
        />
        <BriefVenueRow venue={venue} onClear={onClearVenue} />
        <BriefArtistsRow artistas={artistas} onRemove={onRemoveArtist} />
      </div>
    </div>
  );
}

function BriefTextRow({
  label,
  value,
  placeholder,
  onCommit,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onCommit: (v: string) => void;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => {
    setLocal(value);
  }, [value]);
  return (
    <div className="brief-row">
      <span className="lbl">— {label.toUpperCase()}</span>
      <div className="brief-control">
        <input
          type="text"
          value={local}
          placeholder={placeholder}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={() => {
            if (local !== value) onCommit(local);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
        />
      </div>
    </div>
  );
}

function BriefSelectRow({
  label,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="brief-row">
      <span className="lbl">— {label.toUpperCase()}</span>
      <div className="brief-control">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function BriefDateRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="brief-row">
      <span className="lbl">— {label.toUpperCase()}</span>
      <div className="brief-control">
        <input
          type="date"
          min={today}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

function BriefNumberRow({
  label,
  hint,
  value,
  min,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number | null;
  min?: number;
  onChange: (v: number | null) => void;
}) {
  return (
    <div className="brief-row">
      <span className="lbl">— {label.toUpperCase()}</span>
      <div className="brief-control">
        <input
          type="number"
          min={min}
          value={value ?? ""}
          placeholder="—"
          onChange={(e) => {
            const v = e.target.value.trim();
            if (v === "") return onChange(null);
            const n = Number(v);
            if (Number.isFinite(n)) onChange(n);
          }}
        />
        {hint && <span className="hint">{hint}</span>}
      </div>
    </div>
  );
}

function BriefBudgetRow({
  min,
  max,
  onChange,
}: {
  min: number | null;
  max: number | null;
  onChange: (min: number | null, max: number | null) => void;
}) {
  // Local mirror so dragging is smooth; we commit onChange on mouseup.
  const [localMin, setLocalMin] = useState<number>(min ?? 0);
  const [localMax, setLocalMax] = useState<number>(max ?? PRESUPUESTO_MAX_BAR);

  useEffect(() => {
    setLocalMin(min ?? 0);
    setLocalMax(max ?? PRESUPUESTO_MAX_BAR);
  }, [min, max]);

  function commit() {
    const lo = Math.min(localMin, localMax);
    const hi = Math.max(localMin, localMax);
    onChange(lo > 0 ? lo : null, hi < PRESUPUESTO_MAX_BAR ? hi : null);
  }

  return (
    <div className="brief-row">
      <span className="lbl">— PRESUPUESTO</span>
      <div className="brief-control">
        <div className="budget-range">
          <div className="col">
            <label>Mín</label>
            <input
              type="range"
              min={0}
              max={PRESUPUESTO_MAX_BAR}
              step={PRESUPUESTO_STEP}
              value={localMin}
              onChange={(e) => setLocalMin(Number(e.target.value))}
              onMouseUp={commit}
              onTouchEnd={commit}
              onKeyUp={commit}
            />
            <span className="readout">{localMin.toLocaleString("es-ES")}€</span>
          </div>
          <div className="col">
            <label>Máx</label>
            <input
              type="range"
              min={0}
              max={PRESUPUESTO_MAX_BAR}
              step={PRESUPUESTO_STEP}
              value={localMax}
              onChange={(e) => setLocalMax(Number(e.target.value))}
              onMouseUp={commit}
              onTouchEnd={commit}
              onKeyUp={commit}
            />
            <span className="readout">
              {localMax >= PRESUPUESTO_MAX_BAR ? "100k+" : `${localMax.toLocaleString("es-ES")}€`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BriefSegmentRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="brief-row">
      <span className="lbl">— {label.toUpperCase()}</span>
      <div className="brief-control">
        <div className="brief-segment">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              className={value === o.value ? "active" : ""}
              onClick={() => onChange(value === o.value ? "" : o.value)}
              data-cursor="seleccionar"
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function BriefVenueRow({
  venue,
  onClear,
}: {
  venue: VenueCover | null;
  onClear: () => void | Promise<void>;
}) {
  return (
    <div className="brief-row relational">
      <span className="lbl">— ESPACIO</span>
      <div className="brief-pick">
        {venue ? (
          <div className="chosen">
            <div
              className="thumb"
              style={venue.cover ? { backgroundImage: `url(${venue.cover})` } : undefined}
            />
            <div className="meta">
              <span className="nm">{venue.nombre}</span>
              <span className="sub">
                {[venue.ciudad, venue.tipo].filter(Boolean).join(" · ") || "—"}
              </span>
            </div>
            <button type="button" onClick={onClear} data-cursor="quitar">
              Quitar
            </button>
          </div>
        ) : (
          <div className="empty">Pídele a my&apos;G que sugiera espacios para elegir uno.</div>
        )}
      </div>
    </div>
  );
}

function BriefArtistsRow({
  artistas,
  onRemove,
}: {
  artistas: ArtistCover[];
  onRemove: (id: string) => void | Promise<void>;
}) {
  return (
    <div className="brief-row relational">
      <span className="lbl">— MÚSICA</span>
      <div className="brief-pick">
        {artistas.length === 0 ? (
          <div className="empty">Sin artistas. Pídele a my&apos;G que sugiera.</div>
        ) : (
          <div className="chosen-list">
            {artistas.map((a) => (
              <div className="chosen" key={a.id}>
                <div
                  className="thumb"
                  style={a.cover ? { backgroundImage: `url(${a.cover})` } : undefined}
                />
                <div className="meta">
                  <span className="nm">{a.nombre}</span>
                  <span className="sub">{a.genero_musical || "—"}</span>
                </div>
                <button type="button" onClick={() => onRemove(a.id)} data-cursor="quitar">
                  Quitar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Re-exports kept so other files can keep importing the same types.
export type { Venue, Artista };
