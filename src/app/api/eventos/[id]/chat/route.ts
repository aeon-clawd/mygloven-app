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
    .select("id, cliente_id, brief")
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

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: google(CHAT_MODEL),
    system: buildSystemPrompt((evento.brief as Record<string, unknown>) ?? {}),
    messages: modelMessages,
    tools: buildTools(supabase, id),
    stopWhen: stepCountIs(5),
    onFinish: async ({ text }) => {
      // Persist the full UI message thread + the assistant response.
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
