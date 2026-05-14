import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: ev, error: evErr } = await supabase
    .from("eventos")
    .select("id, cliente_id, estado, venue_id, fecha_deseada, num_personas")
    .eq("id", id)
    .single();
  if (evErr || !ev) return new Response("Evento no encontrado", { status: 404 });
  if (ev.cliente_id !== user.id) return new Response("Forbidden", { status: 403 });

  if (!ev.venue_id) {
    return NextResponse.json(
      { ok: false, error: "Elige un espacio antes de enviar la solicitud." },
      { status: 400 }
    );
  }
  if (ev.estado !== "borrador") {
    return NextResponse.json(
      { ok: false, error: "Este evento ya no está en borrador." },
      { status: 409 }
    );
  }

  const { data: existing } = await supabase
    .from("solicitudes")
    .select("id")
    .eq("evento_id", id)
    .eq("venue_id", ev.venue_id)
    .maybeSingle();

  if (!existing) {
    const { error: insErr } = await supabase.from("solicitudes").insert({
      evento_id: id,
      venue_id: ev.venue_id,
      productor_id: user.id,
      estado: "pendiente",
      fecha_evento: ev.fecha_deseada,
      num_personas: ev.num_personas,
    });
    if (insErr) return new Response(insErr.message, { status: 500 });
  }

  const { error: updErr } = await supabase
    .from("eventos")
    .update({ estado: "en_propuestas" })
    .eq("id", id);
  if (updErr) return new Response(updErr.message, { status: 500 });

  return NextResponse.json({ ok: true });
}
