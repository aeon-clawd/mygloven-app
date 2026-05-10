"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/badge";
import { PageHead } from "@/components/ui/page-head";
import { Icon } from "@/components/ui/icon";

type CanvasMode = "chat" | "split" | "data";

interface ChatMsg {
  who: "user" | "ai";
  text: string;
}

const SAMPLE_CHAT: ChatMsg[] = [
  {
    who: "ai",
    text: "Cuéntame qué tienes entre manos. Una frase basta para empezar — fecha, ciudad, tipo de evento, presupuesto orientativo.",
  },
];

const EMPTY_BRIEF: Record<string, string | null> = {
  TIPO: null,
  CIUDAD: null,
  FECHA: null,
  PERSONAS: null,
  PRESUPUESTO: null,
  ATMÓSFERA: null,
  ESPACIO: null,
  CATERING: null,
  MÚSICA: null,
};

export default function CanvasPage() {
  const [mode, setMode] = useState<CanvasMode>("split");
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState<ChatMsg[]>(SAMPLE_CHAT);
  const [brief] = useState(EMPTY_BRIEF);

  function send() {
    if (!msg.trim()) return;
    // TODO: cablear con backend RAG real cuando esté listo.
    setChat((c) => [
      ...c,
      { who: "user", text: msg },
      { who: "ai", text: "Recibido. Sigo escuchando — el RAG real se conectará pronto." },
    ]);
    setMsg("");
  }

  const filledCount = Object.values(brief).filter(Boolean).length;
  const totalCount = Object.keys(brief).length;

  return (
    <>
      <PageHead
        eyebrow="Canvas operativo"
        title="Nuevo evento"
        sub="Habla con my'G en lenguaje natural a la izquierda. Mira los datos estructurarse a la derecha."
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
          <ChatPane chat={chat} msg={msg} setMsg={setMsg} send={send} />
          <BriefPane brief={brief} filledCount={filledCount} totalCount={totalCount} />
        </div>
      )}

      {mode === "chat" && (
        <div
          className="canvas-pane"
          style={{ borderRadius: 4, minHeight: "65vh", display: "flex", flexDirection: "column" }}
        >
          <div className="canvas-chat" style={{ minHeight: "55vh" }}>
            {chat.map((m, i) => (
              <ChatBubble key={i} m={m} />
            ))}
          </div>
          <div className="canvas-input">
            <input
              className="input"
              placeholder="Sigue contándome…"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <Button variant="primary" onClick={send} data-cursor="enviar">
              <Icon.send />
            </Button>
          </div>
        </div>
      )}

      {mode === "data" && (
        <div className="card raised">
          {Object.entries(brief).map(([k, v]) => (
            <div key={k} className="brief-row">
              <span className="lbl">— {k}</span>
              {v ? (
                <span className="val">{v}</span>
              ) : (
                <span className="val empty">— sin completar —</span>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function ChatPane({
  chat,
  msg,
  setMsg,
  send,
}: {
  chat: ChatMsg[];
  msg: string;
  setMsg: (s: string) => void;
  send: () => void;
}) {
  return (
    <div className="canvas-pane">
      <div className="pane-head">
        <span className="lbl">— Chat</span>
        <Pill variant="accent" dot>
          en curso
        </Pill>
      </div>
      <div className="canvas-chat">
        {chat.map((m, i) => (
          <ChatBubble key={i} m={m} />
        ))}
      </div>
      <div className="canvas-input">
        <input
          className="input"
          placeholder="Sigue contándome…"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <Button variant="primary" onClick={send} data-cursor="enviar">
          <Icon.send />
        </Button>
      </div>
    </div>
  );
}

function BriefPane({
  brief,
  filledCount,
  totalCount,
}: {
  brief: Record<string, string | null>;
  filledCount: number;
  totalCount: number;
}) {
  return (
    <div className="canvas-pane">
      <div className="pane-head">
        <span className="lbl">— Brief estructurado</span>
        <span className="text-mute">
          {totalCount} campos · {filledCount} completos
        </span>
      </div>
      <div className="canvas-data">
        {Object.entries(brief).map(([k, v]) => (
          <div key={k} className="brief-row">
            <span className="lbl">— {k}</span>
            {v ? <span className="val">{v}</span> : <span className="val empty">— sin completar —</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatBubble({ m }: { m: ChatMsg }) {
  return (
    <div className={`msg ${m.who}`}>
      <div className="bubble">{m.text}</div>
      <div className="meta">{m.who === "user" ? "Tú · ahora" : "my'G · ahora"}</div>
    </div>
  );
}
