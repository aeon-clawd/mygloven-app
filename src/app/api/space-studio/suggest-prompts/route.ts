import { NextResponse } from "next/server";
import { generateText } from "ai";
import { createClient } from "@/lib/supabase/server";
import { google, CHAT_MODEL } from "@/lib/ai/google";

export const runtime = "nodejs";
export const maxDuration = 30;

interface SuggestBody {
  evento_id?: string | null;
  venue_annex_id?: string | null;
  venue_id?: string | null;
}

export async function POST(req: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return NextResponse.json(
      { ok: false, error: "Falta GOOGLE_GENERATIVE_AI_API_KEY." },
      { status: 500 }
    );
  }

  const body = (await req.json()) as SuggestBody;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const context: string[] = [];

  if (body.evento_id) {
    const { data: ev } = await supabase
      .from("eventos")
      .select(
        "titulo, tipo, ciudad, num_personas, presupuesto_min, presupuesto_max, brief"
      )
      .eq("id", body.evento_id)
      .single();
    if (ev) {
      if (ev.titulo) context.push(`Evento: ${ev.titulo}`);
      if (ev.tipo) context.push(`Tipo: ${ev.tipo}`);
      if (ev.ciudad) context.push(`Ciudad: ${ev.ciudad}`);
      if (ev.num_personas) context.push(`Personas aprox: ${ev.num_personas}`);
      if (ev.presupuesto_min || ev.presupuesto_max) {
        context.push(
          `Presupuesto: ${ev.presupuesto_min ?? "?"}€ – ${ev.presupuesto_max ?? "?"}€`
        );
      }
      const cat = (ev.brief as { catering?: string } | null)?.catering;
      if (cat) context.push(`Catering: ${cat}`);
    }
  }

  if (body.venue_annex_id) {
    const { data: annex } = await supabase
      .from("venue_annexes")
      .select(
        "nombre, tipo_espacio, tipos_evento, config_de_pie, config_sentado, metros_cuadrados, venue_id"
      )
      .eq("id", body.venue_annex_id)
      .single();
    if (annex) {
      context.push(`Espacio (annex): ${annex.nombre}`);
      if (annex.tipo_espacio) context.push(`Tipo de espacio: ${annex.tipo_espacio}`);
      if ((annex.tipos_evento ?? []).length > 0)
        context.push(`Eventos compatibles: ${(annex.tipos_evento ?? []).join(", ")}`);
      const cap = Math.max(annex.config_de_pie ?? 0, annex.config_sentado ?? 0);
      if (cap) context.push(`Aforo máx: ${cap}`);
      if (annex.metros_cuadrados) context.push(`Metros: ${annex.metros_cuadrados}`);

      if (annex.venue_id) {
        const { data: venue } = await supabase
          .from("venues")
          .select("nombre, ciudad, descripcion_corta, descripcion")
          .eq("id", annex.venue_id)
          .single();
        if (venue) {
          context.push(`Venue: ${venue.nombre}${venue.ciudad ? `, ${venue.ciudad}` : ""}`);
          if (venue.descripcion_corta) context.push(`Descripción: ${venue.descripcion_corta}`);
        }
      }
    }
  } else if (body.venue_id) {
    const { data: venue } = await supabase
      .from("venues")
      .select("nombre, ciudad, descripcion_corta, descripcion")
      .eq("id", body.venue_id)
      .single();
    if (venue) {
      context.push(`Venue: ${venue.nombre}${venue.ciudad ? `, ${venue.ciudad}` : ""}`);
      if (venue.descripcion_corta) context.push(`Descripción: ${venue.descripcion_corta}`);
    }
  }

  const ctxBlock = context.join("\n") || "(sin contexto adicional)";

  const { text } = await generateText({
    model: google(CHAT_MODEL),
    prompt: `Eres un asistente que ayuda a productores de eventos a visualizar cómo quedaría montado un espacio. Te paso el contexto del evento y/o del espacio. Genera 3 prompts breves (1 frase cada uno, máx 25 palabras, en español) que un productor podría usar para pedirle a una IA de imagen cómo montar el espacio. Variedad: estilos/atmósferas distintos. Sin numeración, sin guiones, sin emojis, sin comillas — uno por línea.

Contexto:
${ctxBlock}

Prompts:`,
  });

  const suggestions = text
    .split("\n")
    .map((l) => l.replace(/^[-*0-9.\s]+/, "").trim())
    .filter((l) => l.length > 0)
    .slice(0, 3);

  return NextResponse.json({ ok: true, suggestions });
}
