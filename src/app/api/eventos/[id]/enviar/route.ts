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
    .select("id, cliente_id, estado, venue_id, fecha_deseada, num_personas, artistas_ids")
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

  const { data: existingVenue } = await supabase
    .from("solicitudes")
    .select("id")
    .eq("evento_id", id)
    .eq("venue_id", ev.venue_id)
    .maybeSingle();

  if (!existingVenue) {
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

  const artistIds = (ev.artistas_ids as string[] | null) ?? [];
  if (artistIds.length > 0) {
    const { data: existingArt } = await supabase
      .from("solicitudes_artistas")
      .select("artista_id")
      .eq("evento_id", id)
      .in("artista_id", artistIds);
    const sentTo = new Set((existingArt ?? []).map((r) => r.artista_id as string));
    const toInsert = artistIds
      .filter((aid) => !sentTo.has(aid))
      .map((aid) => ({
        evento_id: id,
        artista_id: aid,
        productor_id: user.id,
        estado: "pendiente",
        fecha_evento: ev.fecha_deseada,
      }));
    if (toInsert.length > 0) {
      const { error: artErr } = await supabase
        .from("solicitudes_artistas")
        .insert(toInsert);
      if (artErr) return new Response(artErr.message, { status: 500 });
    }
  }

  const { error: updErr } = await supabase
    .from("eventos")
    .update({ estado: "en_propuestas" })
    .eq("id", id);
  if (updErr) return new Response(updErr.message, { status: 500 });

  return NextResponse.json({ ok: true });
}
