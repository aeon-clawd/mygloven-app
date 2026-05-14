import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from "ai";
import { createClient } from "@/lib/supabase/server";
import { google, CHAT_MODEL } from "@/lib/ai/google";
import { buildTools, buildSystemPrompt } from "@/lib/ai/tools";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { messages }: { messages: UIMessage[] } = await req.json();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: evento, error } = await supabase
    .from("eventos")
    .select(
      "id, cliente_id, tipo, ciudad, fecha_deseada, num_personas, presupuesto_min, presupuesto_max, venue_id, venue_annex_id, artistas_ids, brief"
    )
    .eq("id", id)
    .single();
  if (error || !evento) return new Response("Evento not found", { status: 404 });
  if (evento.cliente_id !== user.id) return new Response("Forbidden", { status: 403 });

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return new Response(
      "Falta GOOGLE_GENERATIVE_AI_API_KEY en .env.local. Genera una key en https://aistudio.google.com/apikey y reinicia el servidor.",
      { status: 500 }
    );
  }

  const { data: ciudadesRows } = await supabase
    .from("venues")
    .select("ciudad")
    .eq("estado", "activo")
    .not("ciudad", "is", null);
  const ciudades = Array.from(
    new Set(((ciudadesRows ?? []) as { ciudad: string }[]).map((r) => r.ciudad.trim()))
  ).sort();

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: google(CHAT_MODEL),
    system: buildSystemPrompt(
      {
        tipo: evento.tipo,
        ciudad: evento.ciudad,
        fecha_deseada: evento.fecha_deseada,
        num_personas: evento.num_personas,
        presupuesto_min: evento.presupuesto_min,
        presupuesto_max: evento.presupuesto_max,
        venue_id: evento.venue_id,
        venue_annex_id: evento.venue_annex_id,
        artistas_ids: (evento.artistas_ids as string[] | null) ?? [],
        brief: (evento.brief as { catering?: string }) ?? {},
      },
      ciudades
    ),
    messages: modelMessages,
    tools: buildTools(supabase, id),
    stopWhen: stepCountIs(6),
    onFinish: async ({ text }) => {
      const lastUser = messages[messages.length - 1];
      const userText = extractText(lastUser);
      const { data: cur } = await supabase
        .from("eventos")
        .select("messages")
        .eq("id", id)
        .single();
      const prior = (cur?.messages as unknown[]) ?? [];
      const ts = new Date().toISOString();
      await supabase
        .from("eventos")
        .update({
          messages: [
            ...prior,
            { role: "user", content: userText, ts },
            { role: "assistant", content: text, ts },
          ],
        })
        .eq("id", id);
    },
  });

  return result.toUIMessageStreamResponse();
}

function extractText(message: UIMessage | undefined): string {
  if (!message) return "";
  return (message.parts ?? [])
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}
