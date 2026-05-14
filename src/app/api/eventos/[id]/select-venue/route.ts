import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Picks an annex (sub-space) for the event. Derives venue_id from the annex.
 * Pass `annex_id: null` to clear the selection. (`venue_id` payload is kept
 * accepted for backwards compatibility but is treated as "set venue without
 * a specific annex" — used only when there is no annex_id.)
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await req.json()) as {
    annex_id?: string | null;
    venue_id?: string | null;
  };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: ev } = await supabase
    .from("eventos")
    .select("cliente_id")
    .eq("id", id)
    .single();
  if (!ev || ev.cliente_id !== user.id) return new Response("Forbidden", { status: 403 });

  let venue_id: string | null = null;
  let venue_annex_id: string | null = null;

  if (body.annex_id) {
    const { data: annex, error: annexErr } = await supabase
      .from("venue_annexes")
      .select("id, venue_id")
      .eq("id", body.annex_id)
      .single();
    if (annexErr || !annex) {
      return NextResponse.json({ ok: false, error: "Annex no encontrado" }, { status: 404 });
    }
    venue_annex_id = annex.id;
    venue_id = annex.venue_id;
  } else if (body.venue_id) {
    venue_id = body.venue_id;
  }

  const { error } = await supabase
    .from("eventos")
    .update({ venue_id, venue_annex_id })
    .eq("id", id);
  if (error) return new Response(error.message, { status: 500 });

  return NextResponse.json({ ok: true, venue_id, venue_annex_id });
}
