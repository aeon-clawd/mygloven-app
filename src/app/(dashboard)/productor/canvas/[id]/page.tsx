"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/badge";
import { PageHead } from "@/components/ui/page-head";
import { Icon } from "@/components/ui/icon";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage, EventoBrief } from "@/types/database";

type CanvasMode = "chat" | "split" | "data";

const BRIEF_FIELDS: { key: keyof EventoBrief; label: string; type?: "number" }[] = [
  { key: "tipo", label: "Tipo" },
  { key: "ciudad", label: "Ciudad" },
  { key: "fecha", label: "Fecha" },
  { key: "personas", label: "Personas", type: "number" },
  { key: "presupuesto", label: "Presupuesto", type: "number" },
  { key: "atmosfera", label: "Atmósfera" },
  { key: "espacio", label: "Espacio" },
  { key: "catering", label: "Catering" },
  { key: "musica", label: "Música" },
];

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

export default function CanvasPage() {
  const params = useParams<{ id: string }>();
  const eventoId = params.id;
  const [mode, setMode] = useState<CanvasMode>("split");
  const [brief, setBrief] = useState<EventoBrief>({});
  const [initialMessages, setInitialMessages] = useState<UIMessage[] | null>(null);
  const [input, setInput] = useState("");

  const refetchEvento = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("eventos")
      .select("brief, messages")
      .eq("id", eventoId)
      .single();
    if (data?.brief) setBrief(data.brief as EventoBrief);
    if (data?.messages !== undefined && initialMessages === null) {
      const ui = persistedToUI(data.messages as ChatMessage[]);
      setInitialMessages(ui.length > 0 ? ui : [INITIAL_GREETING]);
    }
  }, [eventoId, initialMessages]);

  useEffect(() => {
    refetchEvento();
  }, [refetchEvento]);

  // Wait until we know whether there are persisted messages before mounting the chat.
  if (initialMessages === null) {
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
      brief={brief}
      setBrief={setBrief}
      initialMessages={initialMessages}
      input={input}
      setInput={setInput}
      onTurnFinished={refetchEvento}
    />
  );
}

function CanvasInner({
  eventoId,
  mode,
  setMode,
  brief,
  setBrief,
  initialMessages,
  input,
  setInput,
  onTurnFinished,
}: {
  eventoId: string;
  mode: CanvasMode;
  setMode: (m: CanvasMode) => void;
  brief: EventoBrief;
  setBrief: (b: EventoBrief) => void;
  initialMessages: UIMessage[];
  input: string;
  setInput: (s: string) => void;
  onTurnFinished: () => void;
}) {
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

  async function patchBriefField(field: keyof EventoBrief, value: string | number | null) {
    const next = { ...brief, [field]: value };
    setBrief(next);
    const supabase = createClient();
    await supabase.from("eventos").update({ brief: next }).eq("id", eventoId);
  }

  const filledCount = BRIEF_FIELDS.filter((f) => brief[f.key]).length;

  return (
    <>
      <PageHead
        eyebrow="Canvas operativo"
        title="Nuevo evento"
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
            <Button variant="primary" disabled data-cursor="enviar →">
              Enviar solicitudes <Icon.arrow />
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
          />
          <BriefPane brief={brief} filledCount={filledCount} onChange={patchBriefField} />
        </div>
      )}

      {mode === "chat" && (
        <div
          className="canvas-pane"
          style={{ borderRadius: 4, minHeight: "65vh", display: "flex", flexDirection: "column" }}
        >
          <div className="canvas-chat" style={{ minHeight: "55vh" }}>
            {messages.map((m) => (
              <ChatBubble key={m.id} m={m} />
            ))}
            {sending && <Typing />}
          </div>
          <ChatInput input={input} setInput={setInput} send={send} sending={sending} />
        </div>
      )}

      {mode === "data" && (
        <div className="card raised">
          {BRIEF_FIELDS.map((f) => (
            <BriefRow
              key={String(f.key)}
              field={f}
              value={brief[f.key]}
              onChange={(v) => patchBriefField(f.key, v)}
            />
          ))}
        </div>
      )}
    </>
  );
}

function ChatPane({
  messages,
  input,
  setInput,
  send,
  sending,
}: {
  messages: UIMessage[];
  input: string;
  setInput: (s: string) => void;
  send: () => void;
  sending: boolean;
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
          <ChatBubble key={m.id} m={m} />
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

function BriefPane({
  brief,
  filledCount,
  onChange,
}: {
  brief: EventoBrief;
  filledCount: number;
  onChange: (field: keyof EventoBrief, value: string | number | null) => void;
}) {
  return (
    <div className="canvas-pane">
      <div className="pane-head">
        <span className="lbl">— Brief estructurado</span>
        <span className="text-mute">
          {BRIEF_FIELDS.length} campos · {filledCount} completos
        </span>
      </div>
      <div className="canvas-data">
        {BRIEF_FIELDS.map((f) => (
          <BriefRow
            key={String(f.key)}
            field={f}
            value={brief[f.key]}
            onChange={(v) => onChange(f.key, v)}
          />
        ))}
      </div>
    </div>
  );
}

function BriefRow({
  field,
  value,
  onChange,
}: {
  field: { key: keyof EventoBrief; label: string; type?: "number" };
  value: unknown;
  onChange: (value: string | number | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string>(value !== null && value !== undefined ? String(value) : "");

  useEffect(() => {
    if (!editing) {
      setDraft(value !== null && value !== undefined ? String(value) : "");
    }
  }, [value, editing]);

  function commit() {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed === "") {
      onChange(null);
      return;
    }
    if (field.type === "number") {
      const n = Number(trimmed);
      if (Number.isFinite(n)) onChange(n);
      return;
    }
    onChange(trimmed);
  }

  return (
    <div className="brief-row" onClick={() => setEditing(true)}>
      <span className="lbl">— {field.label.toUpperCase()}</span>
      {editing ? (
        <input
          className="input"
          autoFocus
          value={draft}
          type={field.type === "number" ? "number" : "text"}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setEditing(false);
          }}
          style={{ flex: 1, marginLeft: 12 }}
        />
      ) : value !== null && value !== undefined && value !== "" ? (
        <span className="val">{String(value)}</span>
      ) : (
        <span className="val empty">— sin completar —</span>
      )}
    </div>
  );
}

function ChatBubble({ m }: { m: UIMessage }) {
  const text = uiToText(m);
  if (!text) return null;
  return (
    <div className={`msg ${m.role === "user" ? "user" : "ai"}`}>
      <div className="bubble">{text}</div>
      <div className="meta">{m.role === "user" ? "Tú · ahora" : "my'G · ahora"}</div>
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
