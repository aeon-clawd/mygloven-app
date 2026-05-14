import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type Decision = "aceptada" | "rechazada";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    decision?: Decision;
    mensaje?: string;
  };
  const decision = body.decision;
  const mensaje = (body.mensaje ?? "").trim();

  if (decision !== "aceptada" && decision !== "rechazada") {
    return NextResponse.json({ ok: false, error: "decision inválida" }, { status: 400 });
  }
  if (decision === "rechazada" && mensaje.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Indica el motivo del rechazo." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: sol, error: solErr } = await supabase
    .from("solicitudes")
    .select("id, estado, venue_id, venues!solicitudes_venue_id_fkey(owner_id)")
    .eq("id", id)
    .single();
  if (solErr || !sol) return new Response("Solicitud no encontrada", { status: 404 });

  const ownerId = Array.isArray(sol.venues)
    ? sol.venues[0]?.owner_id
    : (sol.venues as { owner_id?: string } | null)?.owner_id;
  if (ownerId !== user.id) return new Response("Forbidden", { status: 403 });

  if (sol.estado !== "pendiente" && sol.estado !== "info_solicitada") {
    return NextResponse.json(
      { ok: false, error: "Esta solicitud ya está cerrada." },
      { status: 409 }
    );
  }

  const { error: updErr } = await supabase
    .from("solicitudes")
    .update({
      estado: decision,
      respuesta_espacio: mensaje.length > 0 ? mensaje : null,
    })
    .eq("id", id);
  if (updErr) return new Response(updErr.message, { status: 500 });

  return NextResponse.json({ ok: true });
}
